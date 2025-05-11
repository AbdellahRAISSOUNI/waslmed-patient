'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Image from 'next/image';

export default function PatientDoctorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedDoctors, setConnectedDoctors] = useState([]);

  // Fetch all doctor connections
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all connected doctors (they're all automatically approved now)
      const response = await fetch('/api/patient/doctors');
      if (!response.ok) {
        throw new Error('Failed to fetch connected doctors');
      }
      const data = await response.json();
      setConnectedDoctors(data.doctors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Render a doctor card
  const renderDoctorCard = (doctor: any) => {
    return (
      <div key={doctor.doctorId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="p-4">
          {/* Doctor header with image and name */}
          <div className="flex items-center space-x-4 mb-3">
            {doctor.profileImage ? (
              <Image
                src={doctor.profileImage}
                alt={doctor.doctorName}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{doctor.doctorName}</h3>
              <p className="text-sm text-gray-500">{doctor.specialization}</p>
            </div>
          </div>

          {/* Doctor details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            {doctor.hospital && (
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{doctor.hospital}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{doctor.specialization}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Connected on {format(new Date(doctor.requestDate), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Connection reason (if provided) */}
          {doctor.reason && (
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Connection reason</h4>
              <p className="text-sm text-gray-700">{doctor.reason}</p>
            </div>
          )}

          {/* Additional notes (if any) */}
          {doctor.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-xs font-medium text-blue-500 uppercase mb-1">Additional Notes</h4>
              <p className="text-sm text-blue-700">{doctor.notes}</p>
            </div>
          )}

          {/* Connection status badge */}
          <div className="mb-3 p-2 rounded-md bg-green-50 text-green-700 border border-green-200">
            <p className="text-sm font-medium">
              Status: Connected
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Your Healthcare Providers">
      <p className="text-gray-600 mb-6">
        Here are all the healthcare providers who have connected to your medical record by scanning your QR code.
      </p>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <button
            onClick={fetchDoctors}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <>
          {connectedDoctors.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Doctors</h3>
              <p className="text-gray-500">
                You don't have any connected healthcare providers yet. When a doctor scans your QR code, they will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedDoctors.map((doctor) => renderDoctorCard(doctor))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
} 