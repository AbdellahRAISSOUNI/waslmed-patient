'use client';

import { useState } from 'react';
import { ConversationWithParticipantInfo } from '@/types/chat';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  conversations: ConversationWithParticipantInfo[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationWithParticipantInfo) => void;
  unreadCounts: Record<string, number>;
  loading: boolean;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  unreadCounts,
  loading
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conv) => {
      // Safely access the name property and handle missing values
      const name = conv.otherParticipant?.name || '';
      const specialization = (conv.otherParticipant as any)?.specialization || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             specialization.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );
  
  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Truncate message content to a preview
  const truncateMessage = (message: string, maxLength = 40) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return `${message.slice(0, maxLength)}...`;
  };
  
  // No conversations state
  if (!loading && conversations.length === 0) {
    return (
      <div className="w-full md:w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">No conversations yet</p>
        </div>
      </div>
    );
  }
  
  // Separate real and potential conversations
  const realConversations = filteredConversations.filter(conv => !conv.isPotential);
  const potentialConversations = filteredConversations.filter(conv => conv.isPotential);
  
  return (
    <div className="w-full md:w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 sticky top-0 z-10 bg-gray-50">
        <h2 className="font-semibold text-gray-900 text-xl">Messages</h2>
        <div className="mt-2 relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute right-3 top-2.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse flex flex-col space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                      <div className="bg-gray-200 h-3 w-1/2 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Active conversations */}
              {realConversations.map((conversation) => (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 border-b border-gray-200 cursor-pointer transition-colors md:hover:bg-gray-100 touch-active:bg-gray-100 ${
                    selectedConversationId === conversation._id
                      ? 'bg-emerald-50'
                      : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      {conversation.otherParticipant?.profileImage ? (
                        conversation.otherParticipant.profileImage.startsWith('data:') ? (
                          // Handle data URLs directly with img tag
                          <img
                            src={conversation.otherParticipant.profileImage}
                            alt={conversation.otherParticipant.name || 'Doctor'}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          // Use Next.js Image for regular URLs
                          <Image
                            src={conversation.otherParticipant.profileImage}
                            alt={conversation.otherParticipant.name || 'Doctor'}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        )
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium border border-emerald-200">
                          {(conversation.otherParticipant?.name || 'Dr').charAt(0)}
                        </div>
                      )}
                      
                      {conversation.otherParticipant?.type === 'Doctor' && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.name || 'Doctor'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {(conversation.otherParticipant as any)?.specialization && (
                        <p className="text-xs text-blue-600 truncate">
                          {(conversation.otherParticipant as any).specialization}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        {conversation.lastMessage ? (
                          <p className="text-sm text-gray-600 truncate">
                            {truncateMessage(conversation.lastMessage.content)}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No messages yet</p>
                        )}
                        
                        {unreadCounts[conversation._id] > 0 && (
                          <span className="bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {unreadCounts[conversation._id]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Potential conversations section */}
              {potentialConversations.length > 0 && (
                <div className="pt-2 pb-1 px-3 bg-gray-100 border-b border-gray-200 sticky top-[73px] z-10">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Your Doctors</h3>
                </div>
              )}
              
              {/* Potential conversations */}
              {potentialConversations.map((conversation) => (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 border-b border-gray-200 cursor-pointer transition-colors bg-blue-50 md:hover:bg-blue-100 touch-active:bg-blue-100`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      {conversation.otherParticipant?.profileImage ? (
                        conversation.otherParticipant.profileImage.startsWith('data:') ? (
                          // Handle data URLs directly with img tag
                          <img
                            src={conversation.otherParticipant.profileImage}
                            alt={conversation.otherParticipant.name || 'Doctor'}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          // Use Next.js Image for regular URLs
                          <Image
                            src={conversation.otherParticipant.profileImage}
                            alt={conversation.otherParticipant.name || 'Doctor'}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        )
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium border border-blue-200">
                          {(conversation.otherParticipant?.name || 'Dr').charAt(0)}
                        </div>
                      )}
                      
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.name || 'Doctor'}
                        </h3>
                      </div>
                      
                      {(conversation.otherParticipant as any)?.specialization && (
                        <p className="text-xs text-blue-600 truncate">
                          {(conversation.otherParticipant as any).specialization}
                        </p>
                      )}
                      
                      {(conversation.otherParticipant as any)?.hospital && (
                        <p className="text-xs text-gray-500 truncate">
                          {(conversation.otherParticipant as any).hospital}
                        </p>
                      )}
                      
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-blue-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Start conversation
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
        
        {!loading && filteredConversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
} 