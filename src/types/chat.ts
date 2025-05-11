import { Types } from 'mongoose';

export interface ChatMessage {
  _id?: string;
  senderId: string | Types.ObjectId;
  senderType: 'User' | 'Doctor';
  recipientId: string | Types.ObjectId;
  recipientType: 'User' | 'Doctor';
  message: string;
  timestamp: Date;
  read: boolean;
  readAt?: Date;
  attachments?: {
    type: 'image' | 'document' | 'other';
    url: string;
    name: string;
    size: number;
  }[];
}

export interface Participant {
  id: string | Types.ObjectId;
  type: 'User' | 'Doctor';
  name: string;
  profileImage?: string;
}

export interface LastMessage {
  sender: string | Types.ObjectId;
  senderType: 'User' | 'Doctor';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount: Map<string, number> | Record<string, number> | number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isPotential?: boolean;
}

export interface ConversationWithParticipantInfo extends Omit<Conversation, 'participants'> {
  otherParticipant: Participant;
  isPotential?: boolean;
}

export interface SendMessageRequest {
  recipientId: string;
  recipientType: 'User' | 'Doctor';
  message: string;
  attachments?: {
    type: 'image' | 'document' | 'other';
    url: string;
    name: string;
    size: number;
  }[];
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

export interface GetConversationsResponse {
  conversations: ConversationWithParticipantInfo[];
  hasMore: boolean;
}

export interface MarkAsReadRequest {
  conversationId: string;
}

export interface ChatNotification {
  type: 'new_message' | 'read_receipt';
  message?: ChatMessage;
  conversationId: string;
  senderId: string;
  senderType: 'User' | 'Doctor';
} 