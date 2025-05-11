'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EarlyWarningResponse, EarlyWarningPattern } from '@/types/ai';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

export default function EarlyWarning() {
  // Form state
  const [recentSymptoms, setRecentSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
    weight: ''
  });
  const [sleepChanges, setSleepChanges] = useState('');
  const [appetiteChanges, setAppetiteChanges] = useState('');
  const [moodChanges, setMoodChanges] = useState('');
  const [medicationAdherence, setMedicationAdherence] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EarlyWarningResponse['earlyWarningAnalysis'] | null>(null);

  // Add a symptom to the list
  const addSymptom = () => {
    if (!symptomInput.trim()) return;
    
    // Add symptom if not already in the list
    if (!recentSymptoms.includes(symptomInput.trim())) {
      setRecentSymptoms([...recentSymptoms, symptomInput.trim()]);
    }
    
    setSymptomInput('');
  };

  // Remove a symptom from the list
  const removeSymptom = (symptomToRemove: string) => {
    setRecentSymptoms(recentSymptoms.filter(s => s !== symptomToRemove));
  };

  // Handle vitals input change
  const handleVitalChange = (field: keyof typeof vitals, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      
      // At least one field should have data
      if (
        recentSymptoms.length === 0 &&
        Object.values(vitals).every(v => !v) &&
        !sleepChanges &&
        !appetiteChanges &&
        !moodChanges &&
        !medicationAdherence &&
        !additionalNotes
      ) {
        setError('Please provide at least some information about your current health status');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/ai/early-warning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recentSymptoms,
          vitals,
          sleepChanges,
          appetiteChanges,
          moodChanges,
          medicationAdherence,
          additionalNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze health monitoring data');
      }
      
      const data: EarlyWarningResponse = await response.json();
      setAnalysis(data.earlyWarningAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error analyzing health data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setRecentSymptoms([]);
    setSymptomInput('');
    setVitals({
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenLevel: '',
      weight: ''
    });
    setSleepChanges('');
    setAppetiteChanges('');
    setMoodChanges('');
    setMedicationAdherence('');
    setAdditionalNotes('');
    setAnalysis(null);
    setError(null);
  };

  // Get severity level color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input form */}
      <div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm p-5">
          <h3 className="font-medium text-gray-900 mb-4">Health Monitoring</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recent symptoms */}
            <div>
              <label htmlFor="symptom" className="block text-sm font-medium text-gray-700 mb-1">
                Recent Symptoms (if any)
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
              {recentSymptoms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentSymptoms.map((symptom, index) => (
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
            
            {/* Vital signs */}
            <div>
              <h4 className="block text-sm font-medium text-gray-700 mb-2">Vital Signs (if available)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bloodPressure" className="block text-xs text-gray-500 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    id="bloodPressure"
                    value={vitals.bloodPressure}
                    onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                    placeholder="e.g., 120/80"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="heartRate" className="block text-xs text-gray-500 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="text"
                    id="heartRate"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                    placeholder="e.g., 72"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="temperature" className="block text-xs text-gray-500 mb-1">Temperature (°C)</label>
                  <input
                    type="text"
                    id="temperature"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    placeholder="e.g., 37.0"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="oxygenLevel" className="block text-xs text-gray-500 mb-1">Oxygen Level (%)</label>
                  <input
                    type="text"
                    id="oxygenLevel"
                    value={vitals.oxygenLevel}
                    onChange={(e) => handleVitalChange('oxygenLevel', e.target.value)}
                    placeholder="e.g., 98"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    id="weight"
                    value={vitals.weight}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    placeholder="e.g., 70"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Behavioral changes */}
            <div>
              <h4 className="block text-sm font-medium text-gray-700 mb-2">Behavioral Changes</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="sleepChanges" className="block text-xs text-gray-500 mb-1">Sleep Changes</label>
                  <select
                    id="sleepChanges"
                    value={sleepChanges}
                    onChange={(e) => setSleepChanges(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select an option</option>
                    <option value="No change">No change</option>
                    <option value="Sleeping more than usual">Sleeping more than usual</option>
                    <option value="Sleeping less than usual">Sleeping less than usual</option>
                    <option value="Difficulty falling asleep">Difficulty falling asleep</option>
                    <option value="Waking up frequently">Waking up frequently</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="appetiteChanges" className="block text-xs text-gray-500 mb-1">Appetite Changes</label>
                  <select
                    id="appetiteChanges"
                    value={appetiteChanges}
                    onChange={(e) => setAppetiteChanges(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select an option</option>
                    <option value="No change">No change</option>
                    <option value="Increased appetite">Increased appetite</option>
                    <option value="Decreased appetite">Decreased appetite</option>
                    <option value="Nausea or aversion to food">Nausea or aversion to food</option>
                    <option value="Changes in food preferences">Changes in food preferences</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="moodChanges" className="block text-xs text-gray-500 mb-1">Mood Changes</label>
                  <select
                    id="moodChanges"
                    value={moodChanges}
                    onChange={(e) => setMoodChanges(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select an option</option>
                    <option value="No change">No change</option>
                    <option value="More anxious than usual">More anxious than usual</option>
                    <option value="More irritable than usual">More irritable than usual</option>
                    <option value="Feeling sad or down">Feeling sad or down</option>
                    <option value="Mood swings">Mood swings</option>
                    <option value="Feeling more positive">Feeling more positive</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="medicationAdherence" className="block text-xs text-gray-500 mb-1">Medication Adherence</label>
                  <select
                    id="medicationAdherence"
                    value={medicationAdherence}
                    onChange={(e) => setMedicationAdherence(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select an option</option>
                    <option value="Taking all medications as prescribed">Taking all medications as prescribed</option>
                    <option value="Occasionally missing doses">Occasionally missing doses</option>
                    <option value="Frequently missing doses">Frequently missing doses</option>
                    <option value="Stopped taking some medications">Stopped taking some medications</option>
                    <option value="No medications prescribed">No medications prescribed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Additional notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any other health changes or concerns..."
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
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-300"
              >
                {isLoading ? 'Analyzing...' : 'Check for Early Warning Signs'}
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
      
      {/* Results */}
      <div>
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <LoadingIndicator />
              <p className="text-gray-600 mt-4">Analyzing your health monitoring data...</p>
            </div>
          </div>
        ) : analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Early Warning Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">Based on your health monitoring data</p>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Concerning patterns */}
              {analysis.concerningPatterns && analysis.concerningPatterns.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Potentially Concerning Patterns</h4>
                  <div className="space-y-3">
                    {analysis.concerningPatterns.map((pattern: EarlyWarningPattern, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-lg border p-3 ${getSeverityColor(pattern.severity)}`}
                      >
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <h5 className="font-medium">
                              {pattern.severity === 'high' && (
                                <span className="inline-block mr-1">⚠️</span>
                              )}
                              {pattern.issue}
                            </h5>
                          </div>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            pattern.severity === 'low' ? 'bg-blue-200 text-blue-900' :
                            pattern.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-red-200 text-red-900'
                          }`}>
                            {pattern.severity} severity
                          </span>
                        </div>
                        
                        {pattern.relatedTo && (
                          <p className="text-xs mb-2">
                            <span className="font-medium">Related to:</span> {pattern.relatedTo}
                          </p>
                        )}
                        
                        <div className="text-sm mt-2 border-t pt-2 border-opacity-50">
                          <span className="font-medium">Suggested action: </span> 
                          {pattern.suggestedAction}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">No concerning patterns detected</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Based on the information provided, no health concerns were identified at this time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Normal findings */}
              {analysis.normalFindings && analysis.normalFindings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Normal Findings</h4>
                  <ul className="space-y-1">
                    {analysis.normalFindings.map((finding, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Monitoring recommendations */}
              {analysis.monitoringRecommendations && analysis.monitoringRecommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Monitoring Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.monitoringRecommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Analysis explanation */}
              {analysis.analysisExplanation && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Analysis</h4>
                  <p className="text-sm text-gray-600">{analysis.analysisExplanation}</p>
                </div>
              )}
              
              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
                This analysis is based on the information you provided and is intended for informational purposes only. It is not a medical diagnosis. Always consult with a healthcare professional for proper medical advice.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center text-center">
            <div>
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Early Warning System</h3>
              <p className="text-gray-600 text-sm">
                Monitor changes in your health for early detection of potential issues. Enter your current health data to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 