"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string | Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: string;
  notes?: string;
}

interface AppointmentCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  selectedDate, 
  setSelectedDate 
}) => {
  const { data: session } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching appointments for calendar view...');
        
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

  useEffect(() => {
    // Update selected day appointments when selectedDate or appointments change
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, selectedDate);
    });
    
    // Sort appointments by time
    const sorted = [...dayAppointments].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
    
    setSelectedDayAppointments(sorted);
  }, [selectedDate, appointments]);

  const previousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const renderDays = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-px mt-4">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 text-xs font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate first day of month offset
    const firstDayOfMonth = monthStart.getDay();
    
    // Create an array to hold all days including empty cells for days from previous/next months
    const totalCells = [];
    
    // Add empty cells for days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      totalCells.push(<div key={`empty-${i}`} className="h-14 p-1 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for days in the current month
    for (const day of dateRange) {
      const formattedDate = format(day, 'd');
      const isSelected = isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      
      // Count appointments for this day
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return isSameDay(appointmentDate, day);
      });
      
      const hasAppointments = dayAppointments.length > 0;
      
      totalCells.push(
        <div
          key={day.toString()}
          className={`h-14 p-1 border border-gray-200 overflow-hidden ${
            isSelected ? 'bg-blue-50' : ''
          } hover:bg-gray-100 cursor-pointer`}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex justify-between">
            <span 
              className={`text-sm font-medium ${
                !isSameMonth(day, currentMonth) ? 'text-gray-400' : 
                isToday ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              {formattedDate}
            </span>
            
            {hasAppointments && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {dayAppointments.length}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    // Fill remaining cells in the last row
    const totalDaysDisplayed = totalCells.length;
    const remainingCells = 7 - (totalDaysDisplayed % 7);
    
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        totalCells.push(
          <div key={`empty-end-${i}`} className="h-14 p-1 border border-gray-200 bg-gray-50"></div>
        );
      }
    }
    
    return <div className="grid grid-cols-7 gap-px">{totalCells}</div>;
  };

  const renderSelectedDayAppointments = () => {
    if (selectedDayAppointments.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No appointments scheduled for {format(selectedDate, 'MMMM d, yyyy')}
        </div>
      );
    }
    
    // Safely access the role property
    const isDoctor = session?.user ? (session.user as any).role === 'doctor' : false;
    
    return (
      <div className="space-y-2 max-h-48 overflow-y-auto p-2">
        {selectedDayAppointments.map(appointment => (
          <div 
            key={appointment._id} 
            className={`p-2 rounded-md text-xs ${
              appointment.status === 'scheduled' ? 'bg-green-100' :
              appointment.status === 'completed' ? 'bg-blue-100' :
              appointment.status === 'cancelled' ? 'bg-red-100' :
              'bg-yellow-100'
            }`}
          >
            <div className="font-medium">{appointment.time} - {appointment.type}</div>
            <div>
              {isDoctor ? 
                `Patient: ${appointment.patientName}` : 
                `Doctor: ${appointment.doctorName}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
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
      ) : !error && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={previousMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {renderDays()}
          {renderCells()}
          
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {renderSelectedDayAppointments()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar; 