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
    const { 
      recentSymptoms = [], 
      vitals = {}, 
      sleepChanges = '',
      appetiteChanges = '',
      moodChanges = '',
      medicationAdherence = '',
      additionalNotes = '' 
    } = data;
    
    // Find user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    if (!medicalRecord) {
      return NextResponse.json({ 
        error: 'Medical record not found. Please complete your medical profile for accurate monitoring.' 
      }, { status: 404 });
    }
    
    // Extract relevant information from medical record
    const { personalInfo, conditions, medications } = medicalRecord;
    
    // Basic personal info
    let age = 'unknown';
    if (personalInfo?.dateOfBirth) {
      const birthDate = new Date(personalInfo.dateOfBirth);
      age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
    }
    
    const gender = personalInfo?.gender || 'unknown';
    
    // Check for previous symptom data
    const previousEarlyWarningData = await AIConversation.findOne({
      user: user._id,
      conversationType: 'early_warning'
    }).sort({ createdAt: -1 });
    
    // Extract previous symptoms to detect changes
    let previousSymptoms = [];
    let symptomTrends = '';
    
    if (previousEarlyWarningData && previousEarlyWarningData.messages.length > 1) {
      // Try to find user messages with symptom data
      const userMessages = previousEarlyWarningData.messages.filter(msg => msg.role === 'user');
      if (userMessages.length > 0) {
        // Get the most recent message
        const lastMessage = userMessages[userMessages.length - 1].content;
        
        // Simple extraction of symptoms if they are mentioned
        if (lastMessage.includes('Symptoms:')) {
          const symptomsSection = lastMessage.split('Symptoms:')[1].split('\n')[0];
          previousSymptoms = symptomsSection.split(',').map(s => s.trim());
          
          // Compare previous with current
          const newSymptoms = recentSymptoms.filter(s => !previousSymptoms.includes(s));
          const resolvedSymptoms = previousSymptoms.filter(s => !recentSymptoms.includes(s));
          const continuingSymptoms = recentSymptoms.filter(s => previousSymptoms.includes(s));
          
          if (newSymptoms.length || resolvedSymptoms.length || continuingSymptoms.length) {
            symptomTrends = 'Symptom changes from previous report:\n';
            if (newSymptoms.length) symptomTrends += `- New symptoms: ${newSymptoms.join(', ')}\n`;
            if (resolvedSymptoms.length) symptomTrends += `- Resolved symptoms: ${resolvedSymptoms.join(', ')}\n`;
            if (continuingSymptoms.length) symptomTrends += `- Continuing symptoms: ${continuingSymptoms.join(', ')}\n`;
          }
        }
      }
    }
    
    // Create prompt for Gemini
    const prompt = `As a healthcare AI assistant, analyze the following patient monitoring data for signs of health deterioration or concerning patterns. This patient has existing conditions that need careful monitoring.

PATIENT PROFILE:
- Age: ${age}
- Gender: ${gender}
${conditions?.length ? `- Medical conditions: ${conditions.map(c => c.name).join(', ')}` : '- No known medical conditions'}
${medications?.length ? `- Current medications: ${medications.map(m => m.name).join(', ')}` : '- No current medications'}

CURRENT STATUS:
${recentSymptoms.length ? `- Recent symptoms: ${recentSymptoms.join(', ')}` : '- No current symptoms reported'}
${vitals.bloodPressure ? `- Blood pressure: ${vitals.bloodPressure}` : ''}
${vitals.heartRate ? `- Heart rate: ${vitals.heartRate} bpm` : ''}
${vitals.temperature ? `- Temperature: ${vitals.temperature}°C` : ''}
${vitals.oxygenLevel ? `- Oxygen saturation: ${vitals.oxygenLevel}%` : ''}
${vitals.weight ? `- Current weight: ${vitals.weight} kg` : ''}

BEHAVIORAL CHANGES:
${sleepChanges ? `- Sleep changes: ${sleepChanges}` : ''}
${appetiteChanges ? `- Appetite changes: ${appetiteChanges}` : ''}
${moodChanges ? `- Mood changes: ${moodChanges}` : ''}
${medicationAdherence ? `- Medication adherence: ${medicationAdherence}` : ''}

${symptomTrends ? `SYMPTOM TRENDS:\n${symptomTrends}` : ''}

${additionalNotes ? `ADDITIONAL NOTES:\n${additionalNotes}` : ''}

Based on this information and considering the patient's existing conditions, analyze for potential early warning signs of health deterioration. Identify patterns that might indicate worsening of existing conditions or development of new concerns.

Format your response as JSON with the following structure:
{
  "earlyWarningAnalysis": {
    "concerningPatterns": [
      {
        "issue": "description of the concerning pattern",
        "severity": "low/medium/high",
        "relatedTo": "related condition or medication if applicable",
        "suggestedAction": "specific action patient should take"
      }
    ],
    "normalFindings": [
      "aspect 1 that appears normal",
      "aspect 2 that appears normal"
    ],
    "analysisExplanation": "detailed explanation of your analysis",
    "monitoringRecommendations": [
      "recommendation 1 for ongoing monitoring",
      "recommendation 2 for ongoing monitoring"
    ]
  }
}

Provide an evidence-based analysis while being careful not to alarm the patient unnecessarily. Focus on actionable insights and appropriate next steps based on clinical guidelines.`;

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
          temperature: 0.3,
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
      const analysisData = JSON.parse(jsonSubstring);
      
      // Create early warning flags for storage
      const earlyWarningFlags = analysisData.earlyWarningAnalysis.concerningPatterns.map(pattern => ({
        issue: pattern.issue,
        severity: pattern.severity,
        suggestedAction: pattern.suggestedAction,
        detectedAt: new Date()
      }));
      
      // Create or update AI conversation
      let conversation = await AIConversation.findOne({
        user: user._id,
        conversationType: 'early_warning'
      }).sort({ createdAt: -1 });
      
      if (!conversation) {
        conversation = new AIConversation({
          user: user._id,
          conversationType: 'early_warning',
          title: 'Health Monitoring',
          messages: [],
          earlyWarningFlags: []
        });
      }
      
      // Prepare message content
      let messageContent = 'Health Status Update:\n';
      if (recentSymptoms.length) messageContent += `Symptoms: ${recentSymptoms.join(', ')}\n`;
      
      if (Object.keys(vitals).length) {
        messageContent += 'Vitals:\n';
        Object.entries(vitals).forEach(([key, value]) => {
          if (value) messageContent += `- ${key}: ${value}\n`;
        });
      }
      
      if (sleepChanges || appetiteChanges || moodChanges) {
        messageContent += 'Behavioral Changes:\n';
        if (sleepChanges) messageContent += `- Sleep: ${sleepChanges}\n`;
        if (appetiteChanges) messageContent += `- Appetite: ${appetiteChanges}\n`;
        if (moodChanges) messageContent += `- Mood: ${moodChanges}\n`;
      }
      
      if (additionalNotes) messageContent += `Notes: ${additionalNotes}\n`;
      
      // Add message to conversation
      conversation.messages.push({
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      });
      
      // Add early warning flags to conversation
      if (earlyWarningFlags.length > 0) {
        conversation.earlyWarningFlags.push(...earlyWarningFlags);
        
        // Add summary response
        const highSeverityIssues = earlyWarningFlags.filter(flag => flag.severity === 'high');
        let responseContent = '';
        
        if (highSeverityIssues.length > 0) {
          responseContent = `⚠️ Alert: ${highSeverityIssues.length} high-severity concern(s) detected. ${highSeverityIssues[0].issue} ${highSeverityIssues[0].suggestedAction}`;
        } else if (earlyWarningFlags.length > 0) {
          responseContent = `${earlyWarningFlags.length} potential concern(s) identified: ${earlyWarningFlags[0].issue}. ${earlyWarningFlags[0].suggestedAction}`;
        } else {
          responseContent = "No concerning patterns detected. Continue regular monitoring.";
        }
        
        if (analysisData.earlyWarningAnalysis.monitoringRecommendations?.length > 0) {
          responseContent += ` Recommendation: ${analysisData.earlyWarningAnalysis.monitoringRecommendations[0]}`;
        }
        
        conversation.messages.push({
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        });
      } else {
        // No concerns found
        conversation.messages.push({
          role: 'assistant',
          content: "No concerning patterns detected in your health status. Continue regular monitoring and maintain your current care plan.",
          timestamp: new Date()
        });
      }
      
      // Update timestamp
      conversation.lastUpdated = new Date();
      
      // Save to database
      await conversation.save();
      
      // Return analysis
      return NextResponse.json({
        conversationId: conversation._id,
        earlyWarningAnalysis: analysisData.earlyWarningAnalysis
      });
      
    } catch (jsonError) {
      console.error('Error parsing AI response as JSON:', jsonError);
      console.log('Raw AI response:', aiMessage);
      
      // Return error if can't parse
      return NextResponse.json({ 
        error: 'Failed to analyze health monitoring data',
        rawResponse: aiMessage
      }, { status: 422 });
    }
    
  } catch (error) {
    console.error('Early warning system error:', error);
    return NextResponse.json({ error: 'Failed to analyze health monitoring data' }, { status: 500 });
  }
}

// GET request handler - Retrieve early warnings
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
    const severity = url.searchParams.get('severity'); // 'high', 'medium', 'low'
    
    // Find early warning conversation
    const conversation = await AIConversation.findOne({
      user: user._id,
      conversationType: 'early_warning'
    }).sort({ createdAt: -1 });
    
    if (!conversation) {
      return NextResponse.json({ earlyWarningFlags: [] });
    }
    
    // Filter by severity if specified
    let warningFlags = conversation.earlyWarningFlags || [];
    
    if (severity) {
      warningFlags = warningFlags.filter((flag: any) => flag.severity === severity);
    }
    
    // Sort by detection date (newest first)
    warningFlags.sort((a: any, b: any) => 
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
    
    // Get conversation messages for context
    const messages = conversation.messages || [];
    
    return NextResponse.json({
      conversationId: conversation._id,
      earlyWarningFlags: warningFlags,
      messages: messages
    });
    
  } catch (error) {
    console.error('Error retrieving early warnings:', error);
    return NextResponse.json({ error: 'Failed to retrieve early warnings' }, { status: 500 });
  }
} 