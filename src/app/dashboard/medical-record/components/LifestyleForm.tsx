'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, FireIcon, MoonIcon, BeakerIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface LifestyleFormProps {
  initialData: any;
  onSave: (data: any) => void;
  isSaving: boolean;
}

// Define option types for better type safety
interface LifestyleOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function LifestyleForm({ initialData, onSave, isSaving }: LifestyleFormProps) {
  const [formData, setFormData] = useState({
    lifestyle: {
      smokingStatus: '',
      alcoholConsumption: '',
      exerciseFrequency: '',
      diet: '',
      sleepPattern: '',
    }
  });
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        lifestyle: {
          smokingStatus: initialData.lifestyle?.smokingStatus || '',
          alcoholConsumption: initialData.lifestyle?.alcoholConsumption || '',
          exerciseFrequency: initialData.lifestyle?.exerciseFrequency || '',
          diet: initialData.lifestyle?.diet || '',
          sleepPattern: initialData.lifestyle?.sleepPattern || '',
        }
      });
    }
  }, [initialData]);

  const handleOptionSelect = (field: string, value: string) => {
    setFormData({
      ...formData,
      lifestyle: {
        ...formData.lifestyle,
        [field]: value
      }
    });
    setFormTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialData,
      lifestyle: formData.lifestyle
    });
  };

  // Define options for each lifestyle category
  const smokingOptions: LifestyleOption[] = [
    { value: 'never', label: 'Never Smoked', color: 'bg-green-100 border-green-200 text-green-700' },
    { value: 'former', label: 'Former Smoker', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { value: 'occasional', label: 'Occasional', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { value: 'regular', label: 'Regular Smoker', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { value: 'heavy', label: 'Heavy Smoker', color: 'bg-red-100 border-red-200 text-red-700' },
  ];

  const alcoholOptions: LifestyleOption[] = [
    { value: 'none', label: 'None', color: 'bg-green-100 border-green-200 text-green-700' },
    { value: 'occasional', label: 'Occasional', description: 'Few times a month', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { value: 'moderate', label: 'Moderate', description: '1-2 drinks weekly', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { value: 'regular', label: 'Regular', description: '1-2 drinks daily', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { value: 'heavy', label: 'Heavy', description: '3+ drinks daily', color: 'bg-red-100 border-red-200 text-red-700' },
  ];

  const exerciseOptions: LifestyleOption[] = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise', color: 'bg-red-100 border-red-200 text-red-700' },
    { value: 'light', label: 'Light', description: '1-2 days per week', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { value: 'moderate', label: 'Moderate', description: '3-4 days per week', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { value: 'active', label: 'Active', description: '5+ days per week', color: 'bg-green-100 border-green-200 text-green-700' },
    { value: 'very-active', label: 'Very Active', description: 'Daily intense exercise', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
  ];

  const dietOptions: LifestyleOption[] = [
    { value: 'standard', label: 'Standard/Regular', color: 'bg-gray-100 border-gray-200 text-gray-700' },
    { value: 'vegetarian', label: 'Vegetarian', color: 'bg-green-100 border-green-200 text-green-700' },
    { value: 'vegan', label: 'Vegan', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
    { value: 'pescatarian', label: 'Pescatarian', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { value: 'keto', label: 'Ketogenic', color: 'bg-purple-100 border-purple-200 text-purple-700' },
    { value: 'paleo', label: 'Paleo', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { value: 'mediterranean', label: 'Mediterranean', color: 'bg-cyan-100 border-cyan-200 text-cyan-700' },
    { value: 'low-carb', label: 'Low-carb', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { value: 'gluten-free', label: 'Gluten-free', color: 'bg-red-100 border-red-200 text-red-700' },
    { value: 'dairy-free', label: 'Dairy-free', color: 'bg-pink-100 border-pink-200 text-pink-700' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 border-gray-200 text-gray-700' },
  ];

  const sleepOptions: LifestyleOption[] = [
    { value: 'less-than-6', label: 'Less than 6 hours', color: 'bg-red-100 border-red-200 text-red-700' },
    { value: '6-to-7', label: '6-7 hours', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { value: '7-to-8', label: '7-8 hours', color: 'bg-green-100 border-green-200 text-green-700' },
    { value: '8-to-9', label: '8-9 hours', color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { value: 'more-than-9', label: 'More than 9 hours', color: 'bg-purple-100 border-purple-200 text-purple-700' },
    { value: 'irregular', label: 'Irregular sleep pattern', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
    { value: 'insomnia', label: 'Insomnia', color: 'bg-red-100 border-red-200 text-red-700' },
    { value: 'sleep-apnea', label: 'Sleep apnea/disorder', color: 'bg-amber-100 border-amber-200 text-amber-700' },
  ];

  // Create a reusable selection card component
  const OptionCard = ({ option, selected, onClick }: { option: LifestyleOption, selected: boolean, onClick: () => void }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg p-4 ${option.color || 'bg-gray-100 border-gray-200'} border ${selected ? 'ring-2 ring-emerald-500 shadow-md' : ''} transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{option.label}</p>
          {option.description && <p className="text-xs opacity-70 mt-1">{option.description}</p>}
        </div>
        {selected && <CheckCircleIcon className="h-5 w-5 text-emerald-500 absolute top-2 right-2" />}
      </div>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Header with visual summary */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-emerald-100"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Lifestyle Profile</h2>
          <p className="text-sm text-gray-600">
            Your lifestyle choices significantly impact your health. Complete your profile to receive personalized health insights.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className={`rounded-lg p-3 ${formData.lifestyle.smokingStatus ? 'bg-white' : 'bg-gray-100'} border shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.lifestyle.smokingStatus ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <span className="text-xs text-center font-medium">Smoking</span>
            <span className="text-xs text-center text-gray-500 truncate w-full">
              {smokingOptions.find(opt => opt.value === formData.lifestyle.smokingStatus)?.label || 'Not set'}
            </span>
            </div>

          <div className={`rounded-lg p-3 ${formData.lifestyle.alcoholConsumption ? 'bg-white' : 'bg-gray-100'} border shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.lifestyle.alcoholConsumption ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-center font-medium">Alcohol</span>
            <span className="text-xs text-center text-gray-500 truncate w-full">
              {alcoholOptions.find(opt => opt.value === formData.lifestyle.alcoholConsumption)?.label || 'Not set'}
            </span>
            </div>

          <div className={`rounded-lg p-3 ${formData.lifestyle.exerciseFrequency ? 'bg-white' : 'bg-gray-100'} border shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.lifestyle.exerciseFrequency ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
              <FireIcon className="h-5 w-5" />
            </div>
            <span className="text-xs text-center font-medium">Exercise</span>
            <span className="text-xs text-center text-gray-500 truncate w-full">
              {exerciseOptions.find(opt => opt.value === formData.lifestyle.exerciseFrequency)?.label || 'Not set'}
            </span>
            </div>

          <div className={`rounded-lg p-3 ${formData.lifestyle.diet ? 'bg-white' : 'bg-gray-100'} border shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.lifestyle.diet ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
              <BeakerIcon className="h-5 w-5" />
            </div>
            <span className="text-xs text-center font-medium">Diet</span>
            <span className="text-xs text-center text-gray-500 truncate w-full">
              {dietOptions.find(opt => opt.value === formData.lifestyle.diet)?.label || 'Not set'}
            </span>
            </div>
            
          <div className={`rounded-lg p-3 ${formData.lifestyle.sleepPattern ? 'bg-white' : 'bg-gray-100'} border shadow-sm flex flex-col items-center justify-center gap-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.lifestyle.sleepPattern ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
              <MoonIcon className="h-5 w-5" />
            </div>
            <span className="text-xs text-center font-medium">Sleep</span>
            <span className="text-xs text-center text-gray-500 truncate w-full">
              {sleepOptions.find(opt => opt.value === formData.lifestyle.sleepPattern)?.label || 'Not set'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Smoking Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Smoking Status</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {smokingOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={formData.lifestyle.smokingStatus === option.value}
              onClick={() => handleOptionSelect('smokingStatus', option.value)}
            />
          ))}
        </div>
      </motion.section>

      {/* Alcohol Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Alcohol Consumption</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {alcoholOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={formData.lifestyle.alcoholConsumption === option.value}
              onClick={() => handleOptionSelect('alcoholConsumption', option.value)}
            />
          ))}
        </div>
      </motion.section>

      {/* Exercise Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-green-100">
            <FireIcon className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Exercise Frequency</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {exerciseOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={formData.lifestyle.exerciseFrequency === option.value}
              onClick={() => handleOptionSelect('exerciseFrequency', option.value)}
            />
          ))}
        </div>
      </motion.section>

      {/* Diet Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-emerald-100">
            <BeakerIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Diet Description</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {dietOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={formData.lifestyle.diet === option.value}
              onClick={() => handleOptionSelect('diet', option.value)}
            />
          ))}
        </div>
      </motion.section>

      {/* Sleep Section */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-100">
            <MoonIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sleep Pattern</h3>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sleepOptions.map((option) => (
            <OptionCard
              key={option.value}
              option={option}
              selected={formData.lifestyle.sleepPattern === option.value}
              onClick={() => handleOptionSelect('sleepPattern', option.value)}
            />
          ))}
        </div>
      </motion.section>
      
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
            'Save Lifestyle Information'
          )}
        </button>
      </div>
    </form>
  );
} 