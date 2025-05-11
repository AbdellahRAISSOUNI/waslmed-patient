'use client';

import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DoctorRequestProps {
  doctorId: string;
  doctorName: string;
  specialization: string;
  profileImage?: string;
  hospital?: string;
  requestDate: string;
  reason?: string;
}

interface DoctorRequestsProps {
  requests: DoctorRequestProps[];
  onApprove: (doctorId: string) => void;
  onReject: (doctorId: string) => void;
}

export default function DoctorRequests({ requests, onApprove, onReject }: DoctorRequestsProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-500 mb-4">
        These healthcare providers have requested access to your medical record. 
        Review each request carefully before approving or rejecting.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <div 
            key={request.doctorId}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-3">
                {request.profileImage ? (
                  <Image
                    src={request.profileImage}
                    alt={request.doctorName}
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
                  <h3 className="font-medium text-gray-900">{request.doctorName}</h3>
                  <p className="text-sm text-gray-500">{request.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {request.hospital && (
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{request.hospital}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{request.specialization}</span>
                </div>
              </div>

              {request.reason && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Reason for request</h4>
                  <p className="text-sm text-gray-700">{request.reason}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Requested on {format(new Date(request.requestDate), 'MMMM d, yyyy')}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => onReject(request.doctorId)}
                    className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(request.doctorId)}
                    className="flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 