'use client';

import { useState, useEffect } from 'react';
import { PlusCircleIcon, XCircleIcon, PlusIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function MedicationsForm({ initialData, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    medications: [],
    allergies: [],
  });
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        medications: initialData.medications || [],
        allergies: initialData.allergies || [],
      });
    }
  }, [initialData]);

  const handleAddItem = (section) => {
    let newItem;
    
    if (section === 'medications') {
      newItem = { 
        name: '', 
        dosage: '', 
        frequency: '', 
        startDate: '', 
        endDate: '', 
        prescribedBy: '', 
        purpose: '' 
      };
    } else if (section === 'allergies') {
      newItem = { 
        allergen: '', 
        severity: '', 
        reaction: '', 
        diagnosedDate: '' 
      };
    }
    
    setFormData({
      ...formData,
      [section]: [...formData[section], newItem]
    });
    setFormTouched(true);
  };

  const handleRemoveItem = (section, index) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index)
    });
    setFormTouched(true);
  };

  const handleChange = (section, index, field, value) => {
    const updatedItems = [...formData[section]];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      [section]: updatedItems
    });
    setFormTouched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialData,
      medications: formData.medications,
      allergies: formData.allergies,
    });
  };

  // Count how many medications are active (no end date or end date is in the future)
  const getActiveMedicationsCount = () => {
    if (!formData.medications.length) return 0;
    
    const today = new Date();
    return formData.medications.filter(med => 
      !med.endDate || new Date(med.endDate) > today
    ).length;
  };
  
  const activeMedicationsCount = getActiveMedicationsCount();

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Header Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-emerald-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Medications Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-emerald-100">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{activeMedicationsCount}</div>
                  <div className="text-xs text-gray-500">Active Medications</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem('medications')}
                className="bg-emerald-500 text-white rounded-full p-1.5 hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Allergies Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-red-100">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{formData.allergies.length}</div>
                  <div className="text-xs text-gray-500">Recorded Allergies</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem('allergies')}
                className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Medications Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              List all medications you are taking, including prescriptions, over-the-counter medications, supplements, and herbs.
            </p>
            
            <button
              type="button"
              onClick={() => handleAddItem('medications')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Medication
            </button>
          </div>
        
          <div className="p-6">
            {formData.medications.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medications recorded. Add your medications using the button above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.medications.map((medication, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm relative"
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5"></div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('medications', index)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove medication"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medication Name
                          </label>
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => handleChange('medications', index, 'name', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g., Aspirin, Metformin"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => handleChange('medications', index, 'dosage', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g., 81mg, 500mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={medication.frequency}
                            onChange={(e) => handleChange('medications', index, 'frequency', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="e.g., Once daily, Twice daily"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleChange('medications', index, 'startDate', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date (if applicable)
                          </label>
                          <input
                            type="date"
                            value={medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleChange('medications', index, 'endDate', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prescribed By
                          </label>
                          <input
                            type="text"
                            value={medication.prescribedBy}
                            onChange={(e) => handleChange('medications', index, 'prescribedBy', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="Healthcare provider's name"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purpose
                          </label>
                          <textarea
                            value={medication.purpose}
                            onChange={(e) => handleChange('medications', index, 'purpose', e.target.value)}
                            rows={2}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="Reason for taking this medication"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Allergies Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              List all known allergies, including medications, foods, environmental factors, and other substances.
            </p>
            
            <button
              type="button"
              onClick={() => handleAddItem('allergies')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Allergy
            </button>
          </div>
          
          <div className="p-6">
            {formData.allergies.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                <ExclamationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No allergies recorded. Add any allergies using the button above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.allergies.map((allergy, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 rounded-lg border border-red-200 overflow-hidden shadow-sm relative"
                  >
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5"></div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('allergies', index)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove allergy"
                    >
                      <XCircleIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allergen
                          </label>
                          <input
                            type="text"
                            value={allergy.allergen}
                            onChange={(e) => handleChange('allergies', index, 'allergen', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="e.g., Penicillin, Peanuts, Pollen"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Severity
                          </label>
                          <select
                            value={allergy.severity}
                            onChange={(e) => handleChange('allergies', index, 'severity', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                          >
                            <option value="">Select severity</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                            <option value="life-threatening">Life-threatening</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reaction
                          </label>
                          <textarea
                            value={allergy.reaction}
                            onChange={(e) => handleChange('allergies', index, 'reaction', e.target.value)}
                            rows={2}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="Describe the allergic reaction"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diagnosed Date
                          </label>
                          <input
                            type="date"
                            value={allergy.diagnosedDate ? new Date(allergy.diagnosedDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleChange('allergies', index, 'diagnosedDate', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
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
            'Save Information'
          )}
        </button>
      </div>
    </form>
  );
} 