'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  EyeIcon, 
  PencilSquareIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Doctor {
  doctorId: string;
  doctorName: string;
  specialization: string;
  profileImage?: string;
}

interface AccessLogEntry {
  doctorId: string;
  doctorName: string;
  specialization: string;
  accessDate: string;
  accessType: 'view' | 'edit';
  authorized: boolean;
}

interface EditHistoryEntry {
  field: string;
  oldValue: any;
  newValue: any;
  editedBy: {
    doctorId: string;
    doctorName: string;
    specialization: string;
  };
  editedAt: string;
  note?: string;
}

// Define a union type for combined history entries
type HistoryEntry = 
  | (AccessLogEntry & { type: 'access', entryId: string })
  | (EditHistoryEntry & { type: 'edit', entryId: string });

interface DoctorAccessHistoryProps {
  accessHistory: AccessLogEntry[];
  editHistory: EditHistoryEntry[];
  doctors: Doctor[];
}

export default function DoctorAccessHistory({ 
  accessHistory, 
  editHistory, 
  doctors 
}: DoctorAccessHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'access' | 'edit'>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | 'all'>('all');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  
  // Format field names for readability
  const formatFieldName = (fieldPath: string) => {
    return fieldPath
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
      .join(' › ');
  };
  
  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'object' && value instanceof Date) return format(value, 'MMM d, yyyy h:mm a');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Get combined history based on filters
  const filteredHistory = (): HistoryEntry[] => {
    let combined: HistoryEntry[] = [];
    
    if (filterType === 'all' || filterType === 'access') {
      combined = [
        ...combined,
        ...accessHistory
          .filter(entry => selectedDoctorId === 'all' || entry.doctorId === selectedDoctorId)
          .map(entry => ({ 
            ...entry, 
            type: 'access' as const,
            entryId: `access-${entry.doctorId}-${entry.accessDate}`
          }))
      ];
    }
    
    if (filterType === 'all' || filterType === 'edit') {
      combined = [
        ...combined,
        ...editHistory
          .filter(entry => selectedDoctorId === 'all' || entry.editedBy.doctorId === selectedDoctorId)
          .map(entry => ({
            ...entry,
            type: 'edit' as const,
            entryId: `edit-${entry.editedBy.doctorId}-${entry.editedAt}`
          }))
      ];
    }
    
    // Sort by date (newest first)
    return combined.sort((a, b) => {
      const dateA = new Date(a.type === 'access' ? a.accessDate : a.editedAt);
      const dateB = new Date(b.type === 'access' ? b.accessDate : b.editedAt);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const toggleExpand = (entryId: string) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Medical Record Activity</h3>
          <p className="text-sm text-gray-500">View when healthcare providers accessed or modified your medical record</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Filter by access type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="all">All Activity</option>
            <option value="access">Viewed Only</option>
            <option value="edit">Edits Only</option>
          </select>
          
          {/* Filter by doctor */}
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
          >
            <option value="all">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorId} value={doctor.doctorId}>
                Dr. {doctor.doctorName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* History timeline */}
      <div className="flow-root">
        <ul className="-mb-8">
          {filteredHistory().map((entry, entryIdx) => (
            <li key={entry.entryId} className="relative pb-8">
              {/* Show connector line between items */}
              {entryIdx !== filteredHistory().length - 1 ? (
                <span 
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                  aria-hidden="true" 
                />
              ) : null}
              
              <div className="relative flex space-x-3">
                {/* Icon indicator */}
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                    entry.type === 'access' ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    {entry.type === 'access' ? (
                      <EyeIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    ) : (
                      <PencilSquareIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    )}
                  </span>
                </div>
                
                {/* Entry content */}
                <div className="flex-1 min-w-0">
                  <div
                    className="relative border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpand(entry.entryId)}
                  >
                    <div className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {entry.type === 'access' ? entry.doctorName : entry.editedBy.doctorName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.type === 'access' ? entry.specialization : entry.editedBy.specialization}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-right mr-2">
                          <p className="text-sm text-gray-900">
                            {entry.type === 'access' 
                              ? `${entry.accessType === 'view' ? 'Viewed' : 'Edited'} your record`
                              : `Modified ${formatFieldName(entry.field)}`
                            }
                          </p>
                          <time dateTime={entry.type === 'access' ? entry.accessDate : entry.editedAt} className="text-xs text-gray-500">
                            {format(new Date(entry.type === 'access' ? entry.accessDate : entry.editedAt), 'MMM d, yyyy h:mm a')}
                          </time>
                        </div>
                        <ChevronDownIcon 
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            expandedEntryId === entry.entryId ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedEntryId === entry.entryId && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        {entry.type === 'access' ? (
                          <div className="text-sm text-gray-700">
                            <p className={`${entry.authorized ? 'text-green-600' : 'text-red-600'} font-medium`}>
                              {entry.authorized ? 'Authorized Access' : 'Unauthorized Access Attempt'}
                            </p>
                            <p className="mt-1">
                              Dr. {entry.doctorName} {entry.accessType === 'view' ? 'viewed' : 'edited'} your 
                              medical record on {format(new Date(entry.accessDate), 'MMMM d, yyyy')} at {format(new Date(entry.accessDate), 'h:mm a')}.
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div className="mb-2 text-gray-700">
                              {entry.note && (
                                <p className="italic mb-2">"{entry.note}"</p>
                              )}
                              <p>Dr. {entry.editedBy.doctorName} updated your medical record.</p>
                            </div>
                            
                            <div className="mt-3 border border-gray-200 rounded-md overflow-hidden">
                              <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                                Changed Field: {formatFieldName(entry.field)}
                              </div>
                              <div className="px-4 py-3 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Previous Value:</p>
                                  <div className="rounded bg-red-50 text-red-700 px-2 py-1 text-sm font-mono">
                                    {formatValue(entry.oldValue)}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">New Value:</p>
                                  <div className="rounded bg-green-50 text-green-700 px-2 py-1 text-sm font-mono">
                                    {formatValue(entry.newValue)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          
          {filteredHistory().length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterType === 'all' 
                  ? 'No doctors have accessed your medical record yet.' 
                  : filterType === 'access' 
                    ? 'No view activity found for the selected filters.' 
                    : 'No edit history found for the selected filters.'
                }
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
} 