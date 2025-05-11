'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DocumentUploadProps {
  onUploadSuccess: (conversationId: string, documentInfo: any) => void;
  conversationId?: string;
}

export default function DocumentUpload({ onUploadSuccess, conversationId }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>('imaging');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Document types with icons and labels
  const documentTypes = [
    { value: 'medical_report', label: 'Medical Report', icon: '📄' },
    { value: 'lab_result', label: 'Lab Result', icon: '🧪' },
    { value: 'imaging', label: 'Medical Imaging', icon: '🔬' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'other', label: 'Other Document', icon: '📑' },
  ];

  // Generate file preview for images
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      
      // Automatically detect document type based on file
      if (selectedFile.type.startsWith('image/')) {
        setDocumentType('imaging');
      } else if (selectedFile.type === 'application/pdf') {
        setDocumentType('medical_report');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Automatically detect document type based on file
      if (droppedFile.type.startsWith('image/')) {
        setDocumentType('imaging');
      } else if (droppedFile.type === 'application/pdf') {
        setDocumentType('medical_report');
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setDocumentType('imaging');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('description', description);
    
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }
    
    try {
      const response = await fetch('/api/ai/document-analysis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      const data = await response.json();
      onUploadSuccess(data.conversationId, data.documentInfo);
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Medical Document</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Our AI can analyze the actual content of your medical documents and images. For the best results:
            </p>
            <ul className="list-disc ml-5 mt-1 text-sm text-blue-700">
              <li>Ensure your images are clear and well-lit</li>
              <li>For medical scans, make sure anatomical structures are clearly visible</li>
              <li>Add a brief description to provide additional context</li>
            </ul>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Document
          </label>
          <div 
            className={`relative border-2 ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-gray-300'} rounded-lg p-6 flex flex-col items-center`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {preview ? (
              <div className="mb-4 relative w-full max-w-xs h-48 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={preview}
                  alt="File preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            
            <span className="text-sm text-gray-500 mb-2">Drag and drop your file here or click to browse</span>
            <span className="text-xs text-gray-400 mb-4">Supported formats: JPEG, PNG, PDF, DOCX, TXT (Max 10MB)</span>
            
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.txt"
            />
            
            <button
              type="button"
              onClick={handleButtonClick}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Select File
            </button>
            
            {file && !preview && (
              <div className="mt-4 flex items-center w-full">
                <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-700 flex items-center flex-grow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate flex-grow">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {file.size < 1024
                      ? `${file.size} bytes`
                      : file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {documentTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setDocumentType(type.value)}
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer border transition-colors ${
                  documentType === type.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <span className={`text-xs font-medium text-center ${
                  documentType === type.value ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {type.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            rows={3}
            placeholder="Provide additional context for the AI analysis (e.g., 'Brain MRI scan for headache evaluation')"
            disabled={loading}
          ></textarea>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Document...
              </>
            ) : (
              'Upload & Analyze'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 