'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserIcon, BuildingOfficeIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hospital: string;
  profileImage?: string;
  createdAt: string;
}

export default function AllDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/debug/all-doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        
        const data = await response.json();
        if (data.success) {
          setDoctors(data.doctors);
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout title="All Doctors (Debug)">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          <strong>Debug View:</strong> This page shows all doctors in the database for testing purposes.
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
          <p className="text-gray-500 mb-4">Total doctors: {doctors.length}</p>
          
          {doctors.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
              <p className="text-gray-500">
                There are no doctors in the database yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center space-x-4 mb-3">
                      {doctor.profileImage ? (
                        <Image
                          src={doctor.profileImage}
                          alt={doctor.name}
                          width={48}
                          height={48}
                          className="rounded-full h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex items-center text-sm">
                        <AcademicCapIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span>{doctor.specialization}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span>{doctor.hospital}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span>Created: {formatDate(doctor.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Doctor ID: {doctor.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
} 