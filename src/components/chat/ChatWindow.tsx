'use client';

import { useState, useEffect, useRef } from 'react';
import { ConversationWithParticipantInfo, ChatMessage } from '@/types/chat';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ChatWindowProps {
  conversation: ConversationWithParticipantInfo;
  onNewMessage: () => void;
  onBackClick?: () => void;
}

export default function ChatWindow({ conversation, onNewMessage, onBackClick }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPotential = conversation.isPotential;
  
  // Fetch messages for the conversation
  useEffect(() => {
    if (conversation && !isPotential) {
      fetchMessages();
    } else {
      // For potential conversations, we don't need to fetch messages
      setLoading(false);
      setMessages([]);
    }
  }, [conversation._id, isPotential]);
  
  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  // Scroll to bottom after messages are loaded or when a new message is sent
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages]);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for conversation:', conversation._id);
      console.log('Other participant type:', conversation.otherParticipant?.type);
      
      const response = await fetch(`/api/chat/messages?conversationId=${conversation._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.messages?.length || 0} messages`);
      
      // Verify message display logic with our isCurrentUser function
      if (data.messages && data.messages.length > 0) {
        const sample = data.messages[0];
        console.log('Sample message:', {
          content: sample.message,
          senderType: sample.senderType,
          otherParticipantType: conversation.otherParticipant?.type,
          isFromCurrentUser: isCurrentUser(sample)
        });
      }
      
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim() || !session?.user?.email) return;
    
    try {
      setSending(true);
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: conversation.otherParticipant?.id,
          recipientType: conversation.otherParticipant?.type || 'Doctor',
          message: inputValue,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Clear input and refetch messages
      setInputValue('');
      fetchMessages();
      onNewMessage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp for display
  const formatTime = (timestamp: Date | string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if the message is from the current user
  const isCurrentUser = (message: ChatMessage) => {
    // In a conversation, if otherParticipant is User, we're Doctor and vice versa
    // So message is from current user if the sender type is NOT the same as otherParticipant type
    return message.senderType !== conversation.otherParticipant?.type;
  };
  
  // Get doctor specialization if available
  const doctorSpecialization = (conversation.otherParticipant as any)?.specialization;
  const doctorHospital = (conversation.otherParticipant as any)?.hospital;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
        <div className="flex items-center">
          {/* Mobile back button */}
          {onBackClick && (
            <button 
              onClick={onBackClick}
              className="mr-2 md:hidden rounded-full p-1 hover:bg-blue-100"
              aria-label="Back to conversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="relative">
            {conversation.otherParticipant?.profileImage ? (
              conversation.otherParticipant.profileImage.startsWith('data:') ? (
                // Handle data URLs directly with img tag
                <img
                  src={conversation.otherParticipant.profileImage}
                  alt={conversation.otherParticipant.name || 'Doctor'}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                // Use Next.js Image for regular URLs
                <Image
                  src={conversation.otherParticipant.profileImage}
                  alt={conversation.otherParticipant.name || 'Doctor'}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              )
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                {(conversation.otherParticipant?.name || 'Dr').charAt(0)}
              </div>
            )}
            
            {conversation.otherParticipant?.type === 'Doctor' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="font-medium text-gray-900 text-lg">
              {conversation.otherParticipant?.name || 'Doctor'}
            </h3>
            
            <div className="flex flex-col mt-1">
              {doctorSpecialization && (
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 font-medium">
                    {doctorSpecialization}
                  </span>
                </div>
              )}
              
              {doctorHospital && (
                <div className="flex items-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    {doctorHospital}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className={`rounded-full p-3 mb-3 ${isPotential ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPotential ? 'text-blue-600' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">
              {isPotential ? 'Start a conversation with your doctor' : 'No messages yet'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isPotential 
                ? `Send a message to ${conversation.otherParticipant?.name || 'your doctor'} to start the conversation`
                : 'Start the conversation by sending a message'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-2">
            {messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-2 ${
                    isCurrentUser(message)
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isCurrentUser(message) ? 'text-emerald-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                    {message.read && isCurrentUser(message) && (
                      <span className="ml-1">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0 safe-bottom">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
            {error}
            <button
              className="ml-2 text-red-500 hover:text-red-700"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isPotential 
                ? `Send your first message to ${conversation.otherParticipant?.name || 'your doctor'}...` 
                : "Type a message..."}
              className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none max-h-32 ${
                isPotential 
                  ? 'border-blue-300 focus:ring-blue-500' 
                  : 'border-gray-300 focus:ring-emerald-500'
              }`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            className={`p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isPotential 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {sending ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 