'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { DocumentDuplicateIcon, ArrowDownTrayIcon, ShareIcon, ShieldCheckIcon, DevicePhoneMobileIcon, CheckBadgeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedQRDisplay from './AdvancedQRDisplay';
import MobilePreview from './MobilePreview';

export default function QRCodeGenerator() {
  const { data: session } = useSession();
  const [medicalRecordId, setMedicalRecordId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [activeTip, setActiveTip] = useState<number | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    if (session?.user) {
      // Fetch the user's data including medical record ID
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          if (data.user?.medicalRecordId) {
            setMedicalRecordId(data.user.medicalRecordId);
          } else {
            // No medical record found
            setError('No medical record found. Please create your medical record first.');
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setError('Failed to load your medical record information. Please try again later.');
          setIsLoading(false);
        });
    }
  }, [session]);

  // Format the QR code value according to the scanner app requirements
  const getMedicalRecordUrl = () => {
    if (!medicalRecordId) return '';
    return `waslmed://medical-record/${medicalRecordId}`;
  };

  const handleCopyUrl = () => {
    if (!medicalRecordId) return;
    
    const url = getMedicalRecordUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!medicalRecordId || !navigator.share) {
      setShowShareOptions(!showShareOptions);
      return;
    }
    
    try {
      await navigator.share({
        title: 'WaslMed Medical Record',
        text: 'Access my medical record with this secure link:',
        url: getMedicalRecordUrl(),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    if (!qrCodeRef.current || !medicalRecordId) return;
    
    // Create a canvas element from the QR code
    const canvas = document.createElement('canvas');
    const svg = qrCodeRef.current.querySelector('svg');
    
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background and the image
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'waslmed-medical-record-qrcode.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Check if the medical record ID is valid (24-character hex string)
  const isValidObjectId = (id: string) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(16, 185, 129, 0)",
        "0 0 0 10px rgba(16, 185, 129, 0.2)",
        "0 0 0 0 rgba(16, 185, 129, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-64 w-64 bg-emerald-100 rounded-lg"></div>
            <div className="h-4 w-48 bg-emerald-100 rounded"></div>
            <div className="h-4 w-64 bg-emerald-100 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-8 rounded-xl text-center shadow-lg"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 border border-red-100 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Medical Record Not Found</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
          <Link 
            href="/dashboard/medical-record" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:-translate-y-1"
          >
            Create Medical Record
          </Link>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {!isValidObjectId(medicalRecordId) ? (
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Invalid medical record ID format. Please contact support.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div 
                variants={itemVariants}
                className="relative bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 rounded-3xl p-8 shadow-xl border border-emerald-100 overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                  <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-emerald-400"></div>
                  <div className="absolute right-0 bottom-0 w-60 h-60 rounded-full bg-blue-400"></div>
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                  <motion.div 
                    className="flex-1 flex flex-col items-center space-y-6"
                    variants={itemVariants}
                  >
                    <div className="text-center mb-1">
                      <motion.h2 
                        className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        Your Digital Health Pass
                      </motion.h2>
                      <motion.p 
                        className="text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        Quick access to your complete medical profile
                      </motion.p>
                    </div>
                    
                    {/* QR Code with glow effect */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                      className="relative rounded-2xl shadow-xl"
                      style={{ maxWidth: 300, margin: "0 auto" }}
                    >
                      <AdvancedQRDisplay 
                        value={getMedicalRecordUrl()}
                        qrRef={qrCodeRef}
                      />
                    </motion.div>
                    
                    {/* Buttons directly under QR code */}
                    <div className="flex gap-2 w-full justify-center mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyUrl}
                        className="flex-1 max-w-[160px] inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                      >
                        <DocumentDuplicateIcon className="mr-2 h-5 w-5 text-gray-500" />
                        {copied ? 'Copied!' : 'Copy ID'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="flex-1 max-w-[160px] inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                      >
                        <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                        Download
                      </motion.button>
                    </div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className="flex flex-col items-center text-center mt-4"
                    >
                      <div className="w-36 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-4"></div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        Medical Record ID: 
                        <span className="font-mono ml-1 text-cyan-700 font-medium">{medicalRecordId}</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                      QR Code Format: 
                      <span className="font-mono ml-1">waslmed://medical-record/{medicalRecordId}</span>
                    </div>
                    </motion.div>
                  </motion.div>
                
                  <motion.div 
                    className="flex-1 space-y-6"
                    variants={itemVariants}
                  >
                  <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Healthcare Access</h3>
                    <p className="text-gray-600">
                        This QR code enables healthcare providers to securely access your medical information through the WaslMed Scanner app, ensuring your data is available when it matters most.
                    </p>
                  </div>
                  
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-md border border-emerald-100">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-emerald-500 mr-2" />
                        How it works:
                      </h4>
                      
                      <ul className="space-y-3">
                        {[
                          {
                            title: "Present your QR code",
                            description: "Show this QR code to your healthcare provider during your visit"
                          },
                          {
                            title: "Instant secure scanning",
                            description: "They'll scan it with the WaslMed app to securely identify you"
                          },
                          {
                            title: "Immediate access",
                            description: "Your complete medical history becomes instantly available"
                          }
                        ].map((tip, index) => (
                          <motion.li 
                            key={index}
                            whileHover={{ x: 5 }}
                            className="relative"
                            onMouseEnter={() => setActiveTip(index)}
                            onMouseLeave={() => setActiveTip(null)}
                          >
                            <div className={`flex p-3 rounded-lg transition-all duration-200 ${activeTip === index ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 shadow-sm' : ''}`}>
                              <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 flex-shrink-0 ${activeTip === index ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-800">{tip.title}</p>
                                <p className="text-sm text-gray-600">{tip.description}</p>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                    </ul>
                  </div>
                    
                    
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-12 pb-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 inline-flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-emerald-500" />
                    How It Looks In Action
                  </h3>
                  <p className="text-gray-600 mt-1">
                    When a healthcare provider scans your QR code with the WaslMed app
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="order-2 md:order-1">
                    <MobilePreview qrValue={getMedicalRecordUrl()} />
                  </div>
                  
                  <div className="max-w-md space-y-4 order-1 md:order-2">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="bg-white rounded-xl p-4 shadow-md border border-emerald-100"
                    >
                      <h4 className="font-medium text-emerald-800 flex items-center mb-2">
                        <span className="flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold items-center justify-center mr-2">1</span>
                        Healthcare Provider Scans Your Code
                      </h4>
                      <p className="text-sm text-gray-600">
                        The doctor or healthcare provider uses the WaslMed Scanner app to scan your QR code during your appointment.
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="bg-white rounded-xl p-4 shadow-md border border-emerald-100"
                    >
                      <h4 className="font-medium text-emerald-800 flex items-center mb-2">
                        <span className="flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold items-center justify-center mr-2">2</span>
                        Secure Authentication Happens
                      </h4>
                      <p className="text-sm text-gray-600">
                        The app securely authenticates the provider's credentials and verifies permission to access your records.
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="bg-white rounded-xl p-4 shadow-md border border-emerald-100"
                    >
                      <h4 className="font-medium text-emerald-800 flex items-center mb-2">
                        <span className="flex h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold items-center justify-center mr-2">3</span>
                        Your Medical Records Are Accessible
                      </h4>
                      <p className="text-sm text-gray-600">
                        The provider can now view your medical history, current medications, allergies, and other vital information.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
          
          <motion.div 
            variants={itemVariants}
            className="overflow-hidden rounded-xl"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md border border-blue-100">
              <div className="flex flex-col md:flex-row items-start">
                <div className="flex-shrink-0 rounded-full bg-blue-50 p-1.5 border border-blue-200 mb-3 md:mb-0">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="md:ml-4">
                  <h3 className="text-sm font-medium text-blue-800">Privacy Protection</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your QR code contains a secure, encrypted link to your medical record that can only be accessed by authorized healthcare providers using the WaslMed Scanner app. Your privacy and data security are our top priorities.
                    </p>
                    <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100 text-blue-800 text-xs">
                      <p className="font-medium mb-1">Important:</p>
                      <p>Always verify the identity of healthcare providers before sharing your medical information. This QR code should only be shared with trusted medical professionals.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        
        </motion.div>
      )}
    </div>
  );
} 