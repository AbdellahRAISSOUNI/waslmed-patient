# WaslMed AI Documentation

## Overview

WaslMed integrates advanced artificial intelligence capabilities powered by Google's Gemini API to provide personalized healthcare assistance to users. The AI system utilizes the user's medical record data to offer contextualized health information, analyze symptoms, assess health risks, and provide early warnings about potential health issues.

## AI Features

The AI system in WaslMed consists of six main modules:

1. **General Conversation**: A chat interface allowing users to ask general health-related questions, with responses tailored to their medical profile.

2. **Symptom Checker**: Analyzes user-reported symptoms to suggest possible conditions, their likelihood, severity, and recommended actions.

3. **Health Recommendations**: Provides personalized health advice based on the user's medical record, lifestyle factors, and current health status.

4. **Risk Assessment**: Evaluates potential health risks based on the user's medical history, demographics, and lifestyle.

5. **Early Warning System**: Monitors patterns in user health data to detect concerning trends and suggest preventive actions.

6. **Document Analysis**: Analyzes uploaded medical documents, images, and reports to extract key information, findings, and recommendations.

7. **Health Education**: Generates personalized health education content including articles, video scripts, VR medical procedure simulations, gamified learning modules, and customized wellness plans.

## Architecture & Technical Implementation

### Technology Stack

- **Language Model**: Google Gemini 2.0 Flash
- **API Integration**: Direct integration with Gemini API
- **Data Storage**: MongoDB with Mongoose schema
- **Frontend Framework**: React with Next.js
- **State Management**: React hooks and context
- **Styling**: TailwindCSS

### Data Flow

1. **User Input Collection**:
   - User provides input (message, symptoms, etc.)
   - Input is processed and prepared for API submission

2. **Context Enhancement**:
   - User's medical record data is retrieved from the database
   - Relevant information is extracted and formatted as context

3. **AI Processing**:
   - Enhanced input is sent to Gemini API with appropriate system prompts
   - Model generates response based on input and context

4. **Response Processing**:
   - Raw API response is parsed and structured
   - For specialized modules (symptom checker, risk assessment), responses are converted to structured data

5. **Data Storage**:
   - Conversations and analyses are stored in the database
   - Associated with the user's profile for future reference

6. **Response Presentation**:
   - Processed response is displayed to the user in an appropriate format
   - Interactive elements allow for continued conversation

### Database Schema

The AI features are supported by the `AIConversation` model in MongoDB:

```typescript
// AIConversation Schema
{
  user: ObjectId,             // Reference to user
  conversationType: String,   // 'general', 'symptom_check', 'health_recommendation', 'risk_assessment', 'early_warning', 'document_analysis', 'health_education'
  title: String,              // Conversation title
  
  // Common fields for all conversation types
  messages: [{
    role: String,             // 'user', 'assistant', 'system'
    content: String,          // Message content
    timestamp: Date           // Message timestamp
  }],
  
  // Symptom checker specific fields
  symptomChecks: [{
    symptoms: [String],       // List of symptoms
    possibleConditions: [{
      condition: String,      // Condition name
      probability: Number,    // 0-100
      severity: String        // 'low', 'medium', 'high', 'critical'
    }],
    recommendedAction: String, // 'self-care', 'consult', 'urgent', 'emergency'
    date: Date                // Analysis date
  }],
  
  // Health recommendations specific fields
  healthRecommendations: [{
    category: String,         // 'diet', 'exercise', 'medication', 'lifestyle', 'general'
    recommendation: String,   // Recommendation text
    reasonForRecommendation: String,
    basedOnFactors: [String], // Factors that influenced this recommendation
    saved: Boolean,           // Whether the user has saved this recommendation
    createdAt: Date           // Creation timestamp
  }],
  
  // Risk assessment specific fields
  healthRiskAssessments: [{
    riskType: String,         // Type of risk
    riskScore: Number,        // 0-100
    riskLevel: String,        // 'low', 'moderate', 'high', 'very_high'
    contributingFactors: [String],
    recommendations: [String],
    assessmentDate: Date      // Assessment timestamp
  }],
  
  // Early warning specific fields
  earlyWarningFlags: [{
    issue: String,            // Identified issue
    severity: String,         // 'low', 'medium', 'high'
    suggestedAction: String,  // Suggested action
    detectedAt: Date          // Detection timestamp
  }],
  
  // Document analysis specific fields
  documentAnalyses: [{
    fileName: String,          // Original filename
    fileType: String,          // MIME type
    fileSize: Number,          // File size in bytes
    uploadDate: Date,          // Upload date
    documentType: String,      // 'medical_report', 'lab_result', 'imaging', 'prescription', 'other'
    storageUrl: String,        // Path to stored file
    thumbnailUrl: String,      // Path to thumbnail (for images)
    analysis: {
      summary: String,         // Summary of document
      findings: [{
        finding: String,       // Description of finding
        importance: String,    // 'normal', 'note', 'warning', 'critical'
        location: String,      // Area of document or body part
        confidence: Number     // 0-100
      }],
      recommendations: [String], // List of recommendations
      warnings: [{
        warning: String,       // Warning description
        severity: String       // 'low', 'medium', 'high', 'critical'
      }]
    }
  }],
  
  // Health education specific fields
  healthEducation: [{
    contentType: String,       // 'article', 'video', 'simulation', 'game', 'plan'
    title: String,             // Content title
    description: String,       // Brief description
    content: String,           // Full content
    mediaUrl: String,          // URL to any media files (optional)
    tags: [String],            // Content tags for categorization
    relevantConditions: [String], // Medical conditions this content is relevant to
    interactionData: {
      completionStatus: String, // 'not_started', 'in_progress', 'completed'
      progress: Number,        // 0-100 percentage
      score: Number,           // Score for games (optional)
      timeSpent: Number,       // Time spent in seconds (optional)
      lastInteraction: Date    // Last time user interacted with content
    },
    createdAt: Date            // Creation timestamp
  }],
  
  // Metadata
  createdAt: Date,            // Conversation creation timestamp
  lastUpdated: Date           // Last updated timestamp
}
```

## API Endpoints

### General AI Conversation

- **Endpoint**: `/api/ai`
- **Methods**: `GET`, `POST`, `DELETE`
- **Authentication**: Required
- **Description**: Manages general AI conversations

#### POST Request
- Creates a new message in a conversation or starts a new conversation
- **Request Body**:
  ```json
  {
    "message": "string",
    "conversationId": "string (optional)",
    "conversationType": "string (optional, defaults to 'general')"
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "message": "string"
  }
  ```

#### GET Request
- Retrieves conversation(s)
- **Query Parameters**:
  - `conversationId` (optional): Retrieves a specific conversation
  - `conversationType` (optional): Filters conversations by type
- **Response**:
  - With conversationId: Returns full conversation details
  - Without conversationId: Returns a list of conversation summaries

#### DELETE Request
- Deletes a conversation
- **Query Parameters**:
  - `conversationId`: ID of the conversation to delete
- **Response**:
  ```json
  {
    "success": true,
    "message": "Conversation deleted successfully"
  }
  ```

### Symptom Checker

- **Endpoint**: `/api/ai/symptom-check`
- **Methods**: `POST`, `GET`
- **Authentication**: Required
- **Description**: Analyzes user symptoms and provides possible diagnoses

#### POST Request
- Analyzes symptoms and creates a new symptom check
- **Request Body**:
  ```json
  {
    "symptoms": ["string"],
    "duration": "string (optional)",
    "severity": "string (optional)",
    "additionalInfo": "string (optional)",
    "conversationId": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "analysis": {
      "symptoms": ["string"],
      "possibleConditions": [
        {
          "condition": "string",
          "probability": "number",
          "severity": "string",
          "description": "string"
        }
      ],
      "recommendedAction": "string",
      "recommendationExplanation": "string",
      "additionalQuestions": ["string"],
      "disclaimer": "string"
    },
    "message": "string"
  }
  ```

#### GET Request
- Retrieves symptom check history
- **Query Parameters**:
  - `conversationId` (optional): Retrieves a specific symptom check
- **Response**:
  - With conversationId: Returns specific symptom check details
  - Without conversationId: Returns a list of symptom check summaries

### Health Recommendations

- **Endpoint**: `/api/ai/health-recommendation`
- **Methods**: `POST`, `GET`
- **Authentication**: Required
- **Description**: Generates personalized health recommendations

#### POST Request
- Generates health recommendations based on user profile
- **Request Body**:
  ```json
  {
    "category": "string (optional)",
    "specificRequest": "string (optional)",
    "conversationId": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "recommendations": [
      {
        "category": "string",
        "recommendation": "string",
        "reasonForRecommendation": "string",
        "basedOnFactors": ["string"]
      }
    ],
    "message": "string"
  }
  ```

### Risk Assessment

- **Endpoint**: `/api/ai/risk-assessment`
- **Methods**: `POST`, `GET`
- **Authentication**: Required
- **Description**: Evaluates health risks based on user's medical profile

#### POST Request
- Performs a risk assessment
- **Request Body**:
  ```json
  {
    "riskType": "string (optional)",
    "additionalInfo": "string (optional)",
    "conversationId": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "assessments": [
      {
        "riskType": "string",
        "riskScore": "number",
        "riskLevel": "string",
        "contributingFactors": ["string"],
        "recommendations": ["string"]
      }
    ],
    "message": "string"
  }
  ```

### Early Warning

- **Endpoint**: `/api/ai/early-warning`
- **Methods**: `POST`, `GET`
- **Authentication**: Required
- **Description**: Provides early warnings about potential health issues

#### POST Request
- Performs an early warning analysis
- **Request Body**:
  ```json
  {
    "recentChanges": "string (optional)",
    "specificConcerns": "string (optional)",
    "conversationId": "string (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "warnings": [
      {
        "issue": "string",
        "severity": "string",
        "suggestedAction": "string",
        "detectedAt": "date"
      }
    ],
    "message": "string"
  }
  ```

### Document Analysis

- **Endpoint**: `/api/ai/document-analysis`
- **Methods**: `POST`, `GET`, `DELETE`
- **Authentication**: Required
- **Description**: Uploads and analyzes medical documents

#### POST Request
- Uploads and analyzes a medical document
- **Request Body**: `multipart/form-data` with the following fields:
  - `file`: The document file (PDF, JPEG, PNG, GIF, DOCX, TXT)
  - `documentType`: Type of document ('medical_report', 'lab_result', 'imaging', 'prescription', 'other')
  - `description` (optional): Additional description of the document
  - `conversationId` (optional): ID of existing conversation
- **Response**:
  ```json
  {
    "conversationId": "string",
    "message": "string",
    "documentAnalysis": {
      "fileName": "string",
      "fileType": "string",
      "fileSize": "number",
      "uploadDate": "date",
      "documentType": "string",
      "storageUrl": "string",
      "thumbnailUrl": "string",
      "analysis": {
        "summary": "string",
        "findings": [
          {
            "finding": "string",
            "importance": "string",
            "location": "string",
            "confidence": "number"
          }
        ],
        "recommendations": ["string"],
        "warnings": [
          {
            "warning": "string",
            "severity": "string"
          }
        ]
      }
    }
  }
  ```

#### GET Request
- Retrieves document analyses
- **Query Parameters**:
  - `conversationId` (optional): Retrieves a specific conversation
  - `documentId` (optional): Retrieves a specific document from a conversation
- **Response**:
  - With conversationId and documentId: Returns specific document analysis
  - With conversationId only: Returns full conversation with all documents
  - Without conversationId: Returns a list of document analysis conversations

#### DELETE Request
- Deletes a document from a conversation
- **Query Parameters**:
  - `conversationId`: ID of the conversation
  - `documentId`: ID of the document to delete
- **Response**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

### Health Education

- **Endpoint**: `/api/ai/health-education`
- **Methods**: `POST`, `GET`, `PATCH`
- **Authentication**: Required
- **Description**: Generates and manages personalized health education content

#### POST Request
- Generates personalized health education content
- **Request Body**:
  ```json
  {
    "contentType": "string",  // 'article', 'video', 'simulation', 'game', 'plan'
    "topic": "string",  // Health topic to focus on
    "additionalInfo": "string (optional)",  // Additional requirements
    "conversationId": "string (optional)"  // Existing conversation ID
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "string",
    "healthEducation": {
      "contentType": "string",
      "title": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "interactionData": {
        "completionStatus": "string",
        "progress": "number"
      },
      "createdAt": "date"
    },
    "message": "string"
  }
  ```

#### GET Request
- Retrieves health education content
- **Query Parameters**:
  - `conversationId` (optional): Retrieves a specific conversation
  - `contentId` (optional): Retrieves a specific content item from a conversation
- **Response**:
  - With conversationId and contentId: Returns specific content
  - With conversationId only: Returns full conversation with all content
  - Without conversationId: Returns a list of health education conversations

#### PATCH Request
- Updates interaction data for health education content
- **Request Body**:
  ```json
  {
    "conversationId": "string",
    "contentId": "string",
    "interactionData": {
      "completionStatus": "string (optional)",  // 'not_started', 'in_progress', 'completed'
      "progress": "number (optional)",  // 0-100
      "score": "number (optional)",
      "timeSpent": "number (optional)"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "updatedInteractionData": {
      "completionStatus": "string",
      "progress": "number",
      "score": "number",
      "timeSpent": "number",
      "lastInteraction": "date"
    }
  }
  ```

## Components & UI Implementation

### General Conversation

The general conversation component provides a chat interface where users can ask health-related questions:

- **Features**:
  - Real-time conversation with AI
  - Conversation history sidebar
  - Markdown formatting of responses
  - Code syntax highlighting
  - Suggested prompts for new users
  - Ability to create new conversations

### Symptom Checker

The symptom checker allows users to input their symptoms and receive possible diagnoses:

- **Features**:
  - Input multiple symptoms with tags
  - Specify duration and severity
  - View possible conditions with probability indicators
  - Color-coded severity indicators
  - Recommended actions based on analysis
  - Follow-up questions to refine diagnosis
  - Save and manage symptom check history

### Health Recommendations

Generates personalized health advice based on the user's medical profile:

- **Features**:
  - Categorized recommendations (diet, exercise, etc.)
  - Explanations for why each recommendation is suggested
  - Ability to save favorite recommendations
  - Request specific recommendations for particular health goals

### Risk Assessment

Evaluates potential health risks based on the user's medical history and lifestyle:

- **Features**:
  - Risk scoring for various health conditions
  - Visual representation of risk levels
  - Identification of contributing factors
  - Actionable recommendations to reduce risks
  - Historical tracking of risk assessments

### Early Warning System

Monitors health data patterns to detect concerning trends:

- **Features**:
  - Identification of concerning patterns
  - Severity classification of potential issues
  - Suggested preventive actions
  - Integration with the user's medical record data

### Document Analysis

The document analysis component allows users to upload and analyze medical documents:

- **Features**:
  - Drag-and-drop file upload
  - Support for multiple file formats (PDF, JPEG, PNG, GIF, DOCX, TXT)
  - Document type categorization
  - AI-powered document analysis
  - Extraction of key findings
  - Severity classification of findings
  - Recommendations based on document content
  - Warnings about concerning information
  - Document management and history
  - Integration with the user's medical context

### Health Education

The health education component provides personalized educational content for patients:

- **Features**:
  - Multiple content types (articles, videos, simulations, games, plans)
  - Personalized to user's medical profile and conditions
  - Progress tracking and completion status
  - Interactive elements for games and simulations
  - Wellness plan creation and management
  - Content history and categorization
  - Rich content rendering with Markdown support
  - Medical procedure simulations with VR-ready descriptions
  - Gamified health learning modules with scoring

## Security & Privacy

The AI system is designed with privacy and security as top priorities:

1. **Data Protection**:
   - All AI interactions are stored in the user's secure database record
   - Medical data is only accessed with proper authentication
   - No persistent storage on third-party systems

2. **Context Management**:
   - Medical context is added during API calls but not stored by the AI provider
   - User identifiable information is removed from context where possible

3. **Disclaimer & Limitations**:
   - Clear disclaimers about the non-diagnostic nature of AI advice
   - Recommendations to consult healthcare professionals
   - Transparency about AI limitations

## Implementation Guidance

### Adding a New AI Feature

1. **Define the schema** in the `AIConversation` model
2. **Create the API endpoint** in the appropriate route file
3. **Implement the React component** for the user interface
4. **Define TypeScript interfaces** in the types directory
5. **Update documentation** to reflect the new feature

### Customizing System Prompts

System prompts are critical to AI performance and are customized based on:

1. **User medical record** - contextualizes responses to the user's health situation
2. **Feature purpose** - different prompts for symptom checking vs general conversation
3. **Response structure** - guides the model to produce structured, parsable outputs

### Best Practices

1. **Error Handling**: Implement robust error handling for API failures
2. **Loading States**: Always show loading indicators during AI processing
3. **Fallbacks**: Provide fallback options when AI services are unavailable
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Response Validation**: Validate AI responses before displaying to users

## Future Enhancements

Planned improvements to the AI system include:

1. **Multi-modal support** - allowing users to upload images for analysis
2. **Voice interaction** - enabling voice input and output
3. **Longitudinal health tracking** - analyzing health trends over time
4. **Medication interaction checker** - identifying potential drug interactions
5. **Treatment effectiveness analysis** - evaluating the effectiveness of current treatments
6. **Multilingual support** - providing AI assistance in multiple languages
7. **Integration with wearable device data** - incorporating real-time health metrics 
8. **Enhanced learning paths** - creating structured sequences of health education content
9. **Content recommendation engine** - suggesting relevant health education based on user profile
10. **VR/AR integration** - deeper integration with VR/AR for immersive medical procedure simulations 