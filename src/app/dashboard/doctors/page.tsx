'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  EnvelopeIcon, 
  PhoneIcon 
} from '@heroicons/react/24/outline';
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

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

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
          
          // Extract unique specializations for filtering
          const uniqueSpecializations = Array.from(
            new Set(data.doctors.map((doctor: Doctor) => doctor.specialization))
          ).filter(Boolean) as string[];
          
          setSpecializations(uniqueSpecializations);
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

  // Filter doctors based on search term and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = !filterSpecialization || 
      doctor.specialization === filterSpecialization;
    
    return matchesSearch && matchesSpecialization;
  });

  return (
    <DashboardLayout title="Doctors Directory">
      <div className="mb-6">
        <p className="text-gray-600">
          Browse our comprehensive directory of healthcare providers. Connect with specialists by scanning your QR code during appointments.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search doctors by name, email, or hospital"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="md:w-64">
          <select
            className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
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
          <p className="text-gray-500 mb-4">
            Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
            {filterSpecialization && ` specializing in ${filterSpecialization}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          
          {filteredDoctors.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterSpecialization 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no doctors in the database yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {doctor.profileImage ? (
                        <Image
                          src={doctor.profileImage}
                          alt={doctor.name}
                          width={64}
                          height={64}
                          className="rounded-full h-16 w-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <span className="text-2xl font-semibold">{doctor.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                        <p className="text-emerald-600 font-medium">{doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span>{doctor.hospital || 'Independent Practice'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-500 italic">
                        Scan your QR code during your visit to connect
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Available
                      </span>
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