'use client';

import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-3"
    >
      <div className="flex items-start gap-2 max-w-[92%] sm:max-w-[85%] lg:max-w-[75%]">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center shadow-sm mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 bg-white border border-red-100 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
          <h4 className="text-red-600 font-medium text-sm mb-1.5">Error</h4>
          <p className="text-gray-700 text-sm mb-3">{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 