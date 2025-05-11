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
    
    // Get request data
    const data = await req.json();
    const { riskType = 'general' } = data;  // Can be diabetes, hypertension, heart_disease, stroke, obesity
    
    // Find user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    if (!medicalRecord) {
      return NextResponse.json({ 
        error: 'Medical record not found. Please complete your medical profile to receive a risk assessment.' 
      }, { status: 404 });
    }
    
    // Extract relevant information from medical record
    const { personalInfo, conditions, medications, familyHistory, lifestyle } = medicalRecord;
    
    // Basic personal info
    let age = 'unknown';
    if (personalInfo?.dateOfBirth) {
      const birthDate = new Date(personalInfo.dateOfBirth);
      age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
    }
    
    const gender = personalInfo?.gender || 'unknown';
    const height = personalInfo?.height || 'unknown';
    const weight = personalInfo?.weight || 'unknown';
    
    // Calculate BMI if height and weight are available
    let bmi = '';
    if (personalInfo?.height && personalInfo?.weight) {
      const heightInM = personalInfo.height / 100;
      const bmiValue = personalInfo.weight / (heightInM * heightInM);
      bmi = bmiValue.toFixed(1);
    }
    
    // Create prompt for Gemini
    const prompt = `As a healthcare AI assistant, provide a health risk assessment for ${riskType} based on the following patient profile:

BASIC INFORMATION:
- Age: ${age}
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
${bmi ? `- BMI: ${bmi}` : ''}

MEDICAL HISTORY:
${conditions?.length ? `- Medical conditions: ${conditions.map(c => c.name).join(', ')}` : '- No known medical conditions'}
${medications?.length ? `- Current medications: ${medications.map(m => m.name).join(', ')}` : '- No current medications'}

FAMILY HISTORY:
${familyHistory?.length ? familyHistory.map(f => `- ${f.condition} (${f.relationship})`).join('\n') : '- No family history recorded'}

LIFESTYLE:
${lifestyle ? `- Smoking: ${lifestyle.smokingStatus || 'unknown'}
- Alcohol: ${lifestyle.alcoholConsumption || 'unknown'}
- Exercise: ${lifestyle.exerciseFrequency || 'unknown'}
- Diet: ${lifestyle.diet || 'unknown'}
- Sleep: ${lifestyle.sleepPattern || 'unknown'}` : '- No lifestyle information available'}

Based on this information, provide a comprehensive risk assessment for ${riskType}. Include:
1. A risk score from 1-100
2. A risk level (low, moderate, high, or very high)
3. Key contributing factors from the patient's profile
4. Specific recommendations to reduce risk
5. Key statistics or information about this risk

Format your response as JSON with the following structure:
{
  "riskAssessment": {
    "riskType": "${riskType}",
    "riskScore": 00,
    "riskLevel": "low/moderate/high/very_high",
    "explanation": "detailed explanation of the risk assessment and how it was determined",
    "contributingFactors": ["factor 1", "factor 2", "factor 3"],
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
    "keyStatistics": ["statistic 1", "statistic 2"]
  }
}

Provide an evidence-based assessment that is personalized to this specific patient profile. Be accurate but also clear and actionable.`;

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
      const assessmentData = JSON.parse(jsonSubstring);
      
      // Create a new health risk assessment entry
      const healthRiskAssessment = {
        riskType: assessmentData.riskAssessment.riskType,
        riskScore: assessmentData.riskAssessment.riskScore,
        riskLevel: assessmentData.riskAssessment.riskLevel,
        contributingFactors: assessmentData.riskAssessment.contributingFactors,
        recommendations: assessmentData.riskAssessment.recommendations,
        assessmentDate: new Date()
      };
      
      // Create or update AI conversation
      let conversation = await AIConversation.findOne({
        user: user._id,
        conversationType: 'risk_assessment'
      }).sort({ createdAt: -1 });
      
      if (!conversation) {
        conversation = new AIConversation({
          user: user._id,
          conversationType: 'risk_assessment',
          title: `Risk Assessment: ${riskType.charAt(0).toUpperCase() + riskType.slice(1)}`,
          messages: [],
          healthRiskAssessments: []
        });
      }
      
      // Add health risk assessment to conversation
      conversation.healthRiskAssessments.push(healthRiskAssessment);
      
      // Add summary message
      conversation.messages.push({
        role: 'user',
        content: `Request risk assessment for ${riskType}`,
        timestamp: new Date()
      });
      
      const responseSummary = `Your ${riskType} risk assessment: ${assessmentData.riskAssessment.riskLevel} risk (score: ${assessmentData.riskAssessment.riskScore}/100). ${assessmentData.riskAssessment.explanation.substring(0, 150)}...`;
      
      conversation.messages.push({
        role: 'assistant',
        content: responseSummary,
        timestamp: new Date()
      });
      
      // Update timestamp
      conversation.lastUpdated = new Date();
      
      // Save to database
      await conversation.save();
      
      // Return assessment
      return NextResponse.json({
        conversationId: conversation._id,
        riskAssessment: assessmentData.riskAssessment
      });
      
    } catch (jsonError) {
      console.error('Error parsing AI response as JSON:', jsonError);
      console.log('Raw AI response:', aiMessage);
      
      // Return error if can't parse
      return NextResponse.json({ 
        error: 'Failed to generate risk assessment',
        rawResponse: aiMessage
      }, { status: 422 });
    }
    
  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json({ error: 'Failed to generate risk assessment' }, { status: 500 });
  }
}

// GET request handler - Retrieve risk assessments
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
    const riskType = url.searchParams.get('riskType');
    
    // Return specific risk type or all risk assessments
    const conversation = await AIConversation.findOne({
      user: user._id,
      conversationType: 'risk_assessment'
    }).sort({ createdAt: -1 });
    
    if (!conversation) {
      return NextResponse.json({ riskAssessments: [] });
    }
    
    if (riskType) {
      // Filter by risk type
      const filteredAssessments = conversation.healthRiskAssessments.filter(
        (assessment: any) => assessment.riskType === riskType
      );
      
      // Sort by date (newest first)
      filteredAssessments.sort((a: any, b: any) => 
        new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
      );
      
      return NextResponse.json({
        conversationId: conversation._id,
        riskAssessments: filteredAssessments
      });
    } else {
      // Return all risk assessments, sorted by date
      const sortedAssessments = [...conversation.healthRiskAssessments].sort(
        (a: any, b: any) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
      );
      
      return NextResponse.json({
        conversationId: conversation._id,
        riskAssessments: sortedAssessments
      });
    }
    
  } catch (error) {
    console.error('Error retrieving risk assessments:', error);
    return NextResponse.json({ error: 'Failed to retrieve risk assessments' }, { status: 500 });
  }
} 