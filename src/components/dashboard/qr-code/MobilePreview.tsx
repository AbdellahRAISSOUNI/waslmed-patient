'use client';

import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';

interface MobilePreviewProps {
  qrValue: string;
}

export default function MobilePreview({ qrValue }: MobilePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto"
    >
      {/* Phone frame */}
      <div className="relative w-[260px] h-[530px] rounded-[36px] bg-gradient-to-b from-gray-800 to-gray-900 p-[10px] shadow-xl overflow-hidden">
        {/* Camera notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-b-2xl z-10 flex justify-center items-end pb-1">
          <div className="w-3 h-3 rounded-full bg-gray-700"></div>
        </div>
        
        {/* Power button */}
        <div className="absolute top-[100px] right-[-10px] w-[4px] h-[40px] bg-gray-700 rounded-l-sm"></div>
        
        {/* Volume buttons */}
        <div className="absolute top-[80px] left-[-10px] w-[4px] h-[30px] bg-gray-700 rounded-r-sm"></div>
        <div className="absolute top-[120px] left-[-10px] w-[4px] h-[30px] bg-gray-700 rounded-r-sm"></div>
        
        {/* Screen */}
        <div className="w-full h-full rounded-[28px] bg-white overflow-hidden relative">
          {/* App interface */}
          <div className="h-full flex flex-col">
            {/* Status bar */}
            <div className="bg-emerald-600 text-white p-4 pt-7 shadow-md">
              <div className="flex justify-between items-center">
                <div className="text-xs">9:41 AM</div>
                <div className="flex space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17h4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12a1 1 0 110-2 1 1 0 010 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <h1 className="text-base font-bold">WaslMed Scanner</h1>
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Scanner view */}
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 relative">
              {/* Scanner animation overlay */}
              <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                <div className="w-[180px] h-[180px] border-2 border-white rounded-lg relative">
                  {/* Scanner animation */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [0, 170, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 w-full h-1 bg-emerald-400"
                  />
                  
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                </div>
              </div>
              
              {/* App UI */}
              <div className="z-10 text-center px-6 absolute bottom-4">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-full p-3 inline-block shadow-lg mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.div>
                <p className="text-white text-xs font-medium drop-shadow-md">
                  Position QR code in frame to scan
                </p>
              </div>
            </div>
            
            {/* Navigation bar */}
            <div className="bg-white py-3 px-4 border-t border-gray-200 flex justify-between">
              <button className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                </svg>
                <span className="text-xs text-gray-600">Home</span>
              </button>
              
              <button className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-xs text-gray-600">Records</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Scan</span>
              </button>
              
              <button className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-500">Patients</span>
              </button>
              
              <button className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-500">Settings</span>
              </button>
            </div>
          </div>
          
          {/* Position our actual QR Code as if it's being scanned */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-xl rotate-1"
            initial={{ opacity: 0, scale: 0.5, y: 200 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, type: "spring" }}
          >
            <QRCode
              value={qrValue}
              size={140}
              bgColor="#FFFFFF"
              fgColor="#10B981"
              level="H"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 rounded-[36px] pointer-events-none"></div>
    </motion.div>
  );
} 