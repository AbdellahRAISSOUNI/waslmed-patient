'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SymptomCheckResponse, PossibleCondition } from '@/types/ai';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import ConversationHistory from './ConversationHistory';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SymptomCheckResponse['analysis'] | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  // Add a symptom to the list
  const addSymptom = () => {
    if (!symptomInput.trim()) return;
    
    // Add symptom if not already in the list
    if (!symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
    }
    
    setSymptomInput('');
  };

  // Remove a symptom from the list
  const removeSymptom = (symptomToRemove: string) => {
    setSymptoms(symptoms.filter(s => s !== symptomToRemove));
  };

  // Submit the form to check symptoms
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (symptoms.length === 0) {
      setError('Please enter at least one symptom');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/symptom-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          additionalInfo,
          conversationId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze symptoms');
      }
      
      const data: SymptomCheckResponse = await response.json();
      setAnalysis(data.analysis);
      setConversationId(data.conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error analyzing symptoms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setSymptoms([]);
    setSymptomInput('');
    setDuration('');
    setSeverity('');
    setAdditionalInfo('');
    setAnalysis(null);
    setError(null);
  };

  // Load specific conversation
  const loadConversation = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai?conversationId=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      
      // Extract symptom check data if available
      if (data.symptomChecks && data.symptomChecks.length > 0) {
        const latestCheck = data.symptomChecks[data.symptomChecks.length - 1];
        
        setSymptoms(latestCheck.symptoms || []);
        
        // Try to reconstruct analysis from available data
        if (latestCheck.possibleConditions) {
          setAnalysis({
            symptoms: latestCheck.symptoms || [],
            possibleConditions: latestCheck.possibleConditions.map((condition: any) => ({
              condition: condition.condition,
              probability: condition.probability,
              severity: condition.severity,
              description: "Loaded from previous analysis"
            })),
            recommendedAction: latestCheck.recommendedAction || "consult",
            recommendationExplanation: "Based on your previous symptom analysis",
            disclaimer: "This analysis is for informational purposes only and not a substitute for professional medical advice."
          });
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

  // Get severity level color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get action level color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'self-care': return 'bg-green-100 text-green-800';
      case 'consult': return 'bg-blue-100 text-blue-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            activeTab="symptom-check"
            onSelectConversation={loadConversation}
            onNewConversation={startNewConversation}
            currentConversationId={conversationId}
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
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 grid md:grid-cols-2 gap-6 p-6 overflow-auto">
          {/* Left column: Symptom input form */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-5">
              <h3 className="font-medium text-gray-900 mb-4">Enter Your Symptoms</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Symptom input */}
                <div>
                  <label htmlFor="symptom" className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="symptom"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder="Enter a symptom"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={addSymptom}
                      disabled={!symptomInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-3 py-2 text-sm font-medium disabled:bg-emerald-300"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Symptom tags */}
                  {symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {symptoms.map((symptom, index) => (
                        <div key={index} className="bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-sm flex items-center">
                          {symptom}
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="ml-2 text-emerald-500 hover:text-emerald-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Duration input */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (optional)
                  </label>
                  <input
                    type="text"
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 3 days, 2 weeks, etc."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                {/* Severity input */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                    Severity (optional)
                  </label>
                  <select
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                
                {/* Additional info */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any other details that might be relevant..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                {/* Error message */}
                {error && <ErrorMessage message={error} />}
                
                {/* Form buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || symptoms.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        Check Symptoms
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right column: Results */}
          <div>
            {isLoading && !analysis ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your symptoms...</p>
                </div>
              </div>
            ) : analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col"
              >
                <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4">
                  <h3 className="font-medium">Symptom Analysis Results</h3>
                  <p className="text-sm mt-1 text-white/90">Based on: {analysis.symptoms.join(', ')}</p>
                </div>
                
                <div className="p-5 space-y-5 overflow-auto flex-grow">
                  {/* Recommended action */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Recommended Action</h4>
                    <div className="flex items-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getActionColor(analysis.recommendedAction)}`}>
                        {analysis.recommendedAction.charAt(0).toUpperCase() + analysis.recommendedAction.slice(1)}
                      </span>
                      <p className="ml-3 text-sm text-gray-600">{analysis.recommendationExplanation}</p>
                    </div>
                  </div>
                  
                  {/* Possible conditions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Possible Conditions</h4>
                    <div className="space-y-3">
                      {analysis.possibleConditions.map((condition: PossibleCondition, index: number) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                              <h5 className="font-medium text-gray-900">{condition.condition}</h5>
                              <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                                {condition.severity}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-700">{condition.probability}%</span>
                              <div className="w-20 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${condition.probability}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          {condition.description && (
                            <p className="text-sm text-gray-600">{condition.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Additional questions */}
                  {analysis.additionalQuestions && analysis.additionalQuestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Questions to Consider</h4>
                      <ul className="space-y-1">
                        {analysis.additionalQuestions.map((question, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-emerald-500 mr-2">•</span>
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Disclaimer */}
                  <div className="text-xs text-gray-500 mt-4 border-t border-gray-200 pt-4">
                    <p>{analysis.disclaimer || 'This is not a medical diagnosis. Always consult with a healthcare professional for proper medical advice and treatment.'}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center text-center">
                <div>
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Symptom Checker</h3>
                  <p className="text-gray-600 text-sm">Enter your symptoms on the left to get an analysis of possible conditions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 