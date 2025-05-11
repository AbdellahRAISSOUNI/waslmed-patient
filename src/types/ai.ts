// Message type used in AI conversations
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

// Response from general AI conversation endpoint
export interface ConversationResponse {
  conversationId: string;
  message: string;
}

// Possible medical condition from symptom checker
export interface PossibleCondition {
  condition: string;
  probability: number;  // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

// Response from symptom checker API
export interface SymptomCheckResponse {
  conversationId: string;
  message: string;
  analysis: {
    symptoms: string[];
    possibleConditions: PossibleCondition[];
    recommendedAction: 'self-care' | 'consult' | 'urgent' | 'emergency';
    recommendationExplanation: string;
    additionalQuestions?: string[];
    disclaimer: string;
  };
}

// Health recommendation from AI
export interface HealthRecommendation {
  category: 'diet' | 'exercise' | 'medication' | 'lifestyle' | 'general';
  recommendation: string;
  reasonForRecommendation?: string;
  basedOnFactors?: string[];
}

// Response from health recommendations API
export interface HealthRecommendationResponse {
  conversationId: string;
  message: string;
  recommendations: HealthRecommendation[];
}

// Risk assessment result
export interface RiskAssessment {
  riskType: string;
  riskScore: number;  // 0-100
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  contributingFactors: string[];
  recommendations: string[];
}

// Response from risk assessment API
export interface RiskAssessmentResponse {
  conversationId: string;
  message: string;
  assessments: RiskAssessment[];
}

// Early warning flag
export interface EarlyWarningFlag {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
  detectedAt: Date;
}

// Response from early warning API
export interface EarlyWarningResponse {
  conversationId: string;
  message: string;
  warnings: EarlyWarningFlag[];
}

// Document analysis types
export interface DocumentFinding {
  finding: string;
  importance: 'normal' | 'note' | 'warning' | 'critical';
  location?: string;
  confidence: number;
}

export interface DocumentWarning {
  warning: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DocumentAnalysis {
  summary: string;
  findings: DocumentFinding[];
  recommendations: string[];
  warnings: DocumentWarning[];
}

export interface DocumentInfo {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  documentType: 'medical_report' | 'lab_result' | 'imaging' | 'prescription' | 'other';
  storageUrl: string;
  thumbnailUrl?: string;
  analysis: DocumentAnalysis;
}

export interface DocumentAnalysisResponse {
  conversationId: string;
  message: string;
  documentAnalysis: DocumentInfo;
} 

// Health Education types
export interface HealthEducationInteractionData {
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  score?: number;
  timeSpent?: number; // in seconds
  lastInteraction?: Date;
}

export interface HealthEducationContent {
  _id: string;
  contentType: 'article' | 'video' | 'simulation' | 'game' | 'plan';
  title: string;
  description: string;
  content: string;
  mediaUrl?: string;
  tags: string[];
  relevantConditions?: string[];
  interactionData: HealthEducationInteractionData;
  createdAt: string;
}

export interface HealthEducationResponse {
  conversationId: string;
  message: string;
  healthEducation: HealthEducationContent;
}

export interface UpdateInteractionDataRequest {
  conversationId: string;
  contentId: string;
  interactionData: Partial<HealthEducationInteractionData>;
}

export interface UpdateInteractionDataResponse {
  success: boolean;
  updatedInteractionData: HealthEducationInteractionData;
} 