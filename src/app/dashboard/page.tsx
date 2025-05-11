'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <DashboardHome />
    </DashboardLayout>
  );
} 