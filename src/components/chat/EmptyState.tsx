'use client';

import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="bg-emerald-50 rounded-full p-5 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Your Messages
      </h2>
      
      <p className="text-gray-600 max-w-md mb-6">
        Connect with your healthcare providers through secure messaging. Select a conversation from the sidebar or start a new one.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="ml-3 font-medium text-gray-800">Secure Communication</h3>
          </div>
          <p className="text-sm text-gray-600">
            All messages are encrypted and comply with healthcare privacy standards.
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="ml-3 font-medium text-gray-800">Quick Responses</h3>
          </div>
          <p className="text-sm text-gray-600">
            Get timely responses from your healthcare providers without scheduling an appointment.
          </p>
        </div>
      </div>
    </motion.div>
  );
} 