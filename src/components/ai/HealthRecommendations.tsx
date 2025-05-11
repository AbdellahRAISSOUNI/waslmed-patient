'use client';

import React, { useState, useEffect } from 'react';
import { HealthRecommendation, HealthRecommendationsResponse } from '@/types/ai';
import { motion } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

type CategoryType = 'diet' | 'exercise' | 'medication' | 'lifestyle' | 'general';

export default function HealthRecommendations() {
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('general');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Categories with icons
  const categories: { id: CategoryType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'general',
      name: 'General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      )
    },
    {
      id: 'diet',
      name: 'Diet',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1 .53 0L12.53 3.5l.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 1 1 .53 0l.265.39.265-.39a.375.375 0 0 1 .53 0l.265.39.265-.39z" />
        </svg>
      )
    },
    {
      id: 'exercise',
      name: 'Exercise',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
        </svg>
      )
    },
    {
      id: 'medication',
      name: 'Medication',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      )
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      )
    }
  ];

  // Load existing recommendations on mount
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/ai/health-recommendations');
        
        if (!response.ok) {
          if (response.status !== 404) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load health recommendations');
          }
          return;
        }

        const data: HealthRecommendationsResponse = await response.json();
        
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
        // Don't show error for loading previous recommendations
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  // Generate new recommendations
  const generateRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/health-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recommendations');
      }

      const data: HealthRecommendationsResponse = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(prev => [...data.recommendations, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error generating recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recommendations by selected category
  const filteredRecommendations = recommendations.filter(
    rec => selectedCategory === 'general' || rec.category === selectedCategory
  );

  return (
    <div>
      {/* Category selector */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-2">Select category:</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="mb-6">
        <button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : `Generate ${selectedCategory} recommendations`}
        </button>
      </div>

      {/* Error message */}
      {error && <ErrorMessage message={error} onRetry={generateRecommendations} />}

      {/* Loading indicator */}
      {isLoading && !error && (
        <div className="my-8 flex justify-center">
          <div className="text-center">
            <div className="inline-block">
              <LoadingIndicator />
            </div>
            <p className="text-gray-600 mt-2">Generating personalized recommendations...</p>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 && !isLoading ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="bg-gray-100 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-medium mb-1">No recommendations yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Generate your first health recommendation by clicking the button above.
            </p>
          </div>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    recommendation.category === 'diet' ? 'bg-blue-100 text-blue-800' :
                    recommendation.category === 'exercise' ? 'bg-green-100 text-green-800' :
                    recommendation.category === 'medication' ? 'bg-purple-100 text-purple-800' :
                    recommendation.category === 'lifestyle' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {recommendation.category}
                  </span>
                  {recommendation.createdAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(recommendation.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{recommendation.recommendation}</h3>
                {recommendation.reasonForRecommendation && (
                  <p className="text-gray-700 text-sm">{recommendation.reasonForRecommendation}</p>
                )}
                {recommendation.basedOnFactors && recommendation.basedOnFactors.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Based on:</h4>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.basedOnFactors.map((factor, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 