'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DocumentTextIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import HealthMetrics from './HealthMetrics';
import RecentVisits from './RecentVisits';
import MedicationTracker from './MedicationTracker';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    
    // Fetch real stats from our API endpoint
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Combine mock data with real data from API
  const quickStats = [
    {
      id: 1,
      label: 'Appointments',
      value: stats?.upcomingAppointments || '3',
      unit: 'upcoming',
      bgGradient: 'from-blue-500/20 to-blue-600/30',
      iconGradient: 'from-blue-500 to-blue-600',
      iconBoxShadow: 'shadow-blue-500/40',
      textColor: 'text-blue-800',
      valueColor: 'text-blue-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 2,
      label: 'Prescriptions',
      value: stats?.activeMedications || '5',
      unit: 'active',
      bgGradient: 'from-purple-500/20 to-purple-600/30',
      iconGradient: 'from-purple-500 to-purple-600',
      iconBoxShadow: 'shadow-purple-500/40',
      textColor: 'text-purple-800',
      valueColor: 'text-purple-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 3,
      label: 'Checkups',
      value: stats?.pastYearLabTests || '8',
      unit: 'this year',
      bgGradient: 'from-emerald-500/20 to-emerald-600/30',
      iconGradient: 'from-emerald-500 to-emerald-600',
      iconBoxShadow: 'shadow-emerald-500/40',
      textColor: 'text-emerald-800',
      valueColor: 'text-emerald-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 4,
      label: 'Streak',
      value: stats?.streak || '15',
      unit: 'days',
      bgGradient: 'from-amber-500/20 to-amber-600/30',
      iconGradient: 'from-amber-500 to-amber-600',
      iconBoxShadow: 'shadow-amber-500/40',
      textColor: 'text-amber-800',
      valueColor: 'text-amber-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      id: 5,
      label: 'BMI',
      value: stats?.bmi || '23.4',
      unit: 'kg/m²',
      bgGradient: 'from-red-500/20 to-red-600/30',
      iconGradient: 'from-red-500 to-red-600',
      iconBoxShadow: 'shadow-red-500/40',
      textColor: 'text-red-800',
      valueColor: 'text-red-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    {
      id: 6,
      label: 'Health Score',
      value: stats?.healthScore || '85',
      unit: '/100',
      bgGradient: 'from-blue-500/20 to-indigo-600/30',
      iconGradient: 'from-blue-500 to-indigo-600',
      iconBoxShadow: 'shadow-blue-500/40',
      textColor: 'text-blue-800',
      valueColor: 'text-blue-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 7,
      label: 'Adherence',
      value: stats?.medicationAdherence || '92',
      unit: '%',
      bgGradient: 'from-teal-500/20 to-teal-600/30',
      iconGradient: 'from-teal-500 to-teal-600',
      iconBoxShadow: 'shadow-teal-500/40',
      textColor: 'text-teal-800',
      valueColor: 'text-teal-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 8,
      label: 'Connected Doctors',
      value: stats?.connectedDoctors || '3',
      unit: 'total',
      bgGradient: 'from-pink-500/20 to-pink-600/30',
      iconGradient: 'from-pink-500 to-pink-600',
      iconBoxShadow: 'shadow-pink-500/40',
      textColor: 'text-pink-800',
      valueColor: 'text-pink-700',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 mb-4">
          Welcome, {session?.user?.name || 'User'}!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You have successfully logged in to your WaslMed account. Manage your health information securely from this dashboard.
        </p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Content when loaded */}
      {!loading && (
        <div className="space-y-12">
          {/* Quick Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md shadow-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Quick Stats</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  variants={item}
                  initial="hidden"
                  animate={mounted ? "show" : "hidden"}
                  transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className={`relative overflow-hidden rounded-xl backdrop-blur-md p-4 md:p-5 border border-white/20 shadow-md transition-all duration-300
                    bg-gradient-to-br ${stat.bgGradient} group`}
                >
                  {/* Animated background blobs */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full transform rotate-12 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full transform -rotate-12 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <div className="flex items-end gap-1">
                        <span className={`text-2xl md:text-3xl font-bold ${stat.valueColor}`}>{stat.value}</span>
                        <span className={`text-xs md:text-sm font-medium mb-1 ${stat.textColor} opacity-80`}>{stat.unit}</span>
                      </div>
                      <span className={`text-xs md:text-sm font-medium ${stat.textColor}`}>{stat.label}</span>
                    </div>
                    
                    <div className={`relative p-2 md:p-3 rounded-full shadow-lg ${stat.iconBoxShadow} overflow-hidden 
                      bg-gradient-to-br ${stat.iconGradient} transform group-hover:scale-110 transition-all duration-300`}>
                      <div className="relative z-10">
                        {stat.icon}
                      </div>
                      <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  
                  {/* Animated border gradient on hover */}
                  <div className="absolute inset-0 border-2 border-transparent opacity-0 group-hover:opacity-100 rounded-xl bg-gradient-to-r from-white/20 to-white/5 transition-all duration-500 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Main action cards */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <motion.div variants={item}>
              <Link 
                href="/dashboard/medical-record"
                className="group block h-full"
              >
                <div className="h-full glassmorphism rounded-xl border border-emerald-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10"></div>
                    <div className="rounded-full bg-white/20 p-4 relative z-10">
                      <DocumentTextIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">Medical Records</h3>
                    <p className="text-gray-600">View and manage your complete medical profile including history, medications, allergies, and more.</p>
                    
                    <div className="mt-6 flex items-center text-emerald-600 font-medium">
                      <span>View & Update</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            <motion.div variants={item}>
              <Link 
                href="/dashboard/qr-code"
                className="group block h-full"
              >
                <div className="h-full glassmorphism rounded-xl border border-cyan-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-24 bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10"></div>
                    <div className="rounded-full bg-white/20 p-4 relative z-10">
                      <QrCodeIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">QR Code</h3>
                    <p className="text-gray-600">Generate a secure QR code that healthcare providers can scan to access your medical information instantly.</p>
                    
                    <div className="mt-6 flex items-center text-cyan-600 font-medium">
                      <span>Generate QR Code</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Health components */}
          <div className="grid grid-cols-1 gap-12">
            {/* Medication Tracker Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md shadow-purple-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Medication Tracker</h3>
              </div>
              
              <MedicationTracker />
            </motion.div>
            
            {/* Health Metrics Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Health Metrics</h3>
              </div>
              
              <HealthMetrics />
            </motion.div>
            
            {/* Recent Visits Component */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Appointments & Visits</h3>
              </div>
              
              <RecentVisits />
            </motion.div>
          </div>
          
          {/* Status message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glassmorphism rounded-xl p-4 md:p-6 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-2 bg-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Your account is secure and active</p>
                  <p className="text-sm text-gray-600">All your medical information is encrypted and protected</p>
                </div>
              </div>
              
              <div>
                <button className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 