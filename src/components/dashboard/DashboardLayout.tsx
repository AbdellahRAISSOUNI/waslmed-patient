'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  AcademicCapIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="w-5 h-5" />, current: pathname === '/dashboard' },
    { name: 'Medical Record', href: '/dashboard/medical-record', icon: <DocumentTextIcon className="w-5 h-5" />, current: pathname.startsWith('/dashboard/medical-record') },
    { name: 'Current Medications', href: '/dashboard/medications', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ), current: pathname.startsWith('/dashboard/medications') },
    { name: 'Lab Results', href: '/dashboard/lab-results', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ), current: pathname.startsWith('/dashboard/lab-results') },
    { name: 'Document Analysis', href: '/dashboard/documents', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ), current: pathname.startsWith('/dashboard/documents') },
    { name: 'QR Code', href: '/dashboard/qr-code', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
      </svg>
    ), current: pathname.startsWith('/dashboard/qr-code') },
    { name: 'Downloads', href: '/dashboard/downloads', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ), current: pathname.startsWith('/dashboard/downloads') },
    { name: 'Appointments', href: '/dashboard/appointments', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ), current: pathname.startsWith('/dashboard/appointments') },
    { name: 'Messaging', href: '/dashboard/messaging', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ), current: pathname.startsWith('/dashboard/messaging') },
    { name: 'AI Assistant', href: '/dashboard/ai', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, current: pathname.startsWith('/dashboard/ai') },
    { name: 'Health Education', href: '/dashboard/health-education', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ), current: pathname.startsWith('/dashboard/health-education') },
    { name: 'Doctors Directory', href: '/dashboard/doctors', icon: <UserGroupIcon className="w-5 h-5" />, current: pathname.startsWith('/dashboard/doctors') },
    { name: 'Settings', href: '/dashboard/settings', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ), current: pathname.startsWith('/dashboard/settings') }
  ];
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col relative">
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/40 -z-10"></div>
        <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] -z-10"></div>
        
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 -right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Dashboard header */}
        <header className="sticky top-0 glassmorphism shadow-sm z-20 w-full">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center"
              >
                <Link href="/" className="flex-shrink-0 flex items-center group">
                  <div className="relative h-8 w-32 flex items-center justify-center">
                    <Image 
                      src="/images/logo.png" 
                      alt="WaslMed Logo" 
                      width={100} 
                      height={32}
                      className="object-contain max-h-8"
                      priority
                    />
                  </div>
                </Link>
              </motion.div>
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-white/50 focus:outline-none transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
                  </svg>
                </button>
              </div>
              
              {/* User profile dropdown */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={mounted ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="hidden sm:flex sm:items-center"
              >
                <div className="ml-3 relative flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 bg-white/50 px-3 py-1 rounded-full">
                    {session?.user?.name}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Mobile menu */}
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden glassmorphism border-t border-white/20"
            >
              <div className="pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-700'
                        : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300 hover:text-gray-800'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center transition-colors duration-200`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-emerald-500">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                ))}
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Logged in as</div>
                  <div className="font-medium text-gray-800">{session?.user?.name}</div>
                  <div className="text-sm text-gray-500">{session?.user?.email}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </header>
        
        <div className="flex-grow flex">
          {/* Sidebar for desktop */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`hidden sm:flex sm:flex-col sm:fixed sm:inset-y-0 sm:pt-16 glassmorphism shadow-sm border-r border-white/30 z-10 transition-all duration-300 ease-in-out ${
              isCollapsed ? 'sm:w-20' : 'sm:w-64'
            }`}
          >
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-24 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-500 hover:text-emerald-500 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-grow flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-emerald-50/70 text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <span className={`${
                      item.current ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                    } flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Bottom sidebar content */}
            <div className={`p-4 border-t border-white/20 ${isCollapsed ? 'text-center' : ''}`}>
              <div className="bg-white/40 rounded-lg p-3">
                {!isCollapsed ? (
                  <>
                    <div className="text-xs text-gray-500">Logged in as</div>
                    <div className="font-medium text-gray-800 truncate">{session?.user?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
                  </>
                ) : (
                  <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Main content area */}
          <div className={`flex-1 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'sm:ml-20' : 'sm:ml-64'
          }`}>
            <main className="pb-10">
              <div className="py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
                <div className="glassmorphism overflow-hidden shadow-lg rounded-xl sm:rounded-2xl">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 relative">
                    <div className="absolute inset-0 bg-white/10"></div>
                    <h1 className="text-lg sm:text-xl font-bold text-white relative z-10">{title}</h1>
                  </div>
                  <div className="p-4 sm:p-6">
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 