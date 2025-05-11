'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative auth-page-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Larger, softer blobs */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
        
        {/* Small floating dots */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute rounded-full bg-emerald-500"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.15 + 0.05,
              }}
              animate={{
                y: [0, Math.random() * 30 - 15],
                opacity: [Math.random() * 0.15 + 0.05, Math.random() * 0.2 + 0.1, Math.random() * 0.15 + 0.05],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Logo and navigation at the top */}
      <div className="pt-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center group">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:from-emerald-600 group-hover:to-cyan-600 transition-all duration-300">
              WaslMed
            </span>
          </Link>
          
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-emerald-600 flex items-center transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-grow flex px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-7xl mx-auto w-full flex">
          {/* Left side - illustration for desktop */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex lg:w-1/2 items-center justify-center pr-12"
          >
            <div className="relative w-full max-w-md">
              {/* SVG Illustration or placeholder - replace this with an actual health-related illustration */}
              <div className="relative aspect-square w-full max-w-md bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl overflow-hidden border border-emerald-100 shadow-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-emerald-300 opacity-30">
                    {/* Illustration space - You could replace this with an actual Image component */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-5 left-5 w-24 h-24 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
                <div className="absolute bottom-5 right-5 w-32 h-32 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
              </div>
              
              {/* Floating badges */}
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-8 -left-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-emerald-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Secure Login</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: [5, -5, 5] }}
                transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
                className="absolute -bottom-4 right-10 bg-white px-4 py-2 rounded-lg shadow-lg border border-blue-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">24/7 Support</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Right side - form card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="w-full lg:w-1/2 flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              {/* Card container with glassmorphism effect */}
              <div className="auth-card p-8 sm:p-10">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
                
                {/* Content */}
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">{title}</h2>
                    {subtitle && (
                      <p className="mt-3 text-center text-sm text-gray-600">
                        {subtitle}
                      </p>
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6"
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 