"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AppointmentForm, AppointmentCalendar, AppointmentList } from '@/components/appointments';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isDoctor = session?.user?.role === 'doctor';

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Appointments">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              {view === 'list' ? 'View and manage your upcoming appointments' : 'Calendar view of your schedule'}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              className={`px-3 py-2 rounded-md ${
                view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setView('list')}
            >
              List View
            </button>
            <button
              className={`px-3 py-2 rounded-md ${
                view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setView('calendar')}
            >
              Calendar View
            </button>
            {isDoctor && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-1" />
                New Appointment
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {view === 'list' ? (
            <AppointmentList selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          ) : (
            <AppointmentCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Schedule New Appointment</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <AppointmentForm onSuccess={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 