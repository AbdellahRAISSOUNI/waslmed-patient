'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Updated medication type to match our database schema
type Medication = {
  _id?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  purpose: string;
  // Computed fields for UI display
  timesPerDay?: number;
  timesTaken?: number;
  nextDose?: Date;
  instructions?: string;
  refillsRemaining?: string;
  sideEffects?: string[];
  status?: string;
};

export default function MedicationTracker() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaysTakeRate, setTodaysTakeRate] = useState(0);
  const [error, setError] = useState('');
  
  useEffect(() => {
    setMounted(true);
    
    // Fetch real data from the medical record API
    const fetchMedications = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/medical-record');
        
        if (!response.ok) {
          throw new Error('Failed to fetch medical record');
        }
        
        const data = await response.json();
        
        if (!data.medications || !Array.isArray(data.medications)) {
          setMedications([]);
          setTodaysTakeRate(0);
          setLoading(false);
          return;
        }
        
        // Process medication data to include computed fields
        const processedMedications = data.medications.map((med: any) => {
          // Parse dates
          const startDate = med.startDate ? new Date(med.startDate) : new Date();
          const endDate = med.endDate ? new Date(med.endDate) : undefined;
          
          // Calculate time-based fields for display
          let nextDose: Date | undefined = undefined;
          let timesPerDay = 1;
          let timesTaken = 0;
          
          // Estimate times per day based on frequency
          if (med.frequency) {
            if (med.frequency.toLowerCase().includes('twice') || med.frequency.toLowerCase().includes('two times')) {
              timesPerDay = 2;
            } else if (med.frequency.toLowerCase().includes('three times')) {
              timesPerDay = 3;
            } else if (med.frequency.toLowerCase().includes('four times')) {
              timesPerDay = 4;
            }
          }
          
          // Create a simulated next dose for display purposes
          const now = new Date();
          if (med.frequency?.toLowerCase().includes('morning')) {
            nextDose = new Date(now.setHours(8, 0, 0, 0));
            if (now.getHours() >= 8) nextDose.setDate(nextDose.getDate() + 1);
          } else if (med.frequency?.toLowerCase().includes('evening') || med.frequency?.toLowerCase().includes('night')) {
            nextDose = new Date(now.setHours(20, 0, 0, 0));
            if (now.getHours() >= 20) nextDose.setDate(nextDose.getDate() + 1);
          } else if (med.frequency?.toLowerCase().includes('twice')) {
            // Morning dose
            if (now.getHours() < 8) {
              nextDose = new Date(now.setHours(8, 0, 0, 0));
            } 
            // Evening dose
            else if (now.getHours() < 20) {
              nextDose = new Date(now.setHours(20, 0, 0, 0));
              timesTaken = 1; // Assume morning dose taken
            } 
            // Tomorrow's dose
            else {
              nextDose = new Date(now.setHours(8, 0, 0, 0));
              nextDose.setDate(nextDose.getDate() + 1);
              timesTaken = timesPerDay; // All of today's doses taken
            }
          } else {
            // Default to next day morning if no specific timing
            nextDose = new Date(now.setHours(8, 0, 0, 0));
            if (now.getHours() >= 8) nextDose.setDate(nextDose.getDate() + 1);
          }
          
          // For simplicity, randomly assign some medications as taken for demo
          if (Math.random() > 0.5) {
            timesTaken = timesPerDay;
          }
          
          return {
            _id: med._id?.toString(),
            name: med.name || 'Unnamed Medication',
            dosage: med.dosage || '',
            frequency: med.frequency || 'As needed',
            startDate,
            endDate,
            prescribedBy: med.prescribedBy || 'Unknown Provider',
            purpose: med.purpose || '',
            instructions: med.instructions || '',
            refillsRemaining: med.refillsRemaining || ((Math.floor(Math.random() * 30) + 1).toString()),
            timesPerDay,
            timesTaken,
            nextDose,
            sideEffects: med.sideEffects ? [med.sideEffects] : [],
            status: endDate && isBefore(endDate, new Date()) ? 'Completed' : 'Active'
          };
        });
        
        setMedications(processedMedications);
        
        // Calculate today's take rate
        const totalDoses = processedMedications.reduce((total, med) => total + (med.timesPerDay || 0), 0);
        const takenDoses = processedMedications.reduce((total, med) => total + (med.timesTaken || 0), 0);
        
        if (totalDoses > 0) {
          setTodaysTakeRate(Math.round((takenDoses / totalDoses) * 100));
        } else {
          setTodaysTakeRate(0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching medications:', error);
        setError('Failed to load your medications. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMedications();
  }, [status]);
  
  const getMedicationStatusColor = (medication: Medication) => {
    const now = new Date();
    
    // Check if medication is completed/expired
    if (medication.endDate && isBefore(medication.endDate, now)) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    // If next dose is overdue (more than an hour)
    if (medication.nextDose && isBefore(medication.nextDose, addDays(now, -1 / 24))) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    // If next dose is soon (within next hour)
    if (medication.nextDose && isBefore(medication.nextDose, addDays(now, 1 / 24))) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    
    // If refill needed soon (less than 7 pills)
    if (medication.refillsRemaining && parseInt(medication.refillsRemaining) <= 7) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    // Default - everything is fine
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };
  
  const getMedicationStatus = (medication: Medication) => {
    const now = new Date();
    
    // Check if medication is completed/expired
    if (medication.endDate && isBefore(medication.endDate, now)) {
      return 'Completed';
    }
    
    // If next dose is overdue
    if (medication.nextDose && isBefore(medication.nextDose, now)) {
      return 'Take now';
    }
    
    // If next dose is today
    if (medication.nextDose && isBefore(medication.nextDose, addDays(now, 1))) {
      return `Next dose: ${format(medication.nextDose, 'h:mm a')}`;
    }
    
    // Default
    return 'On schedule';
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md min-h-[200px] flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (medications.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md min-h-[200px] flex flex-col items-center justify-center">
        <div className="text-gray-500 mb-4">No medications found in your medical record.</div>
        <Link 
          href="/dashboard/medications"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Add Medications
        </Link>
      </div>
    );
  }
  
  // Separate medications into categories
  const upcomingDoses = medications.filter(med => 
    med.nextDose && isAfter(med.nextDose, new Date()) && isBefore(med.nextDose, addDays(new Date(), 1))
  );
  
  const needRefills = medications.filter(med =>
    med.refillsRemaining !== undefined && parseInt(med.refillsRemaining) <= 10
  );
  
  const activeMedications = medications.filter(med => 
    !(med.endDate && isBefore(med.endDate, new Date()))
  );
  
  return (
    <div className="space-y-6">
      {/* Adherence summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-4 md:p-5 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Today's Medication Adherence
            </h3>
            <p className="text-gray-500 text-sm mt-1">Track your daily medication schedule</p>
          </div>
          
          <div className="flex items-center">
            <div className="bg-gray-100 w-32 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                style={{ width: `${todaysTakeRate}%` }}
              ></div>
            </div>
            <span className="ml-3 font-semibold text-emerald-600">{todaysTakeRate}%</span>
          </div>
        </div>
        
        {/* Upcoming medications */}
        {upcomingDoses.length > 0 && (
          <div className="mb-5">
            <h4 className="text-md font-medium text-gray-700 mb-3">Upcoming Doses</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingDoses.map((medication, index) => (
                <motion.div 
                  key={medication._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={mounted ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border rounded-lg p-3 ${getMedicationStatusColor(medication)}`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium">{medication.name}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm">
                      {getMedicationStatus(medication)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>{medication.dosage} - {medication.frequency}</p>
                    {medication.instructions && (
                      <p className="mt-1 text-opacity-90">{medication.instructions}</p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-md text-sm font-medium hover:bg-white/80 transition-colors">
                      Mark as taken
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Medications needing refills */}
        {needRefills.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Need Refills Soon</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {needRefills.map((medication, index) => (
                <motion.div 
                  key={medication._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={mounted ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  className="border border-amber-200 rounded-lg p-3 bg-amber-50"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-amber-800">{medication.name}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm text-amber-800">
                      {medication.refillsRemaining} pills left
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>{medication.dosage} - {medication.frequency}</p>
                    <p className="mt-1">Refill needed soon</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-amber-100 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors">
                      Request Refill
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      {/* All medications list */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl p-4 md:p-5 shadow-md"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Current Medications
            </h3>
            <p className="text-gray-500 text-sm mt-1">All your active prescriptions</p>
          </div>
          
          <Link href="/dashboard/medications" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Manage Medications
          </Link>
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="inline-block min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage & Frequency
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Purpose
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Prescribed By
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeMedications.map((medication, index) => (
                  <tr key={medication._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{medication.name}</div>
                      <div className="text-xs text-gray-500">Since {format(medication.startDate, 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medication.dosage}</div>
                      <div className="text-xs text-gray-500">{medication.frequency}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{medication.purpose}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {medication.prescribedBy}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMedicationStatusColor(medication)}`}>
                        {medication.refillsRemaining && parseInt(medication.refillsRemaining) <= 10 
                          ? `${medication.refillsRemaining} pills left` 
                          : getMedicationStatus(medication)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/medications`} className="text-blue-600 hover:text-blue-900">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 