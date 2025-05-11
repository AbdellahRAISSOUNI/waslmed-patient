'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PlusCircleIcon, XCircleIcon, PencilSquareIcon, CheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

// Define TypeScript interfaces
interface LabTest {
  testName: string;
  date: string;
  result: string;
  normalRange: string;
  orderedBy: string;
  laboratory: string;
  notes: string;
  status?: string; // normal, abnormal, critical
  category?: string; // blood, urine, imaging, etc.
  unit?: string; // mg/dL, mmol/L, etc.
}

export default function LabResultsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [savingIndex, setSavingIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Form state for new lab test
  const [showNewForm, setShowNewForm] = useState(false);
  const [newLabTest, setNewLabTest] = useState<LabTest>({
    testName: '',
    date: '',
    result: '',
    normalRange: '',
    orderedBy: '',
    laboratory: '',
    notes: '',
    status: 'normal',
    category: 'blood',
    unit: ''
  });

  // Form state for editing
  const [editForm, setEditForm] = useState<LabTest>({
    testName: '',
    date: '',
    result: '',
    normalRange: '',
    orderedBy: '',
    laboratory: '',
    notes: '',
    status: 'normal',
    category: 'blood',
    unit: ''
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLabTests();
    }
  }, [status]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/medical-record');
      
      if (!response.ok) {
        throw new Error('Failed to fetch medical record');
      }
      
      const data = await response.json();
      
      // Ensure all lab test fields are properly typed
      const formattedLabTests = (data.labTests || []).map((test: any) => ({
        testName: test.testName || '',
        date: test.date || '',
        result: test.result || '',
        normalRange: test.normalRange || '',
        orderedBy: test.orderedBy || '',
        laboratory: test.laboratory || '',
        notes: test.notes || '',
        status: test.status || determineStatus(test.result, test.normalRange),
        category: test.category || 'blood',
        unit: test.unit || ''
      }));
      
      setLabTests(formattedLabTests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setErrorMessage('Failed to load your lab tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine status based on result and normal range
  const determineStatus = (result: string, normalRange: string): 'normal' | 'abnormal' | 'critical' => {
    if (!result || !normalRange) return 'normal';
    
    try {
      // Handle ranges with hyphen (e.g., "70-100")
      if (normalRange.includes('-')) {
        const [min, max] = normalRange.split('-').map(Number);
        const numResult = parseFloat(result);
        
        if (isNaN(min) || isNaN(max) || isNaN(numResult)) return 'normal';
        
        if (numResult < min || numResult > max) {
          // If significantly outside range, mark as critical
          if (numResult < min * 0.7 || numResult > max * 1.3) {
            return 'critical';
          }
          return 'abnormal';
        }
        return 'normal';
      }
      // Handle "less than" ranges (e.g., "<5")
      else if (normalRange.startsWith('<')) {
        const max = parseFloat(normalRange.substring(1));
        const numResult = parseFloat(result);
        
        if (isNaN(max) || isNaN(numResult)) return 'normal';
        
        if (numResult >= max) {
          if (numResult > max * 1.5) return 'critical';
          return 'abnormal';
        }
        return 'normal';
      }
      // Handle "greater than" ranges (e.g., ">10")
      else if (normalRange.startsWith('>')) {
        const min = parseFloat(normalRange.substring(1));
        const numResult = parseFloat(result);
        
        if (isNaN(min) || isNaN(numResult)) return 'normal';
        
        if (numResult <= min) {
          if (numResult < min * 0.5) return 'critical';
          return 'abnormal';
        }
        return 'normal';
      }
    } catch (e) {
      console.error('Error determining status:', e);
    }
    
    return 'normal';
  };

  const handleNewLabTestChange = (field: keyof LabTest, value: string) => {
    setNewLabTest({
      ...newLabTest,
      [field]: value
    });
  };

  const handleEditFormChange = (field: keyof LabTest, value: string) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const startEditing = (index: number) => {
    const labTest = labTests[index];
    setEditForm({
      testName: labTest.testName || '',
      date: labTest.date || '',
      result: labTest.result || '',
      normalRange: labTest.normalRange || '',
      orderedBy: labTest.orderedBy || '',
      laboratory: labTest.laboratory || '',
      notes: labTest.notes || '',
      status: labTest.status || 'normal',
      category: labTest.category || 'blood',
      unit: labTest.unit || ''
    });
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
  };

  const resetNewForm = () => {
    setNewLabTest({
      testName: '',
      date: '',
      result: '',
      normalRange: '',
      orderedBy: '',
      laboratory: '',
      notes: '',
      status: 'normal',
      category: 'blood',
      unit: ''
    });
    setShowNewForm(false);
  };

  const addLabTest = async () => {
    if (!newLabTest.testName) {
      setErrorMessage('Test name is required.');
      return;
    }

    if (!newLabTest.date) {
      setErrorMessage('Test date is required.');
      return;
    }

    try {
      setSavingIndex(-2); // Special index for new lab test
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Create a copy of the lab test to avoid state mutation issues
      const labTestToAdd = { ...newLabTest };
      
      // Determine status if not set
      if (!labTestToAdd.status) {
        labTestToAdd.status = determineStatus(labTestToAdd.result, labTestToAdd.normalRange);
      }
      
      // Add new lab test to array
      const updatedLabTests = [...(medicalRecord.labTests || []), labTestToAdd];
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          labTests: updatedLabTests
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh lab tests
      await fetchLabTests();
      
      // Reset form and show success message
      resetNewForm();
      setSuccessMessage('Lab test added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding lab test:', error);
      setErrorMessage('Failed to add lab test. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  const updateLabTest = async (index: number) => {
    try {
      setSavingIndex(index);
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Create a copy of the form data to avoid state mutation issues
      const updatedLabTest = { ...editForm };
      
      // Determine status if not set
      if (!updatedLabTest.status) {
        updatedLabTest.status = determineStatus(updatedLabTest.result, updatedLabTest.normalRange);
      }
      
      // Update lab test at index
      const updatedLabTests = [...(medicalRecord.labTests || [])];
      updatedLabTests[index] = updatedLabTest;
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          labTests: updatedLabTests
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh lab tests
      await fetchLabTests();
      
      // Reset editing state and show success message
      setEditingIndex(-1);
      setSuccessMessage('Lab test updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating lab test:', error);
      setErrorMessage('Failed to update lab test. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  const removeLabTest = async (index: number) => {
    try {
      setSavingIndex(index);
      
      // Get current medical record
      const response = await fetch('/api/medical-record');
      if (!response.ok) throw new Error('Failed to fetch medical record');
      
      const medicalRecord = await response.json();
      
      // Remove lab test at index
      const updatedLabTests = [...(medicalRecord.labTests || [])];
      updatedLabTests.splice(index, 1);
      
      // Update medical record
      const updateResponse = await fetch('/api/medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...medicalRecord,
          labTests: updatedLabTests
        })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update medical record');
      
      // Refresh lab tests
      await fetchLabTests();
      
      // Show success message
      setSuccessMessage('Lab test removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing lab test:', error);
      setErrorMessage('Failed to remove lab test. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingIndex(-1);
    }
  };

  // UI Components
  interface LabTestFormProps {
    labTest: LabTest;
    onChange: (field: keyof LabTest, value: string) => void;
    isNew?: boolean;
  }
  
  const LabTestForm = ({ labTest, onChange, isNew = false }: LabTestFormProps) => {
    // Use a local form state instead of directly modifying parent state
    const [localForm, setLocalForm] = useState<LabTest>(labTest);
    
    // Update local form state on input change
    const handleInputChange = (field: keyof LabTest, value: string) => {
      const updatedForm = {
        ...localForm,
        [field]: value
      };
      setLocalForm(updatedForm);
      // Update parent state
      onChange(field, value);
    };
    
    // Update local form when labTest prop changes
    useEffect(() => {
      // Only update if the values are different to prevent focus loss
      if (JSON.stringify(labTest) !== JSON.stringify(localForm)) {
        setLocalForm(labTest);
      }
    }, [labTest]);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Test Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={localForm.testName}
            onChange={(e) => handleInputChange('testName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., Hemoglobin A1c, Lipid Panel"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={localForm.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Result
          </label>
          <input
            type="text"
            value={localForm.result}
            onChange={(e) => handleInputChange('result', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., 5.7, Negative"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Normal Range
          </label>
          <input
            type="text"
            value={localForm.normalRange}
            onChange={(e) => handleInputChange('normalRange', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., 4.0-5.6, Negative"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <input
            type="text"
            value={localForm.unit || ''}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g., mg/dL, mmol/L"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={localForm.status || 'normal'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="normal">Normal</option>
            <option value="abnormal">Abnormal</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={localForm.category || 'blood'}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="blood">Blood Test</option>
            <option value="urine">Urine Test</option>
            <option value="imaging">Imaging</option>
            <option value="pathology">Pathology</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ordered By
          </label>
          <input
            type="text"
            value={localForm.orderedBy}
            onChange={(e) => handleInputChange('orderedBy', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Doctor's name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Laboratory
          </label>
          <input
            type="text"
            value={localForm.laboratory}
            onChange={(e) => handleInputChange('laboratory', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Laboratory or facility name"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={localForm.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Additional notes about the test"
          />
        </div>
      </div>
    );
  };
  
  const renderLabTestCard = (labTest: LabTest, index: number) => {
    const isEditing = editingIndex === index;
    const isSaving = savingIndex === index;
    
    // Get status color
    const getStatusColor = () => {
      switch (labTest.status) {
        case 'critical':
          return 'bg-red-50 text-red-700 border-red-200';
        case 'abnormal':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'normal':
        default:
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    };
    
    // Format date for display
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch (e) {
        return dateString;
      }
    };
    
    // Get category icon
    const getCategoryIcon = () => {
      switch (labTest.category) {
        case 'blood':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9" />
            </svg>
          );
        case 'urine':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          );
        case 'imaging':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          );
      }
    };
    
    // Format status for display
    const getStatusDisplay = (status?: string): string => {
      if (!status) return 'Normal';
      return status.charAt(0).toUpperCase() + status.slice(1);
    };
    
    return (
      <motion.div 
        key={`lab-test-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {isEditing ? (
          <div className="p-5">
            <LabTestForm labTest={editForm} onChange={handleEditFormChange} />
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
                onClick={() => updateLabTest(index)}
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
                    <div className="flex items-center">
                      <div className="mr-3 text-gray-400">
                        {getCategoryIcon()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{labTest.testName}</h3>
                        <p className="text-sm text-gray-500">{formatDate(labTest.date)}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                        {getStatusDisplay(labTest.status)}
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
                    onClick={() => removeLabTest(index)}
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
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gray-50 rounded-lg p-3 flex items-center">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Result:</span>
                      <span className="text-lg font-semibold">
                        {labTest.result} {labTest.unit && <span className="text-sm font-normal text-gray-500">{labTest.unit}</span>}
                      </span>
                    </div>
                    {labTest.normalRange && (
                      <div className="text-sm text-gray-500 mt-1">
                        Normal Range: {labTest.normalRange} {labTest.unit && labTest.unit}
                      </div>
                    )}
                  </div>
                  
                  {labTest.result && labTest.normalRange && (
                    <div className={`ml-4 px-3 py-1 rounded-md text-sm font-medium ${getStatusColor()}`}>
                      {labTest.status === 'normal' ? 'Within Range' : 'Out of Range'}
                    </div>
                  )}
                </div>
                
                {labTest.orderedBy && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Ordered By:</span>
                    <p className="text-sm text-gray-700">{labTest.orderedBy}</p>
                  </div>
                )}
                
                {labTest.laboratory && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Laboratory:</span>
                    <p className="text-sm text-gray-700">{labTest.laboratory}</p>
                  </div>
                )}
              </div>
              
              {labTest.notes && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500">Notes:</span>
                  <p className="mt-1 text-sm text-gray-600">{labTest.notes}</p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  View Trend
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  // Filter lab tests based on category
  const filteredLabTests = filter === 'all' 
    ? labTests 
    : labTests.filter(test => test.category === filter);

  return (
    <DashboardLayout title="Lab Results">
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lab Results</h2>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your laboratory test results
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Lab Result
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${filter === 'all' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${filter === 'all' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className={`font-medium text-sm ${filter === 'all' ? 'text-blue-700' : 'text-gray-700'}`}>
                All Tests
              </span>
              <span className="text-xs mt-1 text-gray-500">
                {labTests.length} results
              </span>
            </button>
            
            <button
              onClick={() => setFilter('blood')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                filter === 'blood'
                  ? 'bg-red-50 border-2 border-red-500 shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${filter === 'blood' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${filter === 'blood' ? 'text-red-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14C9.791 14 8 12.209 8 10C8 7 12 3 12 3C12 3 16 7 16 10C16 12.209 14.209 14 12 14Z" />
                </svg>
              </div>
              <span className={`font-medium text-sm ${filter === 'blood' ? 'text-red-700' : 'text-gray-700'}`}>
                Blood Tests
              </span>
              <span className="text-xs mt-1 text-gray-500">
                {labTests.filter(test => test.category === 'blood').length} results
              </span>
            </button>
            
            <button
              onClick={() => setFilter('urine')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                filter === 'urine'
                  ? 'bg-yellow-50 border-2 border-yellow-500 shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${filter === 'urine' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${filter === 'urine' ? 'text-yellow-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className={`font-medium text-sm ${filter === 'urine' ? 'text-yellow-700' : 'text-gray-700'}`}>
                Urine Tests
              </span>
              <span className="text-xs mt-1 text-gray-500">
                {labTests.filter(test => test.category === 'urine').length} results
              </span>
            </button>
            
            <button
              onClick={() => setFilter('imaging')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                filter === 'imaging'
                  ? 'bg-purple-50 border-2 border-purple-500 shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${filter === 'imaging' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${filter === 'imaging' ? 'text-purple-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`font-medium text-sm ${filter === 'imaging' ? 'text-purple-700' : 'text-gray-700'}`}>
                Imaging
              </span>
              <span className="text-xs mt-1 text-gray-500">
                {labTests.filter(test => test.category === 'imaging').length} results
              </span>
            </button>
          </div>
        </div>

        {/* New lab test form */}
        <AnimatePresence>
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Lab Result</h3>
                <LabTestForm labTest={newLabTest} onChange={handleNewLabTestChange} isNew={true} />
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetNewForm}
                    disabled={savingIndex === -2}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addLabTest}
                    disabled={savingIndex === -2}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {savingIndex === -2 ? (
                      <>
                        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Add Lab Result'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lab tests list */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredLabTests.length === 0 ? (
          <div className="bg-white/50 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No lab results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't added any lab results to your medical record yet."
                : `You haven't added any ${filter} tests to your medical record yet.`}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Your First Lab Result
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredLabTests.map((labTest, index) => (
                <React.Fragment key={`lab-test-fragment-${index}`}>
                  {renderLabTestCard(labTest, index)}
                </React.Fragment>
              ))}
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
            className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
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