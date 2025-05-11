'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PersonalInfoForm from './components/PersonalInfoForm';
import MedicalHistoryForm from './components/MedicalHistoryForm';
import LifestyleForm from './components/LifestyleForm';
import FamilyHistoryForm from './components/FamilyHistoryForm';
import MedicationsForm from './components/MedicationsForm';
import { ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, HeartIcon, BeakerIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MedicalRecordData {
  [key: string]: any;
}

export default function MedicalRecord() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordData | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchMedicalRecord = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/medical-record');
          if (response.ok) {
            const data = await response.json();
            setMedicalRecord(data);
          } else {
            // Create a new empty record if none exists
            setMedicalRecord({} as MedicalRecordData);
          }
        } catch (error) {
          console.error('Error fetching medical record:', error);
          setMedicalRecord({} as MedicalRecordData);
        }
      }
      setLoading(false);
    };

    if (session?.user) {
      fetchMedicalRecord();
    }
  }, [session]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSave = async (formData: MedicalRecordData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/medical-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('Failed to save medical record');
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
    }
    setIsSaving(false);
  };

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Information',
      icon: <UserCircleIcon className="w-5 h-5" />
    },
    { 
      id: 'medical', 
      label: 'Medical History',
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />
    },
    { 
      id: 'lifestyle', 
      label: 'Lifestyle',
      icon: <HeartIcon className="w-5 h-5" />
    },
    { 
      id: 'family', 
      label: 'Family History',
      icon: <BeakerIcon className="w-5 h-5" />
    },
    { 
      id: 'medications', 
      label: 'Medications',
      icon: <DocumentTextIcon className="w-5 h-5" />
    },
  ];

  return (
    <DashboardLayout title="Medical Record">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-3 py-2 rounded-lg bg-white shadow-sm border border-gray-200 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
        
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg flex items-center shadow-sm"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Medical record saved successfully
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            <p className="text-gray-500">Loading your medical record...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Mobile Tab Selection (Dropdown for small screens) */}
          <div className="md:hidden p-4 border-b border-gray-200">
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center hover:bg-gray-100 focus:z-10 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-emerald-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`${activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area with Animated Transitions */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {activeTab === 'personal' && (
              <PersonalInfoForm 
                initialData={medicalRecord} 
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'medical' && (
              <MedicalHistoryForm 
                initialData={medicalRecord} 
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'lifestyle' && (
              <LifestyleForm 
                initialData={medicalRecord} 
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'family' && (
              <FamilyHistoryForm 
                initialData={medicalRecord} 
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'medications' && (
              <MedicationsForm 
                initialData={medicalRecord} 
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </motion.div>
          
          {/* Progress Indicator */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Completion:</span>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ 
                      width: `${calculateCompletionPercentage(medicalRecord)}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {calculateCompletionPercentage(medicalRecord)}%
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Last updated: {medicalRecord?.lastUpdated ? new Date(medicalRecord.lastUpdated).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Helper function to calculate completion percentage
function calculateCompletionPercentage(record: MedicalRecordData | null): number {
  if (!record) return 0;
  
  let fieldsCompleted = 0;
  let totalFields = 0;
  
  // Personal info fields
  const personalInfoFields = ['dateOfBirth', 'gender', 'bloodType', 'height', 'weight', 'maritalStatus', 'occupation'];
  personalInfoFields.forEach(field => {
    totalFields++;
    if (record.personalInfo && record.personalInfo[field]) fieldsCompleted++;
  });
  
  // Emergency contact
  if (record.personalInfo?.emergencyContact) {
    ['name', 'relationship', 'phone'].forEach(field => {
      totalFields++;
      if (record.personalInfo.emergencyContact[field]) fieldsCompleted++;
    });
  }
  
  // Count array items
  ['allergies', 'medications', 'conditions', 'surgeries', 'immunizations', 'familyHistory', 'labTests'].forEach(section => {
    if (record[section] && Array.isArray(record[section]) && record[section].length > 0) {
      fieldsCompleted++;
    }
    totalFields++;
  });
  
  // Lifestyle section
  if (record.lifestyle) {
    ['smokingStatus', 'alcoholConsumption', 'exerciseFrequency', 'diet', 'sleepPattern'].forEach(field => {
      totalFields++;
      if (record.lifestyle[field]) fieldsCompleted++;
    });
  }
  
  return Math.round((fieldsCompleted / totalFields) * 100);
} 