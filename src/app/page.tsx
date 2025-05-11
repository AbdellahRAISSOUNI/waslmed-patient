'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CtaSection from '@/components/landing/CtaSection';
import AnimatedBackground from '@/components/landing/AnimatedBackground';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Animated background that applies to the entire page */}
      <AnimatedBackground />
      
      {/* Content layers */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <div id="about">
          <FeaturesSection />
        </div>
        <CtaSection />
        <Footer />
      </div>
    </main>
  );
}
