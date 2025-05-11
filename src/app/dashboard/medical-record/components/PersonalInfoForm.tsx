'use client';

import { useState, useEffect } from 'react';
import { UserCircleIcon, UserIcon, PhoneIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function PersonalInfoForm({ initialData, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    profileImage: '',
    personalInfo: {
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      height: '',
      weight: '',
      maritalStatus: '',
      occupation: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      }
    }
  });
  const [imagePreview, setImagePreview] = useState('');
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const data = {
        profileImage: initialData.profileImage || '',
        personalInfo: {
          dateOfBirth: initialData.personalInfo?.dateOfBirth 
            ? new Date(initialData.personalInfo.dateOfBirth).toISOString().split('T')[0] 
            : '',
          gender: initialData.personalInfo?.gender || '',
          bloodType: initialData.personalInfo?.bloodType || '',
          height: initialData.personalInfo?.height || '',
          weight: initialData.personalInfo?.weight || '',
          maritalStatus: initialData.personalInfo?.maritalStatus || '',
          occupation: initialData.personalInfo?.occupation || '',
          emergencyContact: {
            name: initialData.personalInfo?.emergencyContact?.name || '',
            relationship: initialData.personalInfo?.emergencyContact?.relationship || '',
            phone: initialData.personalInfo?.emergencyContact?.phone || '',
          }
        }
      };
      setFormData(data);
      
      if (initialData.profileImage) {
        setImagePreview(initialData.profileImage);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormTouched(true);
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else if (name.includes('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        personalInfo: {
          ...formData.personalInfo,
          emergencyContact: {
            ...formData.personalInfo.emergencyContact,
            [field]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
        setImagePreview(reader.result);
        setFormTouched(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...initialData,
      profileImage: formData.profileImage,
      personalInfo: formData.personalInfo
    });
  };

  // Calculate BMI if both height and weight are available
  const calculateBMI = () => {
    const height = parseFloat(formData.personalInfo.height);
    const weight = parseFloat(formData.personalInfo.weight);
    
    if (height && weight && height > 0) {
      // BMI = weight(kg) / (height(m))^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };
  
  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    
    const numBMI = parseFloat(bmi);
    if (numBMI < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (numBMI < 25) return { label: 'Normal weight', color: 'text-green-600' };
    if (numBMI < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obesity', color: 'text-red-600' };
  };
  
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!formData.personalInfo.dateOfBirth) return null;
    
    const birthDate = new Date(formData.personalInfo.dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const age = calculateAge();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile section with photo and key metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-emerald-100"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile photo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-300" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-emerald-600 transition-colors">
                <input 
                  type="file" 
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
            </div>
            <span className="text-sm text-gray-500">Profile Photo</span>
          </div>
          
          {/* Quick stats */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Personal Health Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Age card */}
              {age !== null && (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{age}</div>
                      <div className="text-xs text-gray-500">Years old</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Height card */}
              {formData.personalInfo.height && (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{formData.personalInfo.height}</div>
                      <div className="text-xs text-gray-500">cm</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Weight card */}
              {formData.personalInfo.weight && (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{formData.personalInfo.weight}</div>
                      <div className="text-xs text-gray-500">kg</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* BMI card */}
              {bmi && (
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${bmiCategory ? (bmiCategory.color.replace('text-', 'bg-').replace('-600', '-100')) : 'bg-gray-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${bmiCategory ? bmiCategory.color : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{bmi}</div>
                      <div className="text-xs text-gray-500">BMI {bmiCategory?.label}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Personal Information Fields */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <IdentificationIcon className="h-5 w-5 mr-2 text-emerald-500" />
          Basic Information
        </h3>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="personalInfo.dateOfBirth"
                id="dateOfBirth"
                value={formData.personalInfo.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                name="personalInfo.gender"
                value={formData.personalInfo.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <select
                id="bloodType"
                name="personalInfo.bloodType"
                value={formData.personalInfo.bloodType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="personalInfo.height"
                id="height"
                value={formData.personalInfo.height}
                onChange={handleChange}
                placeholder="Height in centimeters"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="personalInfo.weight"
                id="weight"
                value={formData.personalInfo.weight}
                onChange={handleChange}
                placeholder="Weight in kilograms"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="personalInfo.maritalStatus"
                value={formData.personalInfo.maritalStatus}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="">Select marital status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                name="personalInfo.occupation"
                id="occupation"
                value={formData.personalInfo.occupation}
                onChange={handleChange}
                placeholder="Your current occupation"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Emergency Contact Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <PhoneIcon className="h-5 w-5 mr-2 text-emerald-500" />
          Emergency Contact
        </h3>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div>
              <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                id="emergencyName"
                value={formData.personalInfo.emergencyContact.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Full name of emergency contact"
              />
            </div>
            
            <div>
              <label htmlFor="emergencyRelationship" className="block text-sm font-medium text-gray-700">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                id="emergencyRelationship"
                value={formData.personalInfo.emergencyContact.relationship}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
            
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="emergencyContact.phone"
                id="emergencyPhone"
                value={formData.personalInfo.emergencyContact.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Emergency contact phone number"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end pt-5">
        <button
          type="submit"
          disabled={isSaving || !formTouched}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
            !formTouched
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Information'
          )}
        </button>
      </div>
    </form>
  );
} 