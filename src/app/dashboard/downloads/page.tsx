'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import QRCode from 'react-qr-code';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Image from 'next/image';

export default function DownloadsPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.success) {
          setUserData(data.user);
          
          // If user has a medical record, fetch it
          if (data.user.medicalRecordId) {
            const medicalRecordResponse = await fetch(`/api/medical-record/${data.user.medicalRecordId}`);
            const medicalRecordData = await medicalRecordResponse.json();
            
            if (medicalRecordData.success) {
              setMedicalRecord(medicalRecordData.medicalRecord);
            } else {
              setError('Failed to load medical record');
            }
          }
        } else {
          setError('Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  // Format the QR code value according to the scanner app requirements
  const getMedicalRecordUrl = () => {
    if (!userData?.medicalRecordId) return '';
    return `waslmed://medical-record/${userData.medicalRecordId}`;
  };

  // Function to calculate BMI if height and weight are available
  const calculateBMI = () => {
    if (!medicalRecord?.personalInfo?.height || !medicalRecord?.personalInfo?.weight) return 'N/A';
    
    // Height in meters, weight in kg
    const heightInM = medicalRecord.personalInfo.height / 100;
    const bmi = medicalRecord.personalInfo.weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date = new Date()) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Generate PDF filename based on user data
  const generatePdfFilename = () => {
    const userName = userData?.name?.replace(/\s+/g, '-') || 'Patient';
    const date = formatDate();
    return `WaslMed-${userName}-${date}.pdf`;
  };

  // Create a simplified clone of the content for html2canvas to avoid unsupported CSS
  const prepareContentForPDF = (sourceElement: HTMLElement): HTMLElement => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = sourceElement.offsetWidth + 'px';
    tempContainer.style.backgroundColor = 'white';
    
    // Clone the source element
    const clone = sourceElement.cloneNode(true) as HTMLElement;
    
    // Add a simple stylesheet to override problematic CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      * {
        font-family: Arial, sans-serif !important;
        background: none !important;
        background-color: white !important;
        background-image: none !important;
        border-color: #ddd !important;
        box-shadow: none !important;
        color: black !important;
      }
      
      .glassmorphism {
        background-color: white !important;
        backdrop-filter: none !important;
        border: 1px solid #ddd !important;
        border-radius: 0.75rem !important;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: #111 !important;
        border-color: #ddd !important;
      }
      
      p, span, div {
        color: #333 !important;
      }
    `;
    
    tempContainer.appendChild(styleTag);
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    return tempContainer;
  };

  // Create a downloadable PDF using jsPDF and html2canvas
  const handleDownloadPDF = async () => {
    if (!userData || !medicalRecord || !pdfContentRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Hide download button during capture
      const downloadBtn = document.getElementById('download-btn-container');
      if (downloadBtn) downloadBtn.style.display = 'none';
      
      // Create a simplified clone of the content for capturing
      const content = pdfContentRef.current;
      const preparedContent = prepareContentForPDF(content);
      
      // Capture the content
      const canvas = await html2canvas(preparedContent, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow loading cross-origin images
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: true // Remove the temporary container after capture
      });
      
      // Clean up the temporary element
      if (preparedContent.parentNode) {
        preparedContent.parentNode.removeChild(preparedContent);
      }
      
      // Create PDF (A4 size in mm: 210×297)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate the ratio to fit the image to PDF width
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content overflows a page, add more pages
      if (imgHeight > 297) {
        let heightLeft = imgHeight - 297;
        let position = -297;
        
        while (heightLeft > 0) {
          position = position - 297;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      }
      
      // Save the PDF
      pdf.save(generatePdfFilename());
      
      // Show download button again
      if (downloadBtn) downloadBtn.style.display = 'flex';
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DashboardLayout title="Downloads">
      <div className="max-w-4xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-64 w-full bg-emerald-100 rounded-lg"></div>
              <div className="h-4 w-48 bg-emerald-100 rounded"></div>
              <div className="h-4 w-64 bg-emerald-100 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="glassmorphism border border-red-200 p-8 rounded-xl text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Data Not Found</h3>
            <p className="text-red-600 mb-4">{error}</p>
          </motion.div>
        ) : (
          <>
            <div id="download-btn-container" className="flex flex-col items-center space-y-4 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Medical Record Download</h2>
              <p className="text-gray-600 text-center max-w-lg">
                Download your complete medical record as a PDF document. This PDF includes your personal information, medical history, and a QR code for quick access.
              </p>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
            
            {/* PDF Preview Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="glassmorphism border border-emerald-100 rounded-xl overflow-hidden"
              ref={pdfContentRef}
            >
              <div className="bg-white p-8">
                {/* Header with Patient Name and QR Code */}
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    {medicalRecord?.profileImage ? (
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <Image 
                          src={medicalRecord.profileImage} 
                          alt={userData?.name || 'Patient'} 
                          width={64} 
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{userData?.name || 'Patient Name'}</h1>
                      <p className="text-gray-500">{userData?.email || 'patient@example.com'}</p>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <QRCode
                      value={getMedicalRecordUrl()}
                      size={80}
                      bgColor="#FFFFFF"
                      fgColor="#10B981"
                      level="H"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>
                
                {/* Document Title and Date */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Medical Record Summary</h2>
                  <p className="text-gray-500">Generated on {formatDate()}</p>
                </div>
                
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">DEMOGRAPHICS</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Patient ID:</p>
                        <p className="text-sm text-gray-800">
                          {userData?.medicalRecordId?.substring(0, 6) || '123456'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Date of Birth:</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.personalInfo?.dateOfBirth ? 
                            new Date(medicalRecord.personalInfo.dateOfBirth).toLocaleDateString() : 
                            'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Gender:</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.personalInfo?.gender || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Blood Type:</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.personalInfo?.bloodType || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Health Overview Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">HEALTH OVERVIEW</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Weight:</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.personalInfo?.weight ? 
                            `${medicalRecord.personalInfo.weight} kg` : 
                            'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Height:</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.personalInfo?.height ? 
                            `${medicalRecord.personalInfo.height} cm` : 
                            'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">BMI:</p>
                        <p className="text-sm text-gray-800">{calculateBMI()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conditions Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">CONDITIONS</h2>
                    {medicalRecord?.conditions?.length > 0 ? (
                      <ul className="space-y-1">
                        {medicalRecord.conditions.map((condition: any, index: number) => (
                          <li key={index} className="text-sm text-gray-800">
                            {condition.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No conditions recorded</p>
                    )}
                  </div>
                  
                  {/* Allergies Section */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">ALLERGIES</h2>
                    {medicalRecord?.allergies?.length > 0 ? (
                      <ul className="space-y-1">
                        {medicalRecord.allergies.map((allergy: any, index: number) => (
                          <li key={index} className="text-sm text-gray-800">
                            {allergy.allergen}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No allergies recorded</p>
                    )}
                  </div>
                  
                  {/* Medications Section */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">MEDICATIONS</h2>
                    {medicalRecord?.medications?.length > 0 ? (
                      <ul className="space-y-3">
                        {medicalRecord.medications.map((medication: any, index: number) => (
                          <li key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">{medication.name}</span> {medication.dosage}
                            </div>
                            <div className="text-gray-600">{medication.frequency}</div>
                            <div className="text-gray-600">
                              {medication.startDate ? new Date(medication.startDate).toLocaleDateString() : ''}
                              {medication.endDate ? ` - ${new Date(medication.endDate).toLocaleDateString()}` : ''}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No medications recorded</p>
                    )}
                  </div>
                  
                  {/* Lab Results Section */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">LAB RESULTS</h2>
                    {medicalRecord?.labTests?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                        {medicalRecord.labTests.map((test: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <p className="text-sm font-semibold text-gray-700">{test.testName}</p>
                            <p className="text-sm text-gray-800">{test.result}</p>
                            <p className="text-xs text-gray-500">Normal: {test.normalRange}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No lab results recorded</p>
                    )}
                  </div>
                  
                  {/* Vital Signs Section */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">VITAL SIGNS</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">Blood Pressure</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.visits?.length > 0 && medicalRecord.visits[0].bloodPressure ? 
                            medicalRecord.visits[0].bloodPressure : 
                            'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">Heart Rate</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.visits?.length > 0 && medicalRecord.visits[0].heartRate ? 
                            `${medicalRecord.visits[0].heartRate} bpm` : 
                            'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-700">Respiratory Rate</p>
                        <p className="text-sm text-gray-800">
                          {medicalRecord?.visits?.length > 0 && medicalRecord.visits[0].respiratoryRate ? 
                            `${medicalRecord.visits[0].respiratoryRate} /min` : 
                            'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointments Section */}
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">APPOINTMENTS</h2>
                    {medicalRecord?.visits?.length > 0 ? (
                      <ul className="space-y-2">
                        {medicalRecord.visits.map((visit: any, index: number) => (
                          <li key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="font-medium">
                              {visit.date ? new Date(visit.date).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-gray-700">{visit.provider || 'N/A'}</div>
                            <div className="text-gray-600">{visit.reason || 'N/A'}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No appointments recorded</p>
                    )}
                  </div>
                </div>
                
                {/* Footer with QR Code Instructions */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1">Scan the QR code to access this medical record with the WaslMed app.</p>
                      <p>Record ID: {userData?.medicalRecordId || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">WaslMed Healthcare Platform</p>
                      <p className="text-xs">Generated on {formatDate()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 