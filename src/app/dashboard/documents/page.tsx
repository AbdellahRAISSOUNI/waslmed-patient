'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentsPage from '@/components/ai/DocumentsPage';
import LoadingIndicator from '@/components/ai/LoadingIndicator';

export default function Page() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login?callbackUrl=/dashboard/documents');
    },
  });

  if (status === 'loading') {
    return (
      <DashboardLayout title="Document Analysis">
        <div className="flex justify-center items-center h-96">
          <LoadingIndicator message="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Document Analysis">
      <Suspense fallback={<LoadingIndicator message="Loading documents..." />}>
        <DocumentsPage />
      </Suspense>
    </DashboardLayout>
  );
} 