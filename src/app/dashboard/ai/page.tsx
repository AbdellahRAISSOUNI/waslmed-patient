'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import GeneralConversation from '@/components/ai/GeneralConversation';
import HealthRecommendations from '@/components/ai/HealthRecommendations';
import SymptomChecker from '@/components/ai/SymptomChecker';
import RiskAssessment from '@/components/ai/RiskAssessment';
import EarlyWarning from '@/components/ai/EarlyWarning';

// Tab types
type TabType = 'general' | 'health-recommendations' | 'symptom-check' | 'risk-assessment' | 'early-warning';

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Tab configuration with icons and descriptions
  const tabs = [
    {
      id: 'general' as TabType,
      label: 'General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      ),
      description: 'Chat with our AI assistant about general health questions'
    },
    {
      id: 'health-recommendations' as TabType,
      label: 'Recommendations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
        </svg>
      ),
      description: 'Get personalized health recommendations based on your medical profile'
    },
    {
      id: 'symptom-check' as TabType,
      label: 'Symptom Checker',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
      description: 'Check your symptoms and get insights about possible conditions'
    },
    {
      id: 'risk-assessment' as TabType,
      label: 'Risk Assessment',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      description: 'Evaluate your risk for various health conditions'
    },
    {
      id: 'early-warning' as TabType,
      label: 'Early Warning',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      ),
      description: 'Monitor changes in your health for early detection of issues'
    }
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <DashboardLayout title="AI Health Assistant">
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* Feature description - Enhanced for all screen sizes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 sm:p-6 rounded-xl shadow-sm border border-emerald-100"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-emerald-100 rounded-full p-3 sm:p-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">WaslMed AI Assistant</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Get personalized healthcare support powered by advanced AI. Ask questions, check symptoms, and receive tailored recommendations.</p>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-between text-gray-700 font-medium"
          >
            <div className="flex items-center gap-2">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              {tabs.find(tab => tab.id === activeTab)?.label}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {tab.icon}
                  <div>
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5">{tab.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Tab Navigation - Enhanced for better visibility */}
          <div className="hidden md:block">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex justify-center lg:justify-start">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-5 py-4 font-medium text-sm whitespace-nowrap transition-colors relative
                      ${activeTab === tab.id 
                        ? 'text-emerald-600 border-b-2 border-emerald-500 bg-white' 
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab description - Enhanced with better spacing */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-gray-600 text-sm max-w-3xl mx-auto">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab content with smooth transitions - Improved container height for less scrolling */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-0 md:p-4"
            >
              {activeTab === 'general' && <GeneralConversation />}
              {activeTab === 'health-recommendations' && <HealthRecommendations />}
              {activeTab === 'symptom-check' && <SymptomChecker />}
              {activeTab === 'risk-assessment' && <RiskAssessment />}
              {activeTab === 'early-warning' && <EarlyWarning />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
} 