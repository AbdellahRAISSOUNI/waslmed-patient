'use client';

import React from 'react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  InboxIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface EmptyStateProps {
  icon: 'doctors' | 'document' | 'inbox' | 'history' | 'warning';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  // Render the appropriate icon based on the icon prop
  const renderIcon = () => {
    switch (icon) {
      case 'doctors':
        return <UserGroupIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
      case 'document':
        return <DocumentTextIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
      case 'inbox':
        return <InboxIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
      case 'history':
        return <ClockIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
      default:
        return <DocumentTextIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />;
    }
  };

  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex justify-center">
        {renderIcon()}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
} 