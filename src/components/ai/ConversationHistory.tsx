'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const CONVERSATION_TYPES = {
  GENERAL: 'general',
  SYMPTOM_CHECK: 'symptom_check',
  HEALTH_RECOMMENDATION: 'health_recommendation',
  RISK_ASSESSMENT: 'risk_assessment',
  EARLY_WARNING: 'early_warning',
  DOCUMENT_ANALYSIS: 'document_analysis',
  HEALTH_EDUCATION: 'health_education'
};

interface Conversation {
  _id: string;
  title: string;
  conversationType: string;
  createdAt: string;
  lastUpdated: string;
}

type ConversationHistoryProps = {
  activeTab: 'general' | 'symptom_check' | 'health_recommendation' | 'risk_assessment' | 'early_warning' | 'document_analysis' | 'health_education';
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string | null;
  highlightUpdated?: boolean;
};

export default function ConversationHistory({ 
  activeTab, 
  onSelectConversation, 
  onNewConversation,
  currentConversationId
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Map activeTab to the corresponding conversationType
        let conversationType;
        switch (activeTab) {
          case 'symptom_check':
            conversationType = CONVERSATION_TYPES.SYMPTOM_CHECK;
            break;
          case 'health_recommendation':
            conversationType = CONVERSATION_TYPES.HEALTH_RECOMMENDATION;
            break;
          case 'risk_assessment':
            conversationType = CONVERSATION_TYPES.RISK_ASSESSMENT;
            break;
          case 'early_warning':
            conversationType = CONVERSATION_TYPES.EARLY_WARNING;
            break;
          case 'document_analysis':
            conversationType = CONVERSATION_TYPES.DOCUMENT_ANALYSIS;
            break;
          case 'health_education':
            conversationType = CONVERSATION_TYPES.HEALTH_EDUCATION;
            break;
          default:
            conversationType = CONVERSATION_TYPES.GENERAL;
        }
        
        const response = await fetch(`/api/ai?conversationType=${conversationType}`);
        
        if (!response.ok) {
          throw new Error('Failed to load conversations');
        }
        
        const data = await response.json();
        // Check if data has a conversations property (new API format)
        // or if it's directly an array of conversations (old format)
        const conversationsData = data.conversations || data;
        setConversations(conversationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
        console.error('Error loading conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [activeTab]);
  
  // Delete conversation
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/ai?conversationId=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Remove from state
      setConversations(prev => prev.filter(conv => conv._id !== id));
      
      // If the deleted conversation was selected, create a new one
      if (id === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      // Show error message in UI
    } finally {
      setIsDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Display appropriate icon based on conversation type
  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'general':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        );
      case 'health_recommendation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
          </svg>
        );
      case 'symptom_check':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        );
      case 'risk_assessment':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        );
      case 'early_warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        );
      case 'document_analysis':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        );
      case 'health_education':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-2">Conversation History</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
               className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* New Conversation Button */}
      <button
        onClick={onNewConversation}
        className="m-4 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium py-2 px-4 rounded-lg border border-emerald-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Conversation
      </button>

      {/* Conversations List */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            {searchQuery ? 'No conversations matching your search' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            <AnimatePresence>
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectConversation(conv._id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer group transition-colors
                    ${currentConversationId === conv._id 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`flex-shrink-0 p-2 rounded-full 
                      ${currentConversationId === conv._id ? 'bg-emerald-200' : 'bg-gray-200'}`}>
                      {getConversationIcon(conv.conversationType)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(conv.lastUpdated)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Delete button - only visible on hover or when conversation is selected */}
                  <button
                    onClick={(e) => handleDeleteClick(e, conv._id)}
                    className={`p-1 rounded-full ${
                      currentConversationId === conv._id 
                        ? 'text-emerald-600 hover:bg-emerald-200'
                        : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'
                    } opacity-0 group-hover:opacity-100 transition-opacity`}
                    aria-label="Delete conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => conversationToDelete && deleteConversation(conversationToDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 