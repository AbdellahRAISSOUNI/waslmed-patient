'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { UserIcon, UserGroupIcon, WrenchIcon, ArrowPathIcon, BugAntIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleResetConnections = async () => {
    if (!confirm('Are you sure you want to reset all connections to approved status?')) {
      return;
    }

    setIsResetting(true);
    setResetResult(null);

    try {
      const response = await fetch('/api/debug/reset-connections', {
        method: 'POST'
      });

      const data = await response.json();
      setResetResult(JSON.stringify(data, null, 2));
      
      if (data.success) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.error('Error resetting connections:', error);
      setResetResult(JSON.stringify({ error: 'Failed to reset connections' }, null, 2));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Warning:</strong> This is an admin area with debugging tools. Use with caution.
        </p>
      </div>

      {showSuccessMessage && (
        <div className="fixed top-6 right-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Connections have been reset.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-emerald-500" />
            View Data
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard/all-doctors" className="text-emerald-600 hover:text-emerald-800 flex items-center py-2">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                All Doctors
              </Link>
            </li>
            <li>
              <Link href="/dashboard/all-patients" className="text-emerald-600 hover:text-emerald-800 flex items-center py-2">
                <UserIcon className="w-5 h-5 mr-2" />
                All Patients
              </Link>
            </li>
            <li>
              <Link href="/api/debug/all-connections" target="_blank" className="text-emerald-600 hover:text-emerald-800 flex items-center py-2">
                <BugAntIcon className="w-5 h-5 mr-2" />
                API: All Connections (JSON)
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <WrenchIcon className="w-6 h-6 mr-2 text-emerald-500" />
            Admin Tools
          </h2>
          
          <div className="mb-4">
            <button
              onClick={handleResetConnections}
              disabled={isResetting}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  <span>Reset All Connections</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              This will update all connections to "approved" status.
            </p>
          </div>

          {resetResult && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Result</h3>
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-40">{resetResult}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Individual Lookup</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Check Medical Record</h3>
            <div className="flex items-center">
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-l p-2 text-sm" 
                placeholder="Enter patient email"
                id="patientEmail"
              />
              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  const email = (document.getElementById('patientEmail') as HTMLInputElement).value;
                  if (email) {
                    window.open(`/api/debug/medical-record?email=${encodeURIComponent(email)}`, '_blank');
                  }
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-r hover:bg-emerald-700"
              >
                Check
              </Link>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Check Doctor</h3>
            <div className="flex items-center">
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-l p-2 text-sm" 
                placeholder="Enter doctor email"
                id="doctorEmail"
              />
              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  const email = (document.getElementById('doctorEmail') as HTMLInputElement).value;
                  if (email) {
                    window.open(`/api/debug/doctor?email=${encodeURIComponent(email)}`, '_blank');
                  }
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-r hover:bg-emerald-700"
              >
                Check
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 