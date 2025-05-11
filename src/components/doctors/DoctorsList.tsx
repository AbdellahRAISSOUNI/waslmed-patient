'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  XMarkIcon,
  EyeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

interface DoctorProps {
  doctorId: string;
  doctorName: string;
  specialization: string;
  profileImage?: string;
  hospital?: string;
  status: string;
  requestDate: string;
  responseDate?: string;
  reason?: string;
  notes?: string;
}

interface DoctorsListProps {
  doctors: DoctorProps[];
  onRemoveDoctor: (doctorId: string) => void;
}

export default function DoctorsList({ doctors, onRemoveDoctor }: DoctorsListProps) {
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);

  const toggleExpand = (doctorId: string) => {
    setExpandedDoctorId(expandedDoctorId === doctorId ? null : doctorId);
  };

  const handleRemoveConfirm = (doctorId: string) => {
    setShowRemoveConfirm(doctorId);
  };

  const confirmRemoval = (doctorId: string) => {
    onRemoveDoctor(doctorId);
    setShowRemoveConfirm(null);
  };

  const cancelRemoval = () => {
    setShowRemoveConfirm(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-500 mb-4">
        These healthcare providers have been approved to access your medical record. You can remove their access at any time.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {doctors.map((doctor) => (
          <div 
            key={doctor.doctorId}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleExpand(doctor.doctorId)}
            >
              <div className="flex items-center space-x-4">
                {doctor.profileImage ? (
                  <Image
                    src={doctor.profileImage}
                    alt={doctor.doctorName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{doctor.doctorName}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-4">
                  Connected {format(new Date(doctor.responseDate || doctor.requestDate), 'MMM d, yyyy')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveConfirm(doctor.doctorId);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expanded doctor information */}
            {expandedDoctorId === doctor.doctorId && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.hospital && (
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{doctor.hospital}</span>
                    </div>
                  )}
                  {doctor.specialization && (
                    <div className="flex items-center space-x-2">
                      <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{doctor.specialization}</span>
                    </div>
                  )}
                </div>

                {doctor.notes && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm text-gray-700">{doctor.notes}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Access granted:</span> {format(new Date(doctor.responseDate || doctor.requestDate), 'MMMM d, yyyy')}
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex items-center text-xs text-emerald-600">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>Viewed 12 times</span>
                    </div>
                    <div className="flex items-center text-xs text-amber-600">
                      <PencilSquareIcon className="w-4 h-4 mr-1" />
                      <span>Made 3 edits</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Removal confirmation dialog */}
            {showRemoveConfirm === doctor.doctorId && (
              <div className="border-t border-gray-200 p-4 bg-red-50">
                <p className="text-sm text-red-700 mb-3">
                  Are you sure you want to remove Dr. {doctor.doctorName} from your connected doctors? 
                  They will no longer have access to your medical record.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelRemoval}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmRemoval(doctor.doctorId)}
                    className="px-3 py-1.5 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  >
                    Remove Access
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 