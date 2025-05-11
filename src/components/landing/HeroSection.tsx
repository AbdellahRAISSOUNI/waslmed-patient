'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function HeroSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-emerald-50 to-cyan-50 pt-24 pb-16">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-32 -right-24 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Text content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6 px-4 py-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full"
            >
              <span className="text-sm font-medium text-emerald-700">Next generation healthcare</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent"
            >
              Welcome to <br className="hidden sm:block" /><span className="font-extrabold">WaslMed</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-5 text-xl text-gray-600 max-w-lg"
            >
              Your personal health companion for a better and healthier life, combining modern technology with personalized care.
            </motion.p>
            
            {status === 'loading' ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 flex"
              >
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : session ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-10"
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 shadow-xl rounded-2xl border border-emerald-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome back, {session.user?.name}!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Redirecting you to your dashboard...
                  </p>
                  <div className="flex">
                    <Link
                      href="/dashboard"
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white border border-emerald-200 text-emerald-600 rounded-xl shadow-md hover:shadow-lg hover:bg-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Register
                </Link>
              </motion.div>
            )}
          </motion.div>
          
          {/* Right column: Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] w-full max-w-lg mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
              
              {/* Image placeholder with glossy effect */}
              <div className="relative z-10 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/50 overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"></div>
                <div className="relative rounded-xl overflow-hidden h-full">
                  {/* Use the thumbnail.png image instead of placeholder */}
                  <Image
                    src="/images/thumbnail.png"
                    alt="WaslMed Healthcare Platform"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{objectFit: 'cover'}}
                    priority
                  />
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  initial={{ y: 0 }} 
                  animate={{ y: [-5, 5, -5] }} 
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute top-1/4 -right-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">Health Score</div>
                      <div className="text-xl font-bold text-emerald-600">94%</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ y: 0 }} 
                  animate={{ y: [5, -5, 5] }} 
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="absolute bottom-1/4 -left-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-cyan-100"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-700">Appointments</div>
                      <div className="text-xl font-bold text-cyan-600">3</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#ffffff" fillOpacity="1" d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,186.7C672,192,768,192,864,176C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
} 