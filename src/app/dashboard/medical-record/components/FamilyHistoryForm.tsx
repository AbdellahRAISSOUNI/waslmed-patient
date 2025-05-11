'use client';

import { useState, useEffect } from 'react';
import { PlusCircleIcon, XCircleIcon, InformationCircleIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyHistoryItem {
  condition: string;
  relationship: string;
  notes: string;
}

interface FamilyHistoryFormProps {
  initialData: any;
  onSave: (data: any) => void;
  isSaving: boolean;
}

export default function FamilyHistoryForm({ initialData, onSave, isSaving }: FamilyHistoryFormProps) {
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryItem[]>([]);
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFamilyHistory(initialData.familyHistory || []);
    }
  }, [initialData]);

  const handleAddHistory = () => {
    setFamilyHistory([
      ...familyHistory,
      { condition: '', relationship: '', notes: '' }
    ]);
    setFormTouched(true);
  };

  const handleRemoveHistory = (index: number) => {
    setFamilyHistory(familyHistory.filter((_, i) => i !== index));
    setFormTouched(true);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedHistory = [...familyHistory];
    updatedHistory[index] = {
      ...updatedHistory[index],
      [field]: value
    };
    setFamilyHistory(updatedHistory);
    setFormTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      familyHistory
    });
  };

  // Group relationships by category for better organization
  const familyRelationships = {
    immediate: [
      { value: 'mother', label: 'Mother', icon: '👩' },
      { value: 'father', label: 'Father', icon: '👨' },
      { value: 'sister', label: 'Sister', icon: '👧' },
      { value: 'brother', label: 'Brother', icon: '👦' },
      { value: 'daughter', label: 'Daughter', icon: '👧' },
      { value: 'son', label: 'Son', icon: '👦' },
    ],
    grandparents: [
      { value: 'maternal-grandmother', label: 'Maternal Grandmother', icon: '👵' },
      { value: 'maternal-grandfather', label: 'Maternal Grandfather', icon: '👴' },
      { value: 'paternal-grandmother', label: 'Paternal Grandmother', icon: '👵' },
      { value: 'paternal-grandfather', label: 'Paternal Grandfather', icon: '👴' },
    ],
    extended: [
      { value: 'aunt', label: 'Aunt', icon: '👩' },
      { value: 'uncle', label: 'Uncle', icon: '👨' },
      { value: 'cousin', label: 'Cousin', icon: '🧑' },
      { value: 'niece', label: 'Niece', icon: '👧' },
      { value: 'nephew', label: 'Nephew', icon: '👦' },
      { value: 'other', label: 'Other', icon: '👤' },
    ],
  };

  // Common hereditary conditions for suggestions
  const commonConditions = [
    'Heart Disease',
    'Diabetes',
    'Cancer',
    'Hypertension',
    'Stroke',
    'Alzheimer\'s Disease',
    'Asthma',
    'Arthritis',
    'Depression',
    'Anxiety Disorders',
    'Bipolar Disorder',
    'Multiple Sclerosis',
    'Parkinson\'s Disease',
    'Osteoporosis',
    'Thyroid Disorders',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-emerald-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-800">Family Medical History</h2>
            </div>
            <p className="text-sm text-gray-600">
              Many conditions can run in families. Understanding your family's health history helps identify potential risks and personalize your care.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleAddHistory}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Family History
          </button>
        </div>
        
        {/* Family tree visualization (simplified) */}
        {familyHistory.length > 0 && (
          <div className="mt-6 border-t border-emerald-200 pt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {familyHistory.map((history, index) => (
                history.relationship && (
                  <motion.div
                    key={`tree-${index}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`
                      px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1
                      ${getRelationshipColor(history.relationship)}
                    `}
                  >
                    <span>{getRelationshipIcon(history.relationship)}</span>
                    <span>{history.relationship.charAt(0).toUpperCase() + history.relationship.slice(1)}</span>
                    {history.condition && <span>- {history.condition}</span>}
                  </motion.div>
                )
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {familyHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
          >
            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No family history recorded yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Add family medical history to help identify potential hereditary health risks.
            </p>
            <button
              type="button"
              onClick={handleAddHistory}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              Add First Entry
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {familyHistory.map((history, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative"
              >
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveHistory(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Condition
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={history.condition}
                        onChange={(e) => handleChange(index, 'condition', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                        placeholder="e.g., Heart Disease, Diabetes"
                        list={`conditions-list-${index}`}
                      />
                      <datalist id={`conditions-list-${index}`}>
                        {commonConditions.map((condition, i) => (
                          <option key={i} value={condition} />
                        ))}
                      </datalist>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Relationship
                    </label>
                    
                    <div className="relative">
                      <select
                        value={history.relationship}
                        onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value="">Select relationship</option>
                        
                        <optgroup label="Immediate Family">
                          {familyRelationships.immediate.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                              {rel.icon} {rel.label}
                            </option>
                          ))}
                        </optgroup>
                        
                        <optgroup label="Grandparents">
                          {familyRelationships.grandparents.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                              {rel.icon} {rel.label}
                            </option>
                          ))}
                        </optgroup>
                        
                        <optgroup label="Extended Family">
                          {familyRelationships.extended.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                              {rel.icon} {rel.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Visual relationship selector (simplified version) */}
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-1">
                      {Object.keys(familyRelationships).flatMap(category => 
                        familyRelationships[category].slice(0, 6).map((rel) => (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            key={rel.value}
                            onClick={() => handleChange(index, 'relationship', rel.value)}
                            className={`p-1 rounded text-center text-xs ${
                              history.relationship === rel.value 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="text-base">{rel.icon}</div>
                          </motion.button>
                        ))
                      ).slice(0, 12)}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={history.notes}
                      onChange={(e) => handleChange(index, 'notes', e.target.value)}
                      rows={2}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Age of onset, treatment details, severity, etc."
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-md bg-blue-50 p-4 border border-blue-100"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Why this matters</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Medical conditions with a strong genetic component include heart disease, diabetes, various cancers, 
                hypertension, stroke, mental health conditions, and autoimmune disorders.
              </p>
              <p className="mt-1">
                Knowing your family history helps healthcare providers recommend appropriate screenings and preventive measures.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Submit button */}
      <div className="flex justify-end pt-5">
        <button
          type="submit"
          disabled={isSaving || !formTouched}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
            !formTouched
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Family History'
          )}
        </button>
      </div>
    </form>
  );
}

// Helper function to get relationship icon
function getRelationshipIcon(relationship: string): string {
  const icons: Record<string, string> = {
    'mother': '👩', 'father': '👨', 'sister': '👧', 'brother': '👦',
    'maternal-grandmother': '👵', 'maternal-grandfather': '👴',
    'paternal-grandmother': '👵', 'paternal-grandfather': '👴',
    'aunt': '👩', 'uncle': '👨', 'cousin': '🧑',
    'daughter': '👧', 'son': '👦', 'niece': '👧', 'nephew': '👦',
    'other': '👤'
  };
  
  return icons[relationship] || '👤';
}

// Helper function to get relationship color
function getRelationshipColor(relationship: string): string {
  // Immediate family
  if (['mother', 'father', 'sister', 'brother', 'daughter', 'son'].includes(relationship)) {
    return 'bg-emerald-100 text-emerald-800';
  }
  
  // Grandparents
  if (['maternal-grandmother', 'maternal-grandfather', 'paternal-grandmother', 'paternal-grandfather'].includes(relationship)) {
    return 'bg-blue-100 text-blue-800';
  }
  
  // Extended family
  return 'bg-purple-100 text-purple-800';
} 