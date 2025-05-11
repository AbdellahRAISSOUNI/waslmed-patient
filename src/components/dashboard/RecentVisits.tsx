'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday, addDays } from 'date-fns';

type Visit = {
  id: string;
  doctorName: string;
  specialization: string;
  date: Date;
  reason: string;
  notes?: string;
  status: 'completed' | 'upcoming' | 'today';
  location?: string;
};

export default function RecentVisits() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[]>([]);
  
  useEffect(() => {
    setMounted(true);
    
    // In a real application, this would fetch data from an API
    const fetchVisits = async () => {
      try {
        // Mock data - would be replaced with a real API call
        // const response = await fetch('/api/visits');
        // const data = await response.json();
        
        // For demo purposes, using mock data
        const mockVisits: Visit[] = [
          {
            id: '1',
            doctorName: 'Dr. Sarah Johnson',
            specialization: 'Cardiologist',
            date: addDays(new Date(), -14),
            reason: 'Annual heart checkup',
            notes: 'Blood pressure slightly elevated. Follow-up in 3 months.',
            status: 'completed',
            location: 'City Medical Center'
          },
          {
            id: '2',
            doctorName: 'Dr. Michael Chen',
            specialization: 'Dermatologist',
            date: addDays(new Date(), -5),
            reason: 'Skin examination',
            notes: 'No concerning findings. Continue with current skincare routine.',
            status: 'completed',
            location: 'Wellness Clinic'
          },
          {
            id: '3',
            doctorName: 'Dr. Emily Williams',
            specialization: 'General Practitioner',
            date: new Date(),
            reason: 'Follow-up appointment',
            status: 'today',
            location: 'Community Health Center'
          },
          {
            id: '4',
            doctorName: 'Dr. James Wilson',
            specialization: 'Ophthalmologist',
            date: addDays(new Date(), 7),
            reason: 'Vision check',
            status: 'upcoming',
            location: 'Vision Care Center'
          },
          {
            id: '5',
            doctorName: 'Dr. Patricia Garcia',
            specialization: 'Endocrinologist',
            date: addDays(new Date(), 14),
            reason: 'Diabetes management',
            status: 'upcoming',
            location: 'Diabetes Care Clinic'
          }
        ];
        
        setVisits(mockVisits);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching visits:', error);
        setLoading(false);
      }
    };
    
    fetchVisits();
  }, []);
  
  // Helper function to get status text and color
  const getStatusDetails = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return { 
          text: 'Completed', 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-700' 
        };
      case 'today':
        return { 
          text: 'Today', 
          bgColor: 'bg-amber-100', 
          textColor: 'text-amber-700' 
        };
      case 'upcoming':
        return { 
          text: 'Upcoming', 
          bgColor: 'bg-emerald-100', 
          textColor: 'text-emerald-700' 
        };
      default:
        return { 
          text: 'Unknown', 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-700' 
        };
    }
  };
  
  const upcomingVisits = visits.filter(visit => !isPast(visit.date) || isToday(visit.date));
  const pastVisits = visits.filter(visit => isPast(visit.date) && !isToday(visit.date));
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Upcoming appointments section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-4 md:p-5 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upcoming Appointments
        </h3>
        
        {upcomingVisits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming appointments</p>
            <button className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Schedule Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingVisits.map((visit, index) => (
              <motion.div 
                key={visit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{visit.doctorName}</h4>
                    <p className="text-sm text-gray-500">{visit.specialization}</p>
                    <div className="mt-1 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{format(visit.date, 'MMMM d, yyyy')}</span>
                      <span className="mx-1">•</span>
                      <span>{format(visit.date, 'h:mm a')}</span>
                    </div>
                    {visit.location && (
                      <div className="mt-1 flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{visit.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusDetails(visit.status).bgColor} ${getStatusDetails(visit.status).textColor}`}>
                    {getStatusDetails(visit.status).text}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
            
            <div className="mt-4 text-center">
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                Schedule New Appointment
              </button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Past visits section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl p-4 md:p-5 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Recent Visits
        </h3>
        
        {pastVisits.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent visits</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastVisits.map((visit, index) => (
              <motion.div 
                key={visit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{visit.doctorName}</h4>
                        <p className="text-sm text-gray-500">{visit.specialization}</p>
                      </div>
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0">{format(visit.date, 'MMM d, yyyy')}</span>
                    </div>
                    <p className="mt-2 text-gray-700 text-sm">Reason: {visit.reason}</p>
                    {visit.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{visit.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 