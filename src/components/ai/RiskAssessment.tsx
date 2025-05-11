'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiskAssessmentResponse } from '@/types/ai';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

type RiskType = 'diabetes' | 'hypertension' | 'heart_disease' | 'stroke' | 'obesity' | 'general';

export default function RiskAssessment() {
  const [selectedRiskType, setSelectedRiskType] = useState<RiskType>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResponse['riskAssessment'] | null>(null);

  // Risk types with their information
  const riskTypes: { id: RiskType; name: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'general',
      name: 'General Health',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      ),
      description: 'Overall health risk assessment based on your medical profile'
    },
    {
      id: 'diabetes',
      name: 'Diabetes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      ),
      description: 'Assess your risk for developing type 2 diabetes'
    },
    {
      id: 'hypertension',
      name: 'Hypertension',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
        </svg>
      ),
      description: 'Evaluate your risk for high blood pressure'
    },
    {
      id: 'heart_disease',
      name: 'Heart Disease',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
      description: 'Check your cardiovascular disease risk factors'
    },
    {
      id: 'stroke',
      name: 'Stroke',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
      description: 'Assess your risk factors for stroke'
    },
    {
      id: 'obesity',
      name: 'Obesity',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      description: 'Evaluate weight-related health risks'
    }
  ];

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate risk assessment
  const generateRiskAssessment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRiskAssessment(null);

      const response = await fetch('/api/ai/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riskType: selectedRiskType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate risk assessment');
      }

      const data: RiskAssessmentResponse = await response.json();
      
      if (data.riskAssessment) {
        setRiskAssessment(data.riskAssessment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error generating risk assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Risk type selection and generation */}
      <div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-5">
          <h3 className="font-medium text-gray-900 mb-4">Health Risk Assessment</h3>
          
          {/* Risk type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select the type of risk assessment:
            </label>
            <div className="space-y-2">
              {riskTypes.map((riskType) => (
                <div
                  key={riskType.id}
                  onClick={() => setSelectedRiskType(riskType.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedRiskType === riskType.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    selectedRiskType === riskType.id ? 'bg-emerald-100' : 'bg-gray-100'
                  }`}>
                    {riskType.icon}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      selectedRiskType === riskType.id ? 'text-emerald-700' : 'text-gray-900'
                    }`}>
                      {riskType.name}
                    </h4>
                    <p className="text-xs text-gray-500">{riskType.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Generate button */}
          <button
            onClick={generateRiskAssessment}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Assessment...' : 'Generate Risk Assessment'}
          </button>
          
          {/* Error message */}
          {error && <div className="mt-4"><ErrorMessage message={error} onRetry={generateRiskAssessment} /></div>}
        </div>
      </div>
      
      {/* Results */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <LoadingIndicator />
              <p className="text-gray-600 mt-4">Analyzing your health data...</p>
            </div>
          </div>
        ) : riskAssessment ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{riskAssessment.riskType.replace('_', ' ')} Risk Assessment</h3>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                    {riskAssessment.riskLevel.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-gray-900">{riskAssessment.riskScore}/100</span>
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Risk meter */}
              <div>
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      riskAssessment.riskScore < 25 ? 'bg-green-500' :
                      riskAssessment.riskScore < 50 ? 'bg-yellow-500' :
                      riskAssessment.riskScore < 75 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${riskAssessment.riskScore}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                    Risk Score: {riskAssessment.riskScore}/100
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span>Low Risk</span>
                  <span>Moderate Risk</span>
                  <span>High Risk</span>
                  <span>Very High Risk</span>
                </div>
              </div>
              
              {/* Explanation */}
              {riskAssessment.explanation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Explanation</h4>
                  <p className="text-sm text-gray-600">{riskAssessment.explanation}</p>
                </div>
              )}
              
              {/* Contributing factors */}
              {riskAssessment.contributingFactors && riskAssessment.contributingFactors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contributing Factors</h4>
                  <ul className="space-y-1">
                    {riskAssessment.contributingFactors.map((factor, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Recommendations */}
              {riskAssessment.recommendations && riskAssessment.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {riskAssessment.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Key statistics */}
              {riskAssessment.keyStatistics && riskAssessment.keyStatistics.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Statistics</h4>
                  <ul className="space-y-1">
                    {riskAssessment.keyStatistics.map((statistic, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {statistic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                This assessment is based on the information in your medical profile and is intended for informational purposes only. Always consult with a healthcare professional for proper medical advice.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center text-center">
            <div>
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Risk Assessment</h3>
              <p className="text-gray-600 text-sm">Select a risk type on the left and generate an assessment to evaluate your health risks.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 