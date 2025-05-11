'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PlusCircleIcon, XCircleIcon, PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Define TypeScript interfaces
interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  purpose: string;
  instructions?: string;
  refillsRemaining?: string;
  sideEffects?: string;
  status?: string;
}

export default function MedicationsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savingIndex, setSavingIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state for new medication
  const [showNewForm, setShowNewForm] = useState(false);
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    refillsRemaining: '',
    sideEffects: '',
    status: 'Active'
  });

  // Form state for editing
  const [editForm, setEditForm] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    refillsRemaining: '',
    sideEffects: '',
    status: 'Active'
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMedications();
    }
  }, [status]);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/medical-record');
      
      if (!response.ok) {
        throw new Error('Failed to fetch medical record');
      }
      
      const data = await response.json();
      
      // Ensure all medication fields are properly typed
      const formattedMedications = (data.medications || []).map((med: any) => ({
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        startDate: med.startDate || '',
        endDate: med.endDate || '',
        prescribedBy: med.prescribedBy || '',
        purpose: med.purpose || '',
        instructions: med.instructions || '',
        refillsRemaining: med.refillsRemaining || '',
        sideEffects: med.sideEffects || '',
        status: med.status || 'Active'
      }));
      
      setMedications(formattedMedications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setErrorMessage('Failed to load your medications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMedicationChange = (field: keyof Medication, value: string) => {
    setNewMedication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormChange = (field: keyof Medication, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startEditing = (index: number) => {
    const medication = medications[index];
    setEditForm({
      name: medication.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      startDate: medication.startDate || '',
      endDate: medication.endDate || '',
      prescribedBy: medication.prescribedBy || '',
      purpose: medication.purpose || '',
      instructions: medication.instructions || '',
      refillsRemaining: medication.refillsRemaining || '',
      sideEffects: medication.sideEffects || '',
      status: medication.status || 'Active'
    });
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
  };

  const resetNewForm = () => {
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      purpose: '',
      instructions: '',
      refillsRemaining: '',
      sideEffects: '',
      status: 'Active'
    });
    setShowNewForm(false);
  };

  const addMedication = async () => {
    if (!newMedication.name) {
      setErrorMessage('Medication name is required.');
      return;
    }

    try {
      setSavingIndex(-2); // Special index for new medication
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Add new medication to array
      const updatedMedications = [...(medicalRecord.medications || []), newMedication];
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          medications: updatedMedications
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh medications
      await fetchMedications();
      
      // Reset form and show success message
      resetNewForm();
      setSuccessMessage('Medication added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding medication:', error);
      setErrorMessage('Failed to add medication. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  const updateMedication = async (index: number) => {
    try {
      setSavingIndex(index);
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Update medication at index
      const updatedMedications = [...(medicalRecord.medications || [])];
      updatedMedications[index] = editForm;
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          medications: updatedMedications
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh medications
      await fetchMedications();
      
      // Reset editing state and show success message
      setEditingIndex(-1);
      setSuccessMessage('Medication updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating medication:', error);
      setErrorMessage('Failed to update medication. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  const removeMedication = async (index: number) => {
    try {
      setSavingIndex(index);
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Remove medication at index
      const updatedMedications = [...(medicalRecord.medications || [])];
      updatedMedications.splice(index, 1);
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          medications: updatedMedications
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh medications
      await fetchMedications();
      
      // Show success message
      setSuccessMessage('Medication removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing medication:', error);
      setErrorMessage('Failed to remove medication. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  // UI Components
  interface MedicationFormProps {
    medication: Medication;
    onChange: (field: keyof Medication, value: string) => void;
    isNew?: boolean;
  }
  
  const MedicationForm = ({ medication, onChange, isNew = false }: MedicationFormProps) => {
    // Use a local form state instead of directly modifying parent state
    const [localForm, setLocalForm] = useState<Medication>(medication);
    
    // Update local form state on input change
    const handleInputChange = (field: keyof Medication, value: string) => {
      setLocalForm(prev => ({
        ...prev,
        [field]: value
      }));
      // Update parent state
      onChange(field, value);
    };
    
    // Update local form when medication prop changes
    useEffect(() => {
      setLocalForm(medication);
    }, [medication]);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medication Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., Aspirin, Metformin"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dosage
          </label>
          <input
            type="text"
            value={localForm.dosage}
            onChange={(e) => handleInputChange('dosage', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., 81mg, 500mg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <input
            type="text"
            value={localForm.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., Once daily, Twice daily"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={localForm.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date (if applicable)
          </label>
          <input
            type="date"
            value={localForm.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prescribed By
          </label>
          <input
            type="text"
            value={localForm.prescribedBy}
            onChange={(e) => handleInputChange('prescribedBy', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Healthcare provider's name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instructions
          </label>
          <input
            type="text"
            value={localForm.instructions || ''}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., Take with meals"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Refills Remaining
          </label>
          <input
            type="text"
            value={localForm.refillsRemaining || ''}
            onChange={(e) => handleInputChange('refillsRemaining', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., 3 refills remaining"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={localForm.status || 'Active'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <textarea
            value={localForm.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Reason for taking this medication"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Side Effects
          </label>
          <textarea
            value={localForm.sideEffects || ''}
            onChange={(e) => handleInputChange('sideEffects', e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Any side effects you've experienced"
          />
        </div>
      </div>
    );
  };
  
  const renderMedicationCard = (medication: Medication, index: number) => {
    const isEditing = editingIndex === index;
    const isSaving = savingIndex === index;
    
    // Set default values for new fields if they don't exist
    const status = medication.status || 'Active';
    const instructions = medication.instructions || 'Take with meals';
    const refillsRemaining = medication.refillsRemaining || '2 refills remaining';
    const sideEffects = medication.sideEffects || 'None reported';
    
    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {isEditing ? (
          <div className="p-5">
            <MedicationForm medication={editForm} onChange={handleEditFormChange} />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateMedication(index)}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                        {medication.dosage && (
                          <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">{medication.dosage}</span>
                        )}
                      </div>
                      <p className="text-gray-500">{medication.purpose}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => startEditing(index)}
                    disabled={isSaving}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    disabled={isSaving}
                    className="text-red-500 hover:text-red-700"
                  >
                    {isSaving ? (
                      <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <XCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-gray-400 mt-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">{medication.frequency}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-gray-400 mt-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Dr. {medication.prescribedBy}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-gray-400 mt-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Started: {new Date(medication.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-gray-400 mt-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">{refillsRemaining}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-start text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <div>
                    <div className="font-medium">Instructions:</div>
                    <div className="text-gray-600">{instructions}</div>
                  </div>
                </div>
              </div>
              
              {sideEffects && (
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-500">Side Effects:</span>
                  <p className="mt-1 text-sm text-gray-600">{sideEffects}</p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                  </svg>
                  Request Refill
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <DashboardLayout title="Current Medications">
      <div className="space-y-6">
        {/* Alert messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border-l-4 border-green-400 p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-emerald-600">
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Current Medications</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your current medications, prescriptions, and supplements.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Medication
          </button>
        </div>

        {/* New medication form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Medication</h3>
                <MedicationForm medication={newMedication} onChange={handleNewMedicationChange} isNew={true} />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetNewForm}
                    disabled={savingIndex === -2}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addMedication}
                    disabled={savingIndex === -2}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    {savingIndex === -2 ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Add Medication'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medications list */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white/50 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No medications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't added any medications to your medical record yet.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Your First Medication
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {medications.map((medication, index) => renderMedicationCard(medication, index))}
            </AnimatePresence>
          </div>
        )}

        {/* Link to full medical record */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need to update other medical information?
          </p>
          <Link 
            href="/dashboard/medical-record" 
            className="mt-2 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Go to your complete medical record
            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 