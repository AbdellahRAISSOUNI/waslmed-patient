import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import MedicalRecord from '@/models/MedicalRecord';

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyAaPd4OJxokEYKdpETKXchoXxVJ4kdysS4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Define conversation types at the top of the file
const CONVERSATION_TYPES = {
  HEALTH_EDUCATION: 'health_education'
};

/**
 * Helper function to generate a system prompt for health education based on user profile
 */
const generateSystemPrompt = async (userId: string, contentType: string, topic?: string) => {
  try {
    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: userId });
    
    if (!medicalRecord) {
      return "You are a health education assistant for WaslMed healthcare platform. Create engaging and accurate health education content. I don't have access to the user's medical record, so please provide general health education.";
    }
    
    // Extract relevant information from medical record
    const { personalInfo, conditions, allergies, medications } = medicalRecord;
    
    // Basic personal info
    let ageInfo = '';
    if (personalInfo?.dateOfBirth) {
      const birthDate = new Date(personalInfo.dateOfBirth);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      ageInfo = `${age} years old`;
    }
    
    const gender = personalInfo?.gender || 'unknown gender';
    
    // Format conditions and medications for context
    const conditionInfo = conditions?.length 
      ? `Medical conditions: ${conditions.map((c: { name: string }) => c.name).join(', ')}`
      : 'No known medical conditions';
    
    const medicationInfo = medications?.length 
      ? `Current medications: ${medications.map((m: { name: string }) => m.name).join(', ')}`
      : 'No current medications';
    
    // Customize system prompt based on content type
    let specializedInstruction = '';
    
    switch (contentType) {
      case 'article':
        specializedInstruction = "Create a personalized health education article that is engaging, accurate, and relevant to the user's health profile. Include factual information, practical advice, and cite reputable sources where appropriate.";
        break;
      case 'video':
        specializedInstruction = "Create a detailed script for a health education video that explains concepts clearly and visually. Include descriptions of what should be shown on screen along with the narration.";
        break;
      case 'simulation':
        specializedInstruction = "Design a virtual reality medical procedure simulation that explains the procedure steps, what the patient will experience, and important preparation or aftercare information.";
        break;
      case 'game':
        specializedInstruction = "Create a gamified health learning module with clear objectives, rules, challenges, rewards, and educational content that makes learning about health engaging and memorable.";
        break;
      case 'plan':
        specializedInstruction = "Develop a customized wellness plan with specific, achievable goals, activities, timelines, and metrics for tracking progress. Tailor the plan to the user's specific health profile.";
        break;
      default:
        specializedInstruction = "Create educational health content that is accurate, engaging, and relevant to the user's health profile.";
    }
    
    if (topic) {
      specializedInstruction += ` Focus specifically on the topic of ${topic}.`;
    }
    
    // Create the final system prompt
    return `You are a health education specialist for the WaslMed healthcare platform. You have access to the following information about the user:

Patient profile: ${gender}, ${ageInfo}
${conditionInfo}
${medicationInfo}

${specializedInstruction}

Important guidelines:
1. Content should be evidence-based and medically accurate
2. Use clear, simple language appropriate for general audiences
3. Be sensitive to the user's specific health conditions
4. Provide practical, actionable information
5. Be engaging and motivational
6. Structure content clearly with sections, bullet points, or steps where appropriate
7. Respect patient privacy and maintain confidentiality`;
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return "You are a health education specialist for WaslMed healthcare platform. Create engaging and accurate health education content with clear structure and practical value.";
  }
};

/**
 * POST - Create new health education content
 */
export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if the AIConversation model is registered, and if not, register it
    if (!mongoose.models.AIConversation) {
      try {
        console.log('Registering AIConversation model...');
        // Import the schema directly to ensure it's using the latest definition
        const AIConversationSchema = require('@/models/AIConversation').default.schema;
        mongoose.model('AIConversation', AIConversationSchema);
      } catch (error) {
        console.error('Error registering AIConversation model:', error);
      }
    }
    
    // Get request data
    const data = await req.json();
    const { 
      contentType, 
      topic, 
      additionalInfo = '',
      conversationId 
    } = data;
    
    if (!contentType || !['article', 'video', 'simulation', 'game', 'plan'].includes(contentType)) {
      return NextResponse.json({ error: 'Valid content type is required' }, { status: 400 });
    }
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Retrieve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await mongoose.model('AIConversation').findOne({ 
        _id: conversationId, 
        user: user._id,
        conversationType: CONVERSATION_TYPES.HEALTH_EDUCATION
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create a new conversation with the current model
      const AIConversationModel = mongoose.model('AIConversation');
      conversation = new AIConversationModel({
        user: user._id,
        conversationType: CONVERSATION_TYPES.HEALTH_EDUCATION,
        title: `Health Education: ${topic || contentType}`,
        messages: [],
        healthEducation: [] // Initialize the healthEducation array
      });
    }

    // Construct the prompt for generating content
    let promptContent = `Please create a ${contentType} about ${topic || 'health'}`;
    
    if (additionalInfo) {
      promptContent += `\n\nAdditional requirements: ${additionalInfo}`;
    }
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: promptContent,
      timestamp: new Date()
    });
    
    // Generate system prompt
    const systemPrompt = await generateSystemPrompt(user._id, contentType, topic);
    
    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          // Gemini-2.0-flash doesn't support system role, so convert to user role
          { role: 'user', parts: [{ text: `Instructions for you to follow: ${systemPrompt}\n\nRequest: ${promptContent}` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }
    
    // Parse Gemini response
    const geminiResponse = await response.json();
    const aiMessage = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate the requested content.';
    
    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date()
    });
    
    // Create health education entry
    const healthEducationEntry = {
      contentType,
      title: topic || `Health ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
      description: extractDescription(aiMessage),
      content: aiMessage,
      tags: [contentType, ...(topic ? [topic] : [])],
      interactionData: {
        completionStatus: 'not_started',
        progress: 0
      },
      createdAt: new Date()
    };
    
    // Add health education entry to conversation
    if (!conversation.healthEducation) {
      conversation.healthEducation = [];
    }
    conversation.healthEducation.push(healthEducationEntry);
    
    // Update last modified timestamp
    conversation.lastUpdated = new Date();
    
    // Save conversation to database
    await conversation.save();
    
    // Return response
    return NextResponse.json({
      conversationId: conversation._id,
      healthEducation: healthEducationEntry,
      message: aiMessage
    });
  } catch (error) {
    console.error('Health education error:', error);
    return NextResponse.json({ error: 'Failed to generate health education content' }, { status: 500 });
  }
}

/**
 * GET - Retrieve health education content
 */
export async function GET(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if the AIConversation model is registered, and if not, register it
    if (!mongoose.models.AIConversation) {
      try {
        console.log('Registering AIConversation model...');
        // Import the schema directly to ensure it's using the latest definition
        const AIConversationSchema = require('@/models/AIConversation').default.schema;
        mongoose.model('AIConversation', AIConversationSchema);
      } catch (error) {
        console.error('Error registering AIConversation model:', error);
      }
    }
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get URL parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const contentId = url.searchParams.get('contentId');
    
    // If conversationId is provided, retrieve that specific conversation
    if (conversationId) {
      const conversation = await mongoose.model('AIConversation').findOne({ 
        _id: conversationId, 
        user: user._id,
        conversationType: CONVERSATION_TYPES.HEALTH_EDUCATION
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      // If contentId is provided, retrieve that specific content
      if (contentId) {
        const content = conversation.healthEducation.find((c: any) => c._id.toString() === contentId);
        
        if (!content) {
          return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }
        
        return NextResponse.json({ content });
      }
      
      // Return the entire conversation
      return NextResponse.json({ conversation });
    }
    
    // If no conversationId is provided, retrieve all health education conversations
    const conversations = await mongoose.model('AIConversation').find({ 
      user: user._id,
      conversationType: CONVERSATION_TYPES.HEALTH_EDUCATION
    }).sort({ lastUpdated: -1 });
    
    // Simplify the result to just essential data
    const simplifiedConversations = conversations.map(c => ({
      _id: c._id,
      title: c.title,
      lastUpdated: c.lastUpdated,
      createdAt: c.createdAt,
      contentCount: c.healthEducation.length
    }));
    
    return NextResponse.json({ conversations: simplifiedConversations });
  } catch (error) {
    console.error('Error retrieving health education content:', error);
    return NextResponse.json({ error: 'Failed to retrieve health education content' }, { status: 500 });
  }
}

/**
 * PATCH - Update health education content interaction data
 */
export async function PATCH(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if the AIConversation model is registered, and if not, register it
    if (!mongoose.models.AIConversation) {
      try {
        console.log('Registering AIConversation model...');
        // Import the schema directly to ensure it's using the latest definition
        const AIConversationSchema = require('@/models/AIConversation').default.schema;
        mongoose.model('AIConversation', AIConversationSchema);
      } catch (error) {
        console.error('Error registering AIConversation model:', error);
      }
    }
    
    // Get request data
    const data = await req.json();
    const { 
      conversationId, 
      contentId, 
      interactionData 
    } = data;
    
    if (!conversationId || !contentId || !interactionData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the conversation
    const conversation = await mongoose.model('AIConversation').findOne({ 
      _id: conversationId, 
      user: user._id,
      conversationType: CONVERSATION_TYPES.HEALTH_EDUCATION
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Find the content index
    const contentIndex = conversation.healthEducation.findIndex((c: any) => c._id.toString() === contentId);
    
    if (contentIndex === -1) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    // Update interaction data
    const updatedInteractionData = {
      ...conversation.healthEducation[contentIndex].interactionData,
      ...interactionData,
      lastInteraction: new Date()
    };
    
    conversation.healthEducation[contentIndex].interactionData = updatedInteractionData;
    
    // Update last modified timestamp
    conversation.lastUpdated = new Date();
    
    // Save changes
    await conversation.save();
    
    return NextResponse.json({ 
      success: true, 
      updatedInteractionData 
    });
  } catch (error) {
    console.error('Error updating health education interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction data' }, { status: 500 });
  }
}

/**
 * Helper function to extract a description from the AI-generated content
 */
function extractDescription(content: string): string {
  // Try to extract the first paragraph or sentence that's not a heading
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  // Find first line that doesn't look like a heading
  for (const line of lines) {
    if (!line.startsWith('#') && !line.match(/^[A-Z\s]+:/) && line.length > 30) {
      // Return first ~100 characters
      return line.length > 100 ? line.substring(0, 100) + '...' : line;
    }
  }
  
  // Fallback to first line or generic description
  return lines.length > 0 
    ? (lines[0].length > 100 ? lines[0].substring(0, 100) + '...' : lines[0])
    : 'Generated health education content';
} 