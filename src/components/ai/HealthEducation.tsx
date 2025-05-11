'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import ConversationHistory from './ConversationHistory';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

type HealthEducationContent = {
  _id: string;
  contentType: 'article' | 'video' | 'simulation' | 'game' | 'plan';
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: string;
  interactionData: {
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    score?: number;
    timeSpent?: number;
    lastInteraction?: string;
  };
};

const CONVERSATION_TYPES = {
  HEALTH_EDUCATION: 'health_education'
};

export default function HealthEducation() {
  const [contentType, setContentType] = useState<string>('article');
  const [topic, setTopic] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<HealthEducationContent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [historyUpdated, setHistoryUpdated] = useState(false);
  
  // Reset history updated flag
  useEffect(() => {
    if (historyUpdated) {
      setTimeout(() => setHistoryUpdated(false), 2000);
    }
  }, [historyUpdated]);

  // Clean up any HTML content for security
  const createSanitizedMarkup = (content: string) => {
    // Use marked.parse and ensure it returns a string
    const html = marked.parse(content) as string;
    const sanitized = DOMPurify.sanitize(html);
    return { __html: sanitized };
  };

  // Generate health education content
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contentType) {
      setError('Please select a content type');
      return;
    }
    
    if (!topic) {
      setError('Please enter a topic');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/health-education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          topic,
          additionalInfo,
          conversationId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }
      
      const data = await response.json();
      setGeneratedContent(data.healthEducation);
      setConversationId(data.conversationId);
      setHistoryUpdated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update content interaction (progress, completion status)
  const updateInteraction = async (interactionData: Partial<HealthEducationContent['interactionData']>) => {
    if (!conversationId || !generatedContent?._id) {
      console.error('Cannot update interaction: missing conversationId or contentId');
      return;
    }
    
    try {
      console.log('Updating interaction data:', { conversationId, contentId: generatedContent._id, interactionData });
      
      const response = await fetch('/api/ai/health-education', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          contentId: generatedContent._id,
          interactionData,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update interaction data', await response.text());
        return;
      }
      
      const data = await response.json();
      console.log('Update successful:', data);
      
      // Update local state
      setGeneratedContent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          interactionData: {
            ...prev.interactionData,
            ...interactionData,
          },
        };
      });
      
      // Signal that history should update
      setHistoryUpdated(true);
    } catch (error) {
      console.error('Error updating interaction:', error);
    }
  };

  // Mark content as completed
  const markAsCompleted = async () => {
    console.log('Marking content as completed');
    
    // Add visual feedback during the process
    if (generatedContent) {
      // First update local state immediately for quick feedback
      setGeneratedContent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          interactionData: {
            ...prev.interactionData,
            completionStatus: 'completed',
            progress: 100,
          },
        };
      });
    }
    
    // Then update the server (which will also update historyUpdated)
    await updateInteraction({
      completionStatus: 'completed',
      progress: 100,
    });
  };

  // Track progress for content types that support it
  const updateProgress = (progress: number) => {
    updateInteraction({
      progress,
      completionStatus: progress >= 100 ? 'completed' : 'in_progress',
    });
  };

  // Reset the form
  const handleReset = () => {
    setContentType('article');
    setTopic('');
    setAdditionalInfo('');
    setGeneratedContent(null);
    setError(null);
  };

  // Load specific conversation
  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai/health-education?conversationId=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      // Extract the most recent health education content
      if (data.conversation?.healthEducation?.length > 0) {
        const latestContent = data.conversation.healthEducation[data.conversation.healthEducation.length - 1];
        setGeneratedContent(latestContent);
        setContentType(latestContent.contentType);
        // Extract topic from title or tags
        if (latestContent.tags && latestContent.tags.length > 1) {
          // First tag is usually the content type, so use the second one
          setTopic(latestContent.tags[1]);
        } else {
          // Default to title minus the prefix if any
          setTopic(latestContent.title.replace(/^Health Education: /i, ''));
        }
      }
      
      setConversationId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a new conversation
  const startNewConversation = () => {
    handleReset();
    setConversationId(null);
  };

  // Get icon for content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        );
      case 'simulation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
          </svg>
        );
      case 'game':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 4.384-.308 1.53 1.53 0 0 0-.206-2.722" />
          </svg>
        );
      case 'plan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(70vh-2rem)] md:h-[60vh] overflow-hidden rounded-lg shadow-sm">
      {/* Conversation History Sidebar */}
      <motion.div 
        initial={{ width: isHistoryVisible ? '300px' : '0px' }}
        animate={{ width: isHistoryVisible ? '300px' : '0px' }}
        transition={{ duration: 0.3 }}
        className="bg-white overflow-hidden"
      >
        {isHistoryVisible && (
          <ConversationHistory
            activeTab="health_education"
            onSelectConversation={loadConversation}
            onNewConversation={startNewConversation}
            currentConversationId={conversationId}
            highlightUpdated={historyUpdated}
          />
        )}
      </motion.div>
      
      {/* Toggle sidebar button */}
      <button
        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
        className="relative z-10 -ml-3 mt-2 h-8 w-6 bg-emerald-500 hover:bg-emerald-600 rounded-r-md flex items-center justify-center shadow-md transition-colors"
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Content Generation Form */}
        {!generatedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {['article', 'video', 'simulation', 'game', 'plan'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContentType(type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                        contentType === type
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 mb-2 flex items-center justify-center">
                        {getContentTypeIcon(type)}
                      </div>
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Topic Input */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Managing Diabetes, Prenatal Care, Mental Health"
                />
              </div>
              
              {/* Additional Info */}
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Any specific requirements for the content..."
                />
              </div>
              
              {/* Error Message */}
              {error && <ErrorMessage message={error} />}
              
              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && <LoadingIndicator />}
        
        {/* Generated Content Display */}
        {generatedContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-emerald-100">
                  {getContentTypeIcon(generatedContent.contentType)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{generatedContent.title}</h2>
                  <p className="text-sm text-gray-500 capitalize">{generatedContent.contentType}</p>
                </div>
              </div>
              <button
                onClick={() => setGeneratedContent(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Back to form"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">
                  {generatedContent.interactionData.completionStatus === 'completed' 
                    ? 'Completed' 
                    : generatedContent.interactionData.completionStatus === 'in_progress'
                      ? 'In Progress'
                      : 'Not Started'}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {generatedContent.interactionData.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${generatedContent.interactionData.progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tags */}
            {generatedContent.tags && generatedContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {generatedContent.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 prose prose-emerald max-w-none">
              <div dangerouslySetInnerHTML={createSanitizedMarkup(generatedContent.content)} />
            </div>
            
            {/* Interaction Buttons */}
            <div className="flex justify-between items-center">
              {/* Progress Tracker for Game/Simulation */}
              {['game', 'simulation'].includes(generatedContent.contentType) && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateProgress(Math.min(100, (generatedContent.interactionData.progress || 0) + 25))}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm font-medium hover:bg-emerald-200"
                  >
                    + 25% Progress
                  </button>
                </div>
              )}
              
              {/* Mark as Completed Button */}
              {generatedContent.interactionData.completionStatus !== 'completed' && (
                <button
                  onClick={markAsCompleted}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 text-sm font-medium flex items-center transition-transform hover:scale-105 hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Completed
                </button>
              )}
              
              {/* Already Completed Status */}
              {generatedContent.interactionData.completionStatus === 'completed' && (
                <span className="flex items-center text-emerald-600 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 