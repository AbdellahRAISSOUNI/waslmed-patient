'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSession } from 'next-auth/react';
import { ConversationWithParticipantInfo } from '@/types/chat';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import EmptyState from '@/components/chat/EmptyState';

export default function MessagingPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<ConversationWithParticipantInfo[]>([]);
  const [potentialConversations, setPotentialConversations] = useState<ConversationWithParticipantInfo[]>([]);
  const [allConversations, setAllConversations] = useState<ConversationWithParticipantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipantInfo | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [showSidebar, setShowSidebar] = useState(true);

  // Fetch conversations
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Session user:', session.user);
      fetchConversations();
      fetchConnectedDoctors();
    }
  }, [status]);

  // Combine conversations
  useEffect(() => {
    setAllConversations([...conversations, ...potentialConversations]);
  }, [conversations, potentialConversations]);
  
  // Hide sidebar on mobile when conversation is selected
  useEffect(() => {
    if (selectedConversation && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);
  
  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
      
      // Extract unread counts - handle both Map and number types
      const counts: Record<string, number> = {};
      data.conversations.forEach((conv: ConversationWithParticipantInfo) => {
        if (conv.unreadCount) {
          // Check if unreadCount is a Map or a simple number/object
          if (typeof conv.unreadCount === 'object' && conv.unreadCount !== null && 'get' in conv.unreadCount && session?.user?.email) {
            counts[conv._id] = (conv.unreadCount as Map<string, number>).get(session.user.email) || 0;
          } else if (typeof conv.unreadCount === 'number') {
            counts[conv._id] = conv.unreadCount;
          } else if (typeof conv.unreadCount === 'object' && conv.unreadCount !== null) {
            // Handle the case where it might be an object with user/doctor IDs as keys
            const userId = session?.user?.email || '';
            counts[conv._id] = (conv.unreadCount as Record<string, number>)[userId] || 0;
          } else {
            counts[conv._id] = 0;
          }
        } else {
          counts[conv._id] = 0;
        }
      });
      
      setUnreadCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedDoctors = async () => {
    try {
      const response = await fetch('/api/chat/connected-doctors');
      
      if (!response.ok) {
        throw new Error('Failed to fetch connected doctors');
      }
      
      const data = await response.json();
      setPotentialConversations(data.potentialConversations || []);
    } catch (err) {
      console.error('Error fetching connected doctors:', err);
      // Don't set error state as this is a secondary feature
    }
  };

  const handleSelectConversation = (conversation: ConversationWithParticipantInfo) => {
    // If this is a potential conversation (no actual conversation yet),
    // create a new conversation with the doctor
    if (conversation.isPotential) {
      // Create a new real conversation and set it as selected
      startNewConversation(conversation);
    } else {
      setSelectedConversation(conversation);
      
      // Reset unread count for this conversation
      setUnreadCounts(prev => ({
        ...prev,
        [conversation._id]: 0
      }));
      
      // Hide sidebar on mobile
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    }
  };

  const startNewConversation = async (potentialConversation: ConversationWithParticipantInfo) => {
    try {
      // Create a temporary conversation object for UI
      const tempConversation = {
        ...potentialConversation,
        _id: potentialConversation._id.replace('potential_', ''),
        isPotential: false
      };
      
      setSelectedConversation(tempConversation);
      
      // Remove this potential conversation
      setPotentialConversations(prev => 
        prev.filter(pc => pc._id !== potentialConversation._id)
      );
      
      // The actual conversation will be created when the first message is sent
    } catch (err) {
      setError('Failed to start conversation');
      console.error('Error starting conversation:', err);
    }
  };

  const handleNewMessage = () => {
    // Refresh conversations after sending a message
    fetchConversations();
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return (
    <DashboardLayout title="Chat with Doctors">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[75vh] md:h-[80vh] flex relative">
        {/* Mobile back button - only show when sidebar is hidden and conversation is selected */}
        {!showSidebar && selectedConversation && (
          <button 
            onClick={toggleSidebar}
            className="absolute left-3 top-3 z-20 md:hidden bg-white rounded-full p-2 shadow-md"
            aria-label="Show conversations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Left sidebar with conversations - conditionally shown based on showSidebar state */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-auto md:min-w-[280px] md:max-w-[320px] absolute md:relative inset-0 z-10 bg-white`}>
          <ChatSidebar 
            conversations={allConversations}
            selectedConversationId={selectedConversation?._id}
            onSelectConversation={handleSelectConversation}
            unreadCounts={unreadCounts}
            loading={loading}
          />
        </div>
        
        {/* Main chat area */}
        <div className={`flex-1 flex flex-col ${!showSidebar ? 'block' : 'hidden md:block'}`}>
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation}
              onNewMessage={handleNewMessage}
              onBackClick={toggleSidebar}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 