import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import MedicalRecord from '@/models/MedicalRecord';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { callGeminiAPI, callGeminiAPIWithFile } from '@/lib/gemini';

// Handle uploads to a dedicated uploads directory
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Define accepted file types
const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain'
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Handle multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string || 'other';
    const conversationId = formData.get('conversationId') as string;
    const description = formData.get('description') as string || '';
    
    // File validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    // Read file data
    const fileData = await file.arrayBuffer();
    const buffer = Buffer.from(fileData);
    
    // Create unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;
    
    // Create thumbnail path (for image files)
    let thumbnailUrl = null;
    if (file.type.startsWith('image/')) {
      thumbnailUrl = fileUrl; // For now, use the same image as thumbnail
    }
    
    // Save file
    await writeFile(filePath, buffer);
    
    // Get or create conversation
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
        conversationType: 'document_analysis',
        title: `Document Analysis: ${file.name}`,
        messages: []
      });
    }
    
    // Add message about the document
    conversation.messages.push({
      role: 'user',
      content: `I've uploaded ${file.name}${description ? ` with the following description: ${description}` : ''}. Please analyze this document.`,
      timestamp: new Date()
    });
    
    // Get user's medical record for context
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    // Generate analysis prompt based on document type
    let systemPrompt = `You are a medical document analyzer for the WaslMed healthcare platform. 
Your task is to analyze the uploaded medical document and provide a structured analysis.

The document is a ${documentType} file named "${file.name}"${description ? ` with the user's description: "${description}"` : ''}.`;

    // Add medical context if available
    if (medicalRecord) {
      const { personalInfo, allergies, medications, conditions } = medicalRecord;
      
      // Add basic personal info
      let ageInfo = '';
      if (personalInfo?.dateOfBirth) {
        const birthDate = new Date(personalInfo.dateOfBirth);
        const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        ageInfo = `${age} years old`;
      }
      
      const gender = personalInfo?.gender || 'unknown gender';
      
      // Add medical context
      systemPrompt += `\n\nPatient context:
- ${gender}, ${ageInfo}
- ${allergies?.length ? `Allergies: ${allergies.map((a: { allergen: string }) => a.allergen).join(', ')}` : 'No known allergies'}
- ${medications?.length ? `Current medications: ${medications.map((m: { name: string }) => m.name).join(', ')}` : 'No current medications'}
- ${conditions?.length ? `Medical conditions: ${conditions.map((c: { name: string }) => c.name).join(', ')}` : 'No known medical conditions'}`;
    }

    // Add document type specific instructions
    switch (documentType) {
      case 'medical_report':
        systemPrompt += `\n\nThis is a medical report. Please:
1. Summarize the key findings
2. Highlight any abnormal results
3. Explain medical terminology in simple terms
4. Note any recommended follow-ups`;
        break;
      case 'lab_result':
        systemPrompt += `\n\nThis is a laboratory result. Please:
1. Identify all test parameters and their values
2. Mark values outside normal ranges
3. Explain the significance of abnormal values
4. Suggest potential implications`;
        break;
      case 'imaging':
        systemPrompt += `\n\nThis is a medical imaging result. Please:
1. Describe what is visible in the image in detail
2. Identify any abnormalities
3. Explain the significance of any findings
4. Note any areas that might need further investigation`;
        break;
      case 'prescription':
        systemPrompt += `\n\nThis is a prescription. Please:
1. Identify the medications prescribed
2. Note dosages and instructions
3. Explain the purpose of each medication
4. Highlight potential side effects or interactions`;
        break;
      default:
        systemPrompt += `\n\nPlease analyze this medical document by:
1. Summarizing its key content
2. Highlighting important medical information
3. Explaining any technical terms
4. Noting any actions needed`;
    }

    // Add specific instruction for image analysis
    if (file.type.startsWith('image/')) {
      systemPrompt += `\n\nIMPORTANT: This is an actual medical image. Analyze what you can actually see in the image, don't make up details that aren't visible. Focus on identifying anatomical structures, potential abnormalities, and any visible medical indicators.`;
    }

    // Add response format instructions
    systemPrompt += `\n\nFormat your response as JSON with the following structure:
{
  "analysis": {
    "summary": "brief summary of the document",
    "findings": [
      {
        "finding": "description of finding",
        "importance": "normal/note/warning/critical",
        "location": "area of document or body part (if applicable)",
        "confidence": numeric confidence level (0-100)
      }
    ],
    "recommendations": [
      "recommendation 1",
      "recommendation 2"
    ],
    "warnings": [
      {
        "warning": "description of warning",
        "severity": "low/medium/high/critical"
      }
    ]
  }
}

Important guidelines:
1. Be thorough but concise
2. Focus on medically relevant information
3. Avoid making definitive diagnoses
4. Highlight items requiring medical attention
5. Use appropriate medical terminology with explanations`;

    // User prompt
    const userPrompt = `Please analyze this ${documentType}${description ? ` that was described as: "${description}"` : ''}. 
Analyze only what you can actually see in the document.
${file.type.startsWith('image/') ? "Look carefully at the medical image and identify what anatomical structures are visible and any potential abnormalities." : ""}
Make your analysis specific to the patient's medical context when possible.
Include relevant findings, recommendations, and any potential warnings.`;

    // Call AI API with file data for images and PDFs
    let aiResponse;
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      aiResponse = await callGeminiAPIWithFile(
        systemPrompt,
        userPrompt,
        buffer,
        file.type,
        0.4,
        1024
      );
    } else {
      // For other file types, use the regular text-only API
      aiResponse = await callGeminiAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 0.4, 1024);
    }

    if (!aiResponse.success) {
      return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
    }

    // Parse AI response - extract JSON
    let analysisData;
    try {
      const jsonStartIndex = aiResponse.message.indexOf('{');
      const jsonEndIndex = aiResponse.message.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonString = aiResponse.message.substring(jsonStartIndex, jsonEndIndex);
        analysisData = JSON.parse(jsonString);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Error parsing AI response JSON:', error);
      // Fallback to a basic structure
      analysisData = {
        analysis: {
          summary: 'The document was analyzed, but the results could not be structured properly.',
          findings: [{
            finding: 'Analysis format error',
            importance: 'note',
            location: 'system',
            confidence: 100
          }],
          recommendations: ['Please try uploading the document again or contact support.'],
          warnings: [{
            warning: 'The analysis engine encountered an error processing this document.',
            severity: 'medium'
          }]
        }
      };
    }

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date()
    });
    
    // Save conversation
    await conversation.save();
    
    // Create document analysis record
    const documentInfo = {
      fileName: file.name,
      documentType,
      fileSize: file.size,
      uploadDate: new Date(),
      storageUrl: fileUrl,
      thumbnailUrl,
      analysis: analysisData.analysis
    };
    
    // Update conversation with document analysis
    if (!conversation.documentAnalyses) {
      conversation.documentAnalyses = [];
    }
    
    conversation.documentAnalyses.push(documentInfo);
    await conversation.save();
    
    return NextResponse.json({
      success: true,
      conversationId: conversation._id,
      documentInfo
    });
    
  } catch (error) {
    console.error('Error in document analysis:', error);
    return NextResponse.json({ error: 'An error occurred processing the document' }, { status: 500 });
  }
}

// GET request handler - Retrieve document analyses
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
    const documentId = url.searchParams.get('documentId');
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (conversationId) {
      // Get specific conversation
      const conversation = await AIConversation.findOne({
        _id: conversationId,
        user: user._id,
        conversationType: 'document_analysis'
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      // If documentId is provided, return only that document
      if (documentId && conversation.documentAnalyses?.length) {
        const document = conversation.documentAnalyses.find(
          doc => doc._id.toString() === documentId
        );
        
        if (!document) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        
        return NextResponse.json(document);
      }
      
      // Return the full conversation with all documents
      return NextResponse.json(conversation);
    } else {
      // Return list of document analysis conversations
      const conversations = await AIConversation.find({
        user: user._id,
        conversationType: 'document_analysis'
      })
        .select('_id title conversationType createdAt lastUpdated documentAnalyses')
        .sort({ lastUpdated: -1 });
      
      return NextResponse.json(conversations);
    }
  } catch (error) {
    console.error('Error retrieving document analyses:', error);
    return NextResponse.json({ error: 'Failed to retrieve document analyses' }, { status: 500 });
  }
}

// DELETE request handler for removing a document
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
    const documentId = url.searchParams.get('documentId');
    
    if (!conversationId || !documentId) {
      return NextResponse.json({ error: 'Conversation ID and Document ID are required' }, { status: 400 });
    }
    
    // Find user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find and update the conversation
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      user: user._id,
      conversationType: 'document_analysis'
    });
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Remove the document from the array
    const documentIndex = conversation.documentAnalyses.findIndex(
      doc => doc._id.toString() === documentId
    );
    
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Remove the document from the array
    conversation.documentAnalyses.splice(documentIndex, 1);
    
    // Update timestamp
    conversation.lastUpdated = new Date();
    
    // Save conversation
    await conversation.save();
    
    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
} 