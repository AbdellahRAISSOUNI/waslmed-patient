"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, parseISO, isToday, isPast, isFuture, isThisWeek, isThisMonth } from 'date-fns';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { Appointment } from '@/types/appointment';

interface AppointmentListProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ selectedDate, setSelectedDate }) => {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const isDoctor = session?.user ? (session.user as any).role === 'doctor' : false;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching appointments...');
        
        const response = await fetch('/api/appointments');
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          throw new Error(errorData.details || errorData.error || 'Failed to fetch appointments');
        }
        
        const data = await response.json();
        console.log('Appointments fetched successfully:', data.length);
        setAppointments(data);
      } catch (error: unknown) {
        console.error('Error fetching appointments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch appointments. Please try again later.';
        setError(errorMessage);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchAppointments();
    }
  }, [session]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update appointment status');
      
      // Update the local state to reflect the status change
      setAppointments(prev => 
        prev.map(appointment => 
          appointment._id === id 
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );
    } catch (error: unknown) {
      console.error('Error updating appointment status:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    
    // Filter by date
    if (filter === 'today' && !isToday(appointmentDate)) return false;
    if (filter === 'upcoming' && !isFuture(appointmentDate)) return false;
    if (filter === 'past' && !isPast(appointmentDate)) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
    
    return true;
  });

  // Sort appointments by date and time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If same date, sort by time
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="divide-y divide-gray-200">
      <div className="p-4 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
              Date Filter
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Appointments</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
              Status Filter
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <div className="mt-2 flex justify-end">
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : !error && sortedAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming'
              ? "You don't have any upcoming appointments."
              : filter === 'today'
              ? "You don't have any appointments scheduled for today."
              : filter === 'past'
              ? "You don't have any past appointments."
              : "You don't have any appointments that match the current filters."}
          </p>
        </div>
      ) : !error && (
        <ul className="divide-y divide-gray-200">
          {sortedAppointments.map((appointment) => {
            const appointmentDate = new Date(appointment.date);
            const isPastAppointment = isPast(appointmentDate) && !isToday(appointmentDate);
            
            return (
              <li key={appointment._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {isDoctor ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {isDoctor ? appointment.patientName : appointment.doctorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.type.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {appointment.time} ({appointment.duration} minutes)
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          appointment.status === 'scheduled'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium">Notes:</p>
                    <p>{appointment.notes}</p>
                  </div>
                )}
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {appointment.status === 'scheduled' && (
                    <>
                      {isDoctor && !isPastAppointment && (
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'completed')}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Mark Completed
                        </button>
                      )}
                      
                      {isDoctor && (
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'no-show')}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Mark No-Show
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AppointmentList; 