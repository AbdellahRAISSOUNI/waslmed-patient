'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserIcon, DocumentTextIcon, UserGroupIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface Doctor {
  doctorId: string;
  doctorName: string;
  status: string;
  requestDate: string;
}

interface Patient {
  id: string;
  userName: string;
  userEmail: string;
  userId: string;
  doctorConnections: number;
  connectedDoctors: Doctor[];
  createdAt: string;
}

export default function AllPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/debug/all-patients');
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data = await response.json();
        if (data.success) {
          setPatients(data.patients);
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleExpand = (patientId: string) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null);
    } else {
      setExpandedPatient(patientId);
    }
  };

  return (
    <DashboardLayout title="All Patients (Debug)">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Debug View:</strong> This page shows all patients in the database for testing purposes.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div>
          <p className="text-gray-500 mb-4">Total patients: {patients.length}</p>
          
          {patients.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-500">
                There are no patients in the database yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div 
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(patient.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.userName}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                            <span>{patient.userEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            <span>{patient.doctorConnections} connected doctors</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Created: {formatDate(patient.createdAt)}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 transition-transform duration-200 ${expandedPatient === patient.id ? 'transform rotate-180' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedPatient === patient.id && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Connected Doctors</h4>
                      
                      {patient.connectedDoctors.length === 0 ? (
                        <p className="text-sm text-gray-500">No connected doctors yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {patient.connectedDoctors.map((doctor, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{doctor.doctorName}</h5>
                                  <div className="text-xs text-gray-500">
                                    Doctor ID: {doctor.doctorId}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  doctor.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : doctor.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {doctor.status}
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                Connected on: {formatDate(doctor.requestDate)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Medical Record ID: {patient.id}</p>
                        <p className="text-xs text-gray-500">User ID: {patient.userId}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
} 