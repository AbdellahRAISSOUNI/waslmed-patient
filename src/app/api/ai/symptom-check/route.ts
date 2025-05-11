import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import MedicalRecord from '@/models/MedicalRecord';
import { callGeminiAPI } from '@/lib/gemini';

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyAaPd4OJxokEYKdpETKXchoXxVJ4kdysS4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    const { symptoms, duration, severity, additionalInfo, conversationId } = data;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'At least one symptom is required' }, { status: 400 });
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
      conversation = await AIConversation.findOne({ 
        _id: conversationId, 
        user: user._id,
        conversationType: 'symptom_check'
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create a new conversation
      conversation = new AIConversation({
        user: user._id,
        conversationType: 'symptom_check',
        title: `Symptom Check: ${symptoms.slice(0, 3).join(', ')}${symptoms.length > 3 ? '...' : ''}`,
        messages: []
      });
    }

    // Construct the symptom check prompt
    let promptContent = `I need a detailed analysis of the following symptoms:\n\n`;
    promptContent += `Symptoms: ${symptoms.join(', ')}\n`;
    
    if (duration) {
      promptContent += `Duration: ${duration}\n`;
    }
    
    if (severity) {
      promptContent += `Severity: ${severity}\n`;
    }
    
    if (additionalInfo) {
      promptContent += `Additional Information: ${additionalInfo}\n`;
    }
    
    promptContent += `\nPlease provide a comprehensive analysis with possible conditions, their likelihood, severity levels, recommended actions, and any additional questions that might help narrow down the diagnosis.`;
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: promptContent,
      timestamp: new Date()
    });
    
    // Call Gemini API for analysis
    const systemPrompt = `You are a medical symptom analyzer for the WaslMed healthcare platform. 
Your task is to analyze symptoms and provide a structured response with possible conditions, their probability, and severity.

Please follow these guidelines:
1. Analyze the symptoms carefully and provide likely conditions
2. Assign probability percentages to each condition (must sum to 100%)
3. Assign severity levels (low, medium, high, critical) to each condition
4. Recommend an action (self-care, consult, urgent, emergency)
5. Provide a brief explanation for your recommendation
6. Include additional questions that would help clarify the diagnosis
7. Add a medical disclaimer

Your response should be well-formatted and clearly structured for easy reading. 
Include a brief description for each condition and what the user should watch for.

IMPORTANT: Keep your responses medical in nature, evidence-based, and never make definitive diagnoses.
Always encourage consultation with healthcare professionals.`;

    // Call AI API with system prompt and user message
    const aiResponse = await callGeminiAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptContent }
    ]);
    
    if (!aiResponse.success) {
      throw new Error('Failed to analyze symptoms');
    }
    
    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date()
    });
    
    // Attempt to parse the AI response into a structured format
    // This is a simplified example - in production, you might want to use more robust parsing
    const analysis = {
      symptoms,
      possibleConditions: extractConditions(aiResponse.message),
      recommendedAction: extractAction(aiResponse.message),
      recommendationExplanation: extractExplanation(aiResponse.message),
      additionalQuestions: extractQuestions(aiResponse.message),
      disclaimer: "This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
    };

    // Create a new symptom check entry
    conversation.symptomChecks.push({
      symptoms,
      possibleConditions: analysis.possibleConditions.map(condition => ({
        condition: condition.condition,
        probability: condition.probability,
        severity: condition.severity
      })),
      recommendedAction: analysis.recommendedAction,
      date: new Date()
    });
    
    // Update last modified timestamp
    conversation.lastUpdated = new Date();
    
    // Save conversation to database
    await conversation.save();
    
    // Return response
    return NextResponse.json({
      conversationId: conversation._id,
      analysis,
      message: aiResponse.message
    });
  } catch (error) {
    console.error('Symptom check error:', error);
    return NextResponse.json({ error: 'Failed to analyze symptoms' }, { status: 500 });
  }
}

// Helper functions to extract structured data from AI response
function extractConditions(text: string): Array<{ condition: string; probability: number; severity: string; description: string }> {
  // This is a simplified implementation
  // In production, you would want more robust parsing, possibly asking the AI to return structured JSON
  
  try {
    // Look for common patterns in the response
    const conditions: Array<{ condition: string; probability: number; severity: string; description: string }> = [];
    
    // Sample regex-based approach - would need refinement based on actual AI responses
    const conditionRegex = /(?:condition|diagnosis):\s*([^\n]+)[^\d]*(\d+)%[^\n]*(?:severity|risk):\s*(\w+)[^\n]*(?:description|details):\s*([^\n]+)/gi;
    
    let match;
    while ((match = conditionRegex.exec(text)) !== null) {
      conditions.push({
        condition: match[1].trim(),
        probability: parseInt(match[2], 10),
        severity: match[3].toLowerCase(),
        description: match[4].trim()
      });
    }
    
    // If regex doesn't find matches, provide a fallback
    if (conditions.length === 0) {
      // Extract condition names and make reasonable guesses for other fields
      const nameRegex = /(?:^|\n)(?:condition|diagnosis|possible condition):\s*([^\n]+)/gi;
      while ((match = nameRegex.exec(text)) !== null) {
        conditions.push({
          condition: match[1].trim(),
          probability: 0, // Will be normalized later
          severity: 'medium',
          description: 'No detailed description available'
        });
      }
      
      // Normalize probabilities if we have conditions but no probabilities
      if (conditions.length > 0) {
        const equalProbability = 100 / conditions.length;
        conditions.forEach(c => c.probability = Math.round(equalProbability));
      }
    }
    
    // Final fallback if no structure found
    if (conditions.length === 0) {
      conditions.push({
        condition: 'Unspecified condition',
        probability: 100,
        severity: 'medium',
        description: 'The AI provided an analysis but without clearly structured condition information. Please read the full response for details.'
      });
    }
    
    return conditions;
  } catch (error) {
    console.error('Error extracting conditions:', error);
    return [{
      condition: 'Parsing Error',
      probability: 100,
      severity: 'medium',
      description: 'Failed to extract structured condition data from the AI response. Please read the full text response.'
    }];
  }
}

function extractAction(text: string): string {
  // Look for recommended action
  try {
    const actionMatch = /recommended action:?\s*(\w+)/i.exec(text);
    if (actionMatch && actionMatch[1]) {
      const action = actionMatch[1].toLowerCase();
      if (['self-care', 'consult', 'urgent', 'emergency'].includes(action)) {
        return action;
      }
      // Map close matches
      if (action.includes('self') || action.includes('home')) return 'self-care';
      if (action.includes('doctor') || action.includes('consult')) return 'consult';
      if (action.includes('urgent') || action.includes('soon')) return 'urgent';
      if (action.includes('emerg') || action.includes('immediate')) return 'emergency';
    }
    
    // If we can't find a specific action, make a reasonable guess based on the text
    if (text.toLowerCase().includes('emergency') || text.toLowerCase().includes('immediate attention')) {
      return 'emergency';
    } else if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('as soon as possible')) {
      return 'urgent';
    } else if (text.toLowerCase().includes('consult') || text.toLowerCase().includes('see a doctor')) {
      return 'consult';
    } else {
      return 'self-care';
    }
  } catch (error) {
    console.error('Error extracting action:', error);
    return 'consult'; // Default to consult as a safe fallback
  }
}

function extractExplanation(text: string): string {
  try {
    // Try to find a sentence about recommendation reason
    const explanationRegex = /(?:recommend|suggested action|recommendation reason|because)[^.!?]*[.!?]/i;
    const match = explanationRegex.exec(text);
    if (match) return match[0].trim();
    
    // Fallback
    return 'Based on the symptom analysis and potential conditions.';
  } catch (error) {
    console.error('Error extracting explanation:', error);
    return 'Based on the symptom analysis and potential conditions.';
  }
}

function extractQuestions(text: string): string[] {
  try {
    const questions: string[] = [];
    
    // Get text between "additional questions" and the next section
    const questionsSection = /additional questions[^:]*:([^#]+)/i.exec(text);
    if (questionsSection && questionsSection[1]) {
      // Split by bullet points or numbers
      const questionText = questionsSection[1].trim();
      const bulletItems = questionText.split(/\n\s*[-•*]\s*/);
      
      bulletItems.forEach(item => {
        const trimmed = item.trim();
        if (trimmed && trimmed.length > 10) { // Arbitrary minimum length
          questions.push(trimmed);
        }
      });
      
      // If we couldn't find bullet points, try to find question marks
      if (questions.length === 0) {
        const questionMarks = questionText.split(/\?\.?\s+/);
        questionMarks.forEach(item => {
          const trimmed = item.trim() + '?';
          if (trimmed.length > 10) {
            questions.push(trimmed);
          }
        });
      }
    }
    
    // Fallback if no questions found
    if (questions.length === 0) {
      // Scan the whole text for question-like sentences
      const fullTextQuestions = text.match(/[^.!?]*\?/g);
      if (fullTextQuestions) {
        fullTextQuestions.forEach(q => {
          const trimmed = q.trim();
          if (trimmed.length > 10 && !questions.includes(trimmed)) {
            questions.push(trimmed);
          }
        });
      }
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  } catch (error) {
    console.error('Error extracting questions:', error);
    return [
      'Have you experienced these symptoms before?',
      'Are there any factors that make the symptoms better or worse?',
      'Do you have any known medical conditions?',
      'Are you currently taking any medications?'
    ];
  }
}

// GET request handler - Retrieve symptom checks
export async function GET(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (conversationId) {
      // Get specific symptom check conversation
      const conversation = await AIConversation.findOne({
        _id: conversationId,
        user: user._id,
        conversationType: 'symptom_check'
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Symptom check not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        conversationId: conversation._id,
        symptomChecks: conversation.symptomChecks || []
      });
    } else {
      // Get all symptom check history
      const conversations = await AIConversation.find({
        user: user._id,
        conversationType: 'symptom_check'
      }).sort({ createdAt: -1 });
      
      // Extract symptom checks with conversation IDs
      const symptomCheckHistory = conversations.map(conv => ({
        conversationId: conv._id,
        title: conv.title,
        date: conv.createdAt,
        symptoms: conv.symptomChecks && conv.symptomChecks.length > 0 
          ? conv.symptomChecks[0].symptoms 
          : [],
        recommendedAction: conv.symptomChecks && conv.symptomChecks.length > 0 
          ? conv.symptomChecks[0].recommendedAction 
          : null
      }));
      
      return NextResponse.json({ symptomCheckHistory });
    }
    
  } catch (error) {
    console.error('Error retrieving symptom checks:', error);
    return NextResponse.json({ error: 'Failed to retrieve symptom checks' }, { status: 500 });
  }
} 