"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, addDays } from 'date-fns';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AppointmentFormProps {
  appointmentId?: string;
  onSuccess: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointmentId, onSuccess }) => {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('check-up');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch connected patients
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/patient/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data = await response.json();
        
        // Format patient data
        if (data && data.connections) {
          const formattedPatients = data.connections
            .filter((connection: any) => connection.status === 'approved')
            .map((connection: any) => connection.patient);
          
          setPatients(formattedPatients);
          
          // Set first patient as default if available
          if (formattedPatients.length > 0 && !patientId) {
            setPatientId(formattedPatients[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Error loading patients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch appointment details if editing
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        
        const data = await response.json();
        
        // Populate form with appointment data
        setPatientId(data.patientId);
        setDate(format(new Date(data.date), 'yyyy-MM-dd'));
        setTime(data.time);
        setDuration(data.duration);
        setType(data.type);
        setNotes(data.notes || '');
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Error loading appointment details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === 'doctor') {
      fetchPatients();
      if (appointmentId) {
        fetchAppointment();
      }
    }
  }, [session, appointmentId, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      setError('Please select a patient');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const selectedPatient = patients.find(p => p._id === patientId);
      if (!selectedPatient) {
        setError('Invalid patient selected');
        return;
      }
      
      const appointmentData = {
        patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        date,
        time,
        duration: Number(duration),
        type,
        notes,
      };
      
      // Determine if creating or updating
      const url = appointmentId 
        ? `/api/appointments/${appointmentId}` 
        : '/api/appointments';
        
      const method = appointmentId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save appointment');
      }
      
      // Show success message
      setSuccessMessage(appointmentId ? 'Appointment updated successfully' : 'Appointment created successfully');
      
      // Reset form if creating new appointment
      if (!appointmentId) {
        setTime('09:00');
        setDuration(30);
        setNotes('');
      }
      
      // Call success callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session || session.user?.role !== 'doctor') {
    return (
      <div className="p-4 text-center text-red-600">
        Only doctors can schedule appointments
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
          Patient
        </label>
        <select
          id="patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.firstName} {patient.lastName} ({patient.email})
            </option>
          ))}
        </select>
        {patients.length === 0 && !isLoading && (
          <p className="mt-1 text-sm text-gray-500">
            No connected patients available. Patients must approve your connection request before you can schedule appointments.
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Appointment Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="check-up">Check-up</option>
            <option value="follow-up">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="procedure">Procedure</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Add any relevant notes about this appointment"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading 
            ? 'Saving...' 
            : appointmentId 
              ? 'Update Appointment' 
              : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm; 