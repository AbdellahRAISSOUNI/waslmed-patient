import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import MedicalRecord from '@/models/MedicalRecord';

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyAaPd4OJxokEYKdpETKXchoXxVJ4kdysS4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Helper function to get a system prompt based on the user's medical data
const generateSystemPrompt = async (userId: string, conversationType: string) => {
  try {
    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: userId });
    
    if (!medicalRecord) {
      return "You are a helpful health assistant for WaslMed healthcare platform. Please note that I don't have access to the user's medical record, so my advice will be general.";
    }
    
    // Extract relevant information from medical record
    const { personalInfo, allergies, medications, conditions } = medicalRecord;
    
    // Basic personal info
    let ageInfo = '';
    if (personalInfo?.dateOfBirth) {
      const birthDate = new Date(personalInfo.dateOfBirth);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      ageInfo = `${age} years old`;
    }
    
    const gender = personalInfo?.gender || 'unknown gender';
    const height = personalInfo?.height ? `${personalInfo.height} cm` : 'unknown height';
    const weight = personalInfo?.weight ? `${personalInfo.weight} kg` : 'unknown weight';
    
    // Format allergies
    const allergyInfo = allergies?.length 
      ? `Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(', ')}`
      : 'No known allergies';
    
    // Format medications
    const medicationInfo = medications?.length 
      ? `Current medications: ${medications.map((m: { name: string }) => m.name).join(', ')}`
      : 'No current medications';
    
    // Format medical conditions
    const conditionInfo = conditions?.length 
      ? `Medical conditions: ${conditions.map((c: { name: string }) => c.name).join(', ')}`
      : 'No known medical conditions';
    
    // Customize system prompt based on conversation type
    let specializedInstruction = '';
    
    switch (conversationType) {
      case 'health_recommendation':
        specializedInstruction = "Analyze the user's health profile and provide personalized health recommendations related to lifestyle, diet, or medication management. Focus on evidence-based advice.";
        break;
      case 'symptom_check':
        specializedInstruction = "Help the user understand possible causes for their symptoms. Be thorough but careful not to cause unnecessary alarm. Always recommend consulting a healthcare professional for proper diagnosis.";
        break;
      case 'risk_assessment':
        specializedInstruction = "Based on the user's profile, assess potential health risks. Explain risk factors clearly and suggest preventive measures.";
        break;
      case 'early_warning':
        specializedInstruction = "Monitor the user's reported symptoms or metrics for signs of health deterioration. Alert them to concerning patterns and suggest appropriate actions.";
        break;
      default:
        specializedInstruction = "Provide helpful, accurate health information and guidance.";
    }
    
    // Create the final system prompt
    return `You are a health assistant for the WaslMed healthcare platform. You have access to the following information about the user:

Patient profile: ${gender}, ${ageInfo}, ${height}, ${weight}
${allergyInfo}
${medicationInfo}
${conditionInfo}

${specializedInstruction}

Important guidelines:
1. Maintain a professional, empathetic tone
2. Only provide medically accurate information
3. Acknowledge the limitations of AI and encourage consultation with healthcare professionals for diagnosis and treatment
4. Respect patient privacy and confidentiality
5. Focus on evidence-based recommendations
6. Do not make definitive diagnoses
7. Keep responses concise and helpful`;
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return "You are a helpful health assistant for WaslMed healthcare platform. Please provide general health guidance and recommend consulting healthcare professionals for specific medical advice.";
  }
};

// POST request handler - Process an AI request
export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get request data
    const data = await req.json();
    const { message, conversationId, conversationType = 'general' } = data;
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Retrieve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ 
        _id: conversationId, 
        user: user._id 
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create a new conversation
      conversation = new AIConversation({
        user: user._id,
        conversationType,
        title: message.length > 30 ? `${message.substring(0, 30)}...` : message,
        messages: []
      });
    }
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Generate or retrieve system prompt
    const systemPrompt = await generateSystemPrompt(user._id, conversationType);
    
    // Format messages for Gemini API
    const formattedMessages = [
      // Gemini-2.0-flash doesn't support system role, so convert to user role
      { role: 'user', parts: [{ text: `Instructions for you to follow: ${systemPrompt}\n\nNow, let's continue our conversation:` }] },
      ...conversation.messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];
    
    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
    const aiMessage = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    
    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date()
    });
    
    // Update last modified timestamp
    conversation.lastUpdated = new Date();
    
    // Save conversation to database
    await conversation.save();
    
    // Return response
    return NextResponse.json({
      conversationId: conversation._id,
      message: aiMessage
    });
  } catch (error) {
    console.error('AI conversation error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}

// GET request handler - Retrieve conversations
export async function GET(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const conversationType = url.searchParams.get('conversationType');
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return specific conversation or list of conversations
    if (conversationId) {
      const conversation = await AIConversation.findOne({
        _id: conversationId,
        user: user._id
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      return NextResponse.json(conversation);
    } else {
      // Return list of conversations (limited data)
      let query: any = { user: user._id };
      
      // Filter by conversation type if provided
      if (conversationType) {
        query.conversationType = conversationType;
      }
      
      const conversations = await AIConversation.find(query)
        .select('_id title conversationType createdAt lastUpdated')
        .sort({ lastUpdated: -1 });
      
      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Error retrieving AI conversations:', error);
    return NextResponse.json({ error: 'Failed to retrieve conversations' }, { status: 500 });
  }
}

// DELETE request handler - Delete a conversation
export async function DELETE(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find and delete conversation
    const result = await AIConversation.deleteOne({
      _id: conversationId,
      user: user._id
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Conversation not found or not authorized to delete' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
} 