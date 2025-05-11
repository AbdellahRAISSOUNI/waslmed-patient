'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentInfo } from '@/types/ai';
import DocumentUpload from './DocumentUpload';
import DocumentAnalysisResult from './DocumentAnalysisResult';
import ConversationHistory from './ConversationHistory';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';

interface ConversationHistoryProps {
  conversations: Array<{
    _id: string;
    title: string;
    conversationType: string;
    createdAt: string;
    lastUpdated: string;
  }>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  loading: boolean;
  type: string;
}

interface Conversation {
  _id: string;
  title: string;
  conversationType: string;
  createdAt: string;
  lastUpdated: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  documentAnalyses: DocumentInfo[];
}

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(!conversationId);
  
  // Load conversations on initial render
  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Load specific conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      setShowUploadForm(false);
    } else {
      setCurrentConversation(null);
      setShowUploadForm(true);
    }
  }, [conversationId]);
  
  // Fetch all document analysis conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/document-analysis');
      
      if (!response.ok) {
        throw new Error('Failed to fetch document conversations');
      }
      
      const data = await response.json();
      setConversations(data);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a specific conversation
  const fetchConversation = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/document-analysis?conversationId=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      
      const data = await response.json();
      setCurrentConversation(data);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      router.push('/dashboard/documents');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle upload success
  const handleUploadSuccess = (conversationId: string, documentInfo: any) => {
    fetchConversation(conversationId);
    fetchConversations();
    router.push(`/dashboard/documents?id=${conversationId}`);
  };
  
  // Handle starting a new upload
  const handleNewUpload = () => {
    router.push('/dashboard/documents');
    setShowUploadForm(true);
    setCurrentConversation(null);
  };
  
  // Handle conversation selection
  const handleConversationSelect = (id: string) => {
    router.push(`/dashboard/documents?id=${id}`);
  };
  
  // Handle conversation deletion
  const handleConversationDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ai?conversationId=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Remove from local state
      setConversations(conversations.filter(conv => conv._id !== id));
      
      // If the deleted conversation was the current one, go back to the list
      if (currentConversation && currentConversation._id === id) {
        router.push('/dashboard/documents');
        setCurrentConversation(null);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation');
    }
  };

  // Close error message
  const handleCloseError = () => {
    setError(null);
  };
  
  return (
    <div className="flex flex-col h-full max-w-full">
      <div className="flex-none pb-4 mb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Medical Document Analysis</h2>
          <button
            onClick={handleNewUpload}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center self-start sm:self-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upload New Document
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
          <button 
            onClick={handleCloseError}
            className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex-grow flex flex-col lg:flex-row h-full w-full">
        {/* Conversation history sidebar */}
        <div className="w-full lg:w-64 flex-none lg:border-r border-gray-200 lg:pr-4 mb-4 lg:mb-0 overflow-auto">
          <h3 className="text-lg font-medium text-gray-700 mb-3">History</h3>
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No document analyses yet
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentConversation?._id === conversation._id
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleConversationSelect(conversation._id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-800 truncate">
                      {conversation.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConversationDelete(conversation._id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="flex-grow lg:pl-4 overflow-auto flex flex-col">
          {loading && currentConversation === null ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </div>
          ) : showUploadForm && !currentConversation ? (
            <div className="max-w-3xl mx-auto w-full">
              <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : currentConversation ? (
            <div className="flex-grow overflow-auto flex flex-col">
              {/* Document list */}
              {currentConversation.documentAnalyses.length > 0 ? (
                <div className="flex-grow overflow-y-auto pb-4 space-y-6">
                  {currentConversation.documentAnalyses.map((doc, index) => (
                    <DocumentAnalysisResult key={index} document={doc} />
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center p-8 max-w-md mx-auto">
                    <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Documents</h3>
                    <p className="text-gray-600 mb-4">This conversation doesn't have any documents yet.</p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      Upload a Document
                    </button>
                  </div>
                </div>
              )}
              
              {/* Show upload form button */}
              {currentConversation.documentAnalyses.length > 0 && (
                <div className="flex-none mt-6 pt-4 border-t border-gray-200 max-w-3xl mx-auto w-full">
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="text-emerald-600 font-medium text-sm flex items-center hover:text-emerald-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d={showUploadForm ? "M19.5 12h-15" : "M12 4.5v15m7.5-7.5h-15"} />
                    </svg>
                    {showUploadForm ? 'Hide Upload Form' : 'Upload Another Document'}
                  </button>
                  
                  {/* Conditionally show upload form */}
                  {showUploadForm && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <DocumentUpload 
                        onUploadSuccess={handleUploadSuccess} 
                        conversationId={currentConversation._id} 
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Conversation messages - only show if there are more than 2 messages */}
              {currentConversation.messages.length > 2 && (
                <div className="flex-none mt-6 pt-6 border-t border-gray-200 max-w-3xl mx-auto w-full">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Conversation</h3>
                    <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-500">
                      {currentConversation.messages.length} messages
                    </div>
                  </div>
                  <div className="space-y-4 overflow-hidden">
                    {currentConversation.messages.map((message, index) => (
                      message.role !== 'system' && (
                        <Message 
                          key={index}
                          role={message.role as 'user' | 'assistant' | 'system'}
                          content={message.content}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09L9 18.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Get Started with Document Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Upload medical documents like scans, reports, lab results, and more for AI-powered analysis.
                </p>
                <button
                  onClick={handleNewUpload}
                  className="px-5 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Your First Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 