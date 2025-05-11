import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const HealthRecommendationSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['diet', 'exercise', 'medication', 'lifestyle', 'general'],
    required: true
  },
  recommendation: {
    type: String,
    required: true
  },
  reasonForRecommendation: {
    type: String
  },
  basedOnFactors: [String],
  saved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SymptomCheckSchema = new mongoose.Schema({
  symptoms: [String],
  possibleConditions: [{
    condition: String,
    probability: Number, // 0-100
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  recommendedAction: {
    type: String,
    enum: ['self-care', 'consult', 'urgent', 'emergency']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const HealthRiskAssessmentSchema = new mongoose.Schema({
  riskType: {
    type: String,
    enum: ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'obesity', 'other'],
    required: true
  },
  riskScore: {
    type: Number, // 0-100
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very_high'],
    required: true
  },
  contributingFactors: [String],
  recommendations: [String],
  assessmentDate: {
    type: Date,
    default: Date.now
  }
});

// New schema for health education content
const HealthEducationSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['article', 'video', 'simulation', 'game', 'plan'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: String,
  mediaUrl: String,
  tags: [String],
  relevantConditions: [String],
  interactionData: {
    completionStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    progress: {
      type: Number, // 0-100
      default: 0
    },
    score: Number,
    timeSpent: Number, // in seconds
    lastInteraction: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AIConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationType: {
    type: String,
    enum: ['general', 'symptom_check', 'health_recommendation', 'risk_assessment', 'early_warning', 'document_analysis', 'health_education'],
    default: 'general'
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [MessageSchema],
  healthRecommendations: [HealthRecommendationSchema],
  symptomChecks: [SymptomCheckSchema],
  healthRiskAssessments: [HealthRiskAssessmentSchema],
  earlyWarningFlags: [{
    issue: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    suggestedAction: String,
    detectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documentAnalyses: [{
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['medical_report', 'lab_result', 'imaging', 'prescription', 'other'],
      default: 'other'
    },
    storageUrl: String,
    thumbnailUrl: String,
    analysis: {
      summary: String,
      findings: [{
        finding: String,
        importance: {
          type: String,
          enum: ['normal', 'note', 'warning', 'critical']
        },
        location: String, // Area of document or body part
        confidence: Number // 0-100
      }],
      recommendations: [String],
      warnings: [{
        warning: String,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        }
      }]
    }
  }],
  // New field for health education content
  healthEducation: [HealthEducationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.AIConversation || mongoose.model('AIConversation', AIConversationSchema); 