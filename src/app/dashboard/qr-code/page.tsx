'use client';

import Link from 'next/link';
import { ArrowLeftIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import QRCodeGenerator from '@/components/dashboard/qr-code/QRCodeGenerator';
import { motion } from 'framer-motion';

export default function QRCodePage() {
  return (
    <DashboardLayout title="Your Medical Record QR Code">
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="mb-6 flex items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                <span>Back to Dashboard</span>
              </Link>
            </motion.div>
            
            <motion.div 
              className="ml-auto flex items-center text-sm text-gray-500"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <QrCodeIcon className="h-5 w-5 mr-2 text-emerald-500" />
              <span>Secure Health Access Technology</span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="px-4 py-6 sm:p-6"
          >
            <QRCodeGenerator />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            <p>
              © WaslMed {new Date().getFullYear()} • Your health information is protected with industry-leading security standards
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 