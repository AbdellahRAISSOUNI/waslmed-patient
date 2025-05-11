'use client';

import { useState, useEffect } from 'react';
import { PlusCircleIcon, XCircleIcon, HeartIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicalCondition {
  name: string;
  diagnosedDate: string;
  status: string;
  treatedBy: string;
  notes: string;
}

interface Surgery {
  procedure: string;
  date: string;
  hospital: string;
  surgeon: string;
  outcome: string;
  notes: string;
}

interface Immunization {
  vaccine: string;
  date: string;
  administeredBy: string;
  batchNumber: string;
}

interface MedicalHistoryFormProps {
  initialData: any;
  onSave: (data: any) => void;
  isSaving: boolean;
}

export default function MedicalHistoryForm({ initialData, onSave, isSaving }: MedicalHistoryFormProps) {
  const [formData, setFormData] = useState({
    conditions: [] as MedicalCondition[],
    surgeries: [] as Surgery[],
    immunizations: [] as Immunization[],
  });
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const data = {
        conditions: initialData.conditions || [],
        surgeries: initialData.surgeries || [],
        immunizations: initialData.immunizations || [],
      };
      setFormData(data);
    }
  }, [initialData]);

  const handleAddItem = (section: 'conditions' | 'surgeries' | 'immunizations') => {
    let newItem: any;

    switch (section) {
      case 'conditions':
        newItem = { name: '', diagnosedDate: '', status: '', treatedBy: '', notes: '' };
        break;
      case 'surgeries':
        newItem = { procedure: '', date: '', hospital: '', surgeon: '', outcome: '', notes: '' };
        break;
      case 'immunizations':
        newItem = { vaccine: '', date: '', administeredBy: '', batchNumber: '' };
        break;
      default:
        return;
    }

    setFormData({
      ...formData,
      [section]: [...formData[section], newItem]
    });
    setFormTouched(true);
  };

  const handleRemoveItem = (section: 'conditions' | 'surgeries' | 'immunizations', index: number) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index)
    });
    setFormTouched(true);
  };

  const handleChange = (section: 'conditions' | 'surgeries' | 'immunizations', index: number, field: string, value: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      conditions: formData.conditions,
      surgeries: formData.surgeries,
      immunizations: formData.immunizations,
    });
  };
  
  // Common conditions for suggestions
  const commonConditions = [
    'Hypertension',
    'Diabetes Type 1',
    'Diabetes Type 2',
    'Asthma',
    'Arthritis',
    'Heart Disease',
    'Coronary Artery Disease',
    'Chronic Obstructive Pulmonary Disease (COPD)',
    'Depression',
    'Anxiety Disorder',
    'Hypothyroidism',
    'Hyperthyroidism',
    'Osteoporosis',
    'Chronic Kidney Disease',
    'Migraine',
    'Epilepsy',
    'Multiple Sclerosis',
    'Cancer',
    'Stroke',
    'Alzheimer\'s Disease',
  ];
  
  // Common vaccines for suggestions
  const commonVaccines = [
    'COVID-19',
    'Influenza (Flu)',
    'Tetanus, Diphtheria, Pertussis (Tdap)',
    'Measles, Mumps, Rubella (MMR)',
    'Hepatitis A',
    'Hepatitis B',
    'Human Papillomavirus (HPV)',
    'Pneumococcal',
    'Varicella (Chickenpox)',
    'Zoster (Shingles)',
    'Polio',
    'Meningococcal',
    'Haemophilus influenzae type b (Hib)',
    'Rotavirus',
  ];
  
  // Common surgeries for suggestions
  const commonSurgeries = [
    'Appendectomy',
    'Cholecystectomy (Gallbladder Removal)',
    'Hernia Repair',
    'Hysterectomy',
    'Cesarean Section',
    'Cataract Surgery',
    'Tonsillectomy',
    'Knee Arthroscopy',
    'Hip Replacement',
    'Knee Replacement',
    'Spinal Fusion',
    'Coronary Artery Bypass Grafting (CABG)',
    'Mastectomy',
    'Thyroidectomy',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Medical History Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-emerald-100"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">Medical History</h2>
          </div>
          
          <p className="text-sm text-gray-600">
            Your medical history provides healthcare providers with essential information for personalized care and treatment.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-gray-500">Medical Conditions</div>
                <div className="text-lg font-bold text-emerald-600">{formData.conditions.length}</div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formData.conditions.length > 0 
                  ? `${formData.conditions.filter(c => c.status === 'active').length} active conditions`
                  : 'No conditions recorded'}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-gray-500">Surgeries</div>
                <div className="text-lg font-bold text-emerald-600">{formData.surgeries.length}</div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formData.surgeries.length > 0 
                  ? `Last: ${formData.surgeries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.procedure || 'Unknown'}`
                  : 'No surgeries recorded'}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-gray-500">Immunizations</div>
                <div className="text-lg font-bold text-emerald-600">{formData.immunizations.length}</div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formData.immunizations.length > 0 
                  ? `Latest: ${formData.immunizations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.vaccine || 'Unknown'}`
                  : 'No immunizations recorded'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Medical Conditions Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-100">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Medical Conditions</h3>
          </div>
          
          <button
            type="button"
            onClick={() => handleAddItem('conditions')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Condition
          </button>
        </div>

        <AnimatePresence>
        {formData.conditions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medical conditions recorded yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Add your medical conditions to maintain an accurate health record.
              </p>
              <button
                type="button"
                onClick={() => handleAddItem('conditions')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add First Condition
              </button>
            </motion.div>
        ) : (
          <div className="space-y-4">
            {formData.conditions.map((condition, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative"
                >
                  <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => handleRemoveItem('conditions', index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove condition"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
                  </div>
                  
                  {/* Status Indicator */}
                  {condition.status && (
                    <div className={`absolute top-5 left-0 w-1.5 h-16 rounded-r-full ${
                      condition.status === 'active' ? 'bg-red-500' : 
                      condition.status === 'managed' ? 'bg-yellow-500' : 
                      condition.status === 'resolved' ? 'bg-green-500' : 
                      condition.status === 'in-remission' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition Name
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={condition.name}
                      onChange={(e) => handleChange('conditions', index, 'name', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      placeholder="e.g., Hypertension, Diabetes"
                          list={`conditions-list-${index}`}
                        />
                        <datalist id={`conditions-list-${index}`}>
                          {commonConditions.map((condition, i) => (
                            <option key={i} value={condition} />
                          ))}
                        </datalist>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosed Date
                    </label>
                      <div className="relative">
                    <input
                      type="date"
                      value={condition.diagnosedDate ? new Date(condition.diagnosedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('conditions', index, 'diagnosedDate', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['active', 'managed', 'resolved', 'in-remission'].map((status) => (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            key={status}
                            onClick={() => handleChange('conditions', index, 'status', status)}
                            className={`py-1.5 px-2 rounded text-xs font-medium ${
                              condition.status === status 
                                ? status === 'active' ? 'bg-red-100 text-red-800 border border-red-300' :
                                  status === 'managed' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                  status === 'resolved' ? 'bg-green-100 text-green-800 border border-green-300' :
                                  'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            } transition-colors`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </motion.button>
                        ))}
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treated By
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={condition.treatedBy}
                      onChange={(e) => handleChange('conditions', index, 'treatedBy', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      placeholder="Physician's name"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={condition.notes}
                      onChange={(e) => handleChange('conditions', index, 'notes', e.target.value)}
                      rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Additional information about the condition"
                    />
                  </div>
                </div>
                </motion.div>
            ))}
          </div>
        )}
        </AnimatePresence>
      </motion.section>

      {/* Surgeries Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Surgical History</h3>
          </div>
          
          <button
            type="button"
            onClick={() => handleAddItem('surgeries')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Surgery
          </button>
        </div>

        <AnimatePresence>
        {formData.surgeries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <p className="text-gray-500">No surgical procedures recorded yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Add your surgical history to maintain a complete medical record.
              </p>
              <button
                type="button"
                onClick={() => handleAddItem('surgeries')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add First Surgery
              </button>
            </motion.div>
        ) : (
          <div className="space-y-4">
            {formData.surgeries.map((surgery, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative"
                >
                  <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => handleRemoveItem('surgeries', index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove surgery"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
                  </div>
                  
                  {/* Date indicator on the left */}
                  {surgery.date && (
                    <div className="absolute top-5 left-0 w-1.5 h-16 rounded-r-full bg-blue-500"></div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedure
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={surgery.procedure}
                      onChange={(e) => handleChange('surgeries', index, 'procedure', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      placeholder="e.g., Appendectomy, Knee Replacement"
                          list={`surgeries-list-${index}`}
                        />
                        <datalist id={`surgeries-list-${index}`}>
                          {commonSurgeries.map((surgery, i) => (
                            <option key={i} value={surgery} />
                          ))}
                        </datalist>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                          </svg>
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                      <div className="relative">
                    <input
                      type="date"
                      value={surgery.date ? new Date(surgery.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('surgeries', index, 'date', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital/Facility
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={surgery.hospital}
                      onChange={(e) => handleChange('surgeries', index, 'hospital', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      placeholder="Hospital or facility name"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surgeon
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={surgery.surgeon}
                      onChange={(e) => handleChange('surgeries', index, 'surgeon', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                      placeholder="Surgeon's name"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outcome
                    </label>
                    <select
                      value={surgery.outcome}
                      onChange={(e) => handleChange('surgeries', index, 'outcome', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="">Select outcome</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                        <option value="complications">Complications</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={surgery.notes}
                      onChange={(e) => handleChange('surgeries', index, 'notes', e.target.value)}
                      rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Additional information about the procedure"
                    />
                  </div>
                </div>
                </motion.div>
            ))}
          </div>
        )}
        </AnimatePresence>
      </motion.section>

      {/* Immunizations Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-green-100">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Immunizations</h3>
          </div>
          
          <button
            type="button"
            onClick={() => handleAddItem('immunizations')}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Immunization
          </button>
        </div>

        <AnimatePresence>
        {formData.immunizations.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <ShieldCheckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No immunizations recorded yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Keeping your vaccination records updated is important for preventive care.
              </p>
              <button
                type="button"
                onClick={() => handleAddItem('immunizations')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add First Immunization
              </button>
            </motion.div>
        ) : (
          <div className="space-y-4">
            {formData.immunizations.map((immunization, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative"
                >
                  <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => handleRemoveItem('immunizations', index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove immunization"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
                  </div>
                  
                  {/* Left indicator */}
                  <div className="absolute top-5 left-0 w-1.5 h-16 rounded-r-full bg-green-500"></div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaccine
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={immunization.vaccine}
                      onChange={(e) => handleChange('immunizations', index, 'vaccine', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                          placeholder="e.g., COVID-19, Influenza"
                          list={`vaccines-list-${index}`}
                        />
                        <datalist id={`vaccines-list-${index}`}>
                          {commonVaccines.map((vaccine, i) => (
                            <option key={i} value={vaccine} />
                          ))}
                        </datalist>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Administered
                    </label>
                      <div className="relative">
                    <input
                      type="date"
                      value={immunization.date ? new Date(immunization.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleChange('immunizations', index, 'date', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                      Administered By
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={immunization.administeredBy}
                      onChange={(e) => handleChange('immunizations', index, 'administeredBy', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 pr-10"
                          placeholder="Healthcare provider's name"
                    />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch/Lot Number
                    </label>
                    <input
                      type="text"
                      value={immunization.batchNumber}
                      onChange={(e) => handleChange('immunizations', index, 'batchNumber', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Vaccine batch or lot number"
                    />
                  </div>
                </div>
                </motion.div>
            ))}
          </div>
        )}
        </AnimatePresence>
      </motion.section>

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
            'Save Medical History'
          )}
        </button>
      </div>
    </form>
  );
} 