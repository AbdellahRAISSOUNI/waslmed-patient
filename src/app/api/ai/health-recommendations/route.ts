import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import MedicalRecord from '@/models/MedicalRecord';

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
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    if (!medicalRecord) {
      return NextResponse.json({ 
        error: 'Medical record not found. Please complete your medical profile to receive personalized recommendations.' 
      }, { status: 404 });
    }
    
    // Get request data
    const data = await req.json();
    const { category = 'general' } = data;  // Category can be diet, exercise, medication, lifestyle, or general
    
    // Extract relevant information from medical record
    const { personalInfo, allergies, medications, conditions, lifestyle } = medicalRecord;
    
    // Basic personal info
    let age = 'unknown';
    if (personalInfo?.dateOfBirth) {
      const birthDate = new Date(personalInfo.dateOfBirth);
      age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
    }
    
    const gender = personalInfo?.gender || 'unknown';
    const height = personalInfo?.height || 'unknown';
    const weight = personalInfo?.weight || 'unknown';
    
    // Create prompt for Gemini
    const prompt = `As a healthcare AI assistant, generate personalized health recommendations for a patient with the following profile:

Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
${allergies?.length ? `Allergies: ${allergies.map(a => a.allergen).join(', ')}` : 'No known allergies'}
${medications?.length ? `Current medications: ${medications.map(m => m.name).join(', ')}` : 'No current medications'}
${conditions?.length ? `Medical conditions: ${conditions.map(c => c.name).join(', ')}` : 'No known medical conditions'}
${lifestyle ? `Lifestyle: 
- Smoking: ${lifestyle.smokingStatus || 'unknown'}
- Alcohol: ${lifestyle.alcoholConsumption || 'unknown'}
- Exercise: ${lifestyle.exerciseFrequency || 'unknown'}
- Diet: ${lifestyle.diet || 'unknown'}
- Sleep: ${lifestyle.sleepPattern || 'unknown'}` : 'No lifestyle information available'}

I need specific, personalized recommendations for ${category} that would benefit this patient. For each recommendation:
1. Provide the specific recommendation
2. Explain why it's beneficial for this patient specifically
3. Note any relevant precautions or adaptations based on their conditions or medications

Format your response as structured JSON with the following format:
{
  "recommendations": [
    {
      "category": "${category}",
      "recommendation": "the specific recommendation",
      "reasonForRecommendation": "why this is beneficial for the patient",
      "basedOnFactors": ["relevant patient factor 1", "relevant patient factor 2"]
    }
  ]
}

Provide 3-5 recommendations that are evidence-based and personalized to this specific patient profile.`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
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
    const aiMessage = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      // Try to parse the JSON response from Gemini
      const jsonStartIndex = aiMessage.indexOf('{');
      const jsonEndIndex = aiMessage.lastIndexOf('}') + 1;
      const jsonSubstring = aiMessage.substring(jsonStartIndex, jsonEndIndex);
      const recommendationsData = JSON.parse(jsonSubstring);
      
      // Create or update AI conversation with these recommendations
      let conversation = await AIConversation.findOne({
        user: user._id,
        conversationType: 'health_recommendation'
      }).sort({ createdAt: -1 });
      
      if (!conversation) {
        conversation = new AIConversation({
          user: user._id,
          conversationType: 'health_recommendation',
          title: `Health Recommendations (${category})`,
          messages: [],
          healthRecommendations: []
        });
      }
      
      // Add recommendations to conversation
      if (recommendationsData.recommendations && Array.isArray(recommendationsData.recommendations)) {
        conversation.healthRecommendations.push(...recommendationsData.recommendations);
      }
      
      // Update timestamps
      conversation.lastUpdated = new Date();
      
      // Save to database
      await conversation.save();
      
      // Return recommendations
      return NextResponse.json({
        conversationId: conversation._id,
        recommendations: recommendationsData.recommendations,
      });
      
    } catch (jsonError) {
      console.error('Error parsing AI response as JSON:', jsonError);
      console.log('Raw AI response:', aiMessage);
      
      // Return error if can't parse
      return NextResponse.json({ 
        error: 'Failed to generate structured recommendations',
        rawResponse: aiMessage
      }, { status: 422 });
    }
    
  } catch (error) {
    console.error('Health recommendations error:', error);
    return NextResponse.json({ error: 'Failed to generate health recommendations' }, { status: 500 });
  }
}

// GET request handler - Retrieve health recommendations
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
    
    // Get the most recent health recommendation conversation
    const conversation = await AIConversation.findOne({
      user: user._id,
      conversationType: 'health_recommendation'
    }).sort({ createdAt: -1 });
    
    if (!conversation) {
      return NextResponse.json({ recommendations: [] });
    }
    
    // Return recommendations
    return NextResponse.json({
      conversationId: conversation._id,
      recommendations: conversation.healthRecommendations || []
    });
    
  } catch (error) {
    console.error('Error retrieving health recommendations:', error);
    return NextResponse.json({ error: 'Failed to retrieve health recommendations' }, { status: 500 });
  }
} 