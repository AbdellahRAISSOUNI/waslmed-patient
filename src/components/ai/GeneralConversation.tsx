'use client';

import { useState, useRef, useEffect } from 'react';
import { Message as MessageType, ConversationResponse } from '@/types/ai';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import ConversationHistory from './ConversationHistory';
import { motion, AnimatePresence } from 'framer-motion';

export default function GeneralConversation() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Function to send a message to the API
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to the chat
    const userMessage: MessageType = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the general AI endpoint
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          conversationType: 'general',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data: ConversationResponse = await response.json();
      
      // Save conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add assistant message to the chat
      const assistantMessage: MessageType = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsMobileHistoryOpen(false);
      
      const response = await fetch(`/api/ai?conversationId=${conversationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setConversationId(data._id);
        setMessages(data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a new conversation
  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setIsMobileHistoryOpen(false);
  };

  // Example questions for the empty state
  const exampleQuestions = [
    'How should I manage my diabetes?',
    'What are common side effects of aspirin?',
    'What might cause persistent headaches?',
    'How can I improve my sleep quality?',
    'What foods should I avoid with high blood pressure?'
  ];

  return (
    <div className="flex h-[calc(70vh-2rem)] md:h-[65vh] lg:h-[70vh] overflow-hidden rounded-lg shadow-sm relative">
      {/* Mobile History Toggle Button */}
      <button
        onClick={() => setIsMobileHistoryOpen(true)}
        className="md:hidden absolute left-4 top-4 z-20 p-2 bg-white rounded-full shadow-md border border-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile History Overlay */}
      <AnimatePresence>
        {isMobileHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute inset-y-0 left-0 w-80 bg-white z-40 md:hidden shadow-lg"
            >
              <div className="h-full overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Conversations</h2>
                  <button
                    onClick={() => setIsMobileHistoryOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ConversationHistory
                  activeTab="general"
                  onSelectConversation={loadConversation}
                  onNewConversation={startNewConversation}
                  currentConversationId={conversationId}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Conversation History Sidebar */}
      <motion.div 
        initial={{ width: isHistoryVisible ? '300px' : '0px' }}
        animate={{ width: isHistoryVisible ? '300px' : '0px' }}
        transition={{ duration: 0.3 }}
        className="hidden md:block bg-white overflow-hidden"
      >
        {isHistoryVisible && (
          <ConversationHistory
            activeTab="general"
            onSelectConversation={loadConversation}
            onNewConversation={startNewConversation}
            currentConversationId={conversationId}
          />
        )}
      </motion.div>
      
      {/* Desktop Toggle Sidebar Button */}
      <button
        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
        className="relative z-10 -ml-3 mt-2 h-8 w-6 bg-emerald-500 hover:bg-emerald-600 rounded-r-md hidden md:flex items-center justify-center shadow-md transition-colors"
        aria-label={isHistoryVisible ? "Hide conversation history" : "Show conversation history"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2.5} 
          stroke="white" 
          className="w-4 h-4"
          style={{ transform: isHistoryVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gradient-to-br from-white to-emerald-50/30 border-l border-gray-200">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-2 md:p-4">
              <div className="text-center w-full max-w-2xl p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-emerald-100 rounded-full p-3 w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 md:mb-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">WaslMed AI Assistant</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-5">Ask me any health-related questions. I can help with general information, medication guidance, symptom understanding, and more.</p>
                
                {/* Example questions in a responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exampleQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(question);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                      className="py-2 px-3 bg-white hover:bg-emerald-50 border border-gray-200 rounded-lg text-left text-sm text-gray-700 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                      <span className="line-clamp-2">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {/* Conversation information */}
              {conversationId && (
                <div className="mb-3 md:mb-4 bg-white/70 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-gray-200 shadow-sm flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-1.5 md:p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                    </div>
                    <div className="text-xs md:text-sm text-gray-700">
                      <span className="font-medium">Conversation</span>
                      <span className="mx-1.5 text-gray-400">•</span>
                      <span>{messages.length} messages</span>
                    </div>
                  </div>
                  <button
                    onClick={startNewConversation}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Chat
                  </button>
                </div>
              )}
              
              {/* Messages */}
              <div className="space-y-3 md:space-y-4 mb-3 md:mb-4">
                {messages.map((message, index) => (
                  <Message
                    key={index}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && <LoadingIndicator />}
                {error && <ErrorMessage message={error} onRetry={sendMessage} />}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-2 md:p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 max-w-4xl mx-auto relative"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 pr-10 md:pr-12 bg-white rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none max-h-32 text-sm md:text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="submit"
                className="absolute right-2 bottom-2 p-1.5 md:p-2 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue.trim() || isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 