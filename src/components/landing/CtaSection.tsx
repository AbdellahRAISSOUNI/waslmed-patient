'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function CtaSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[100px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(4,120,87,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.15),transparent_50%)]"></div>
        
        {/* Animated blobs */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-3000"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-cyan-600"></div>
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:14px_14px]"></div>
          
          <div className="relative p-8 md:p-16">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Take control of your health journey today
              </h2>
              <p className="mt-4 text-lg md:text-xl text-emerald-50">
                Join thousands of users who have transformed their healthcare experience with WaslMed.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/register"
                  className="inline-flex justify-center items-center px-8 py-4 bg-white text-emerald-600 font-medium rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started Free
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                    <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex justify-center items-center px-8 py-4 bg-transparent text-white border border-white/30 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
        
        {/* Floating doctor illustration (optional) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute bottom-8 right-8 md:bottom-24 md:right-24 w-32 h-32 md:w-48 md:h-48 hidden lg:block"
        >
          <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-100 relative">
              {/* Placeholder for a doctor image */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-emerald-600 opacity-40">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 bg-white rounded-lg px-3 py-1 shadow-lg border border-emerald-100"
            >
              <div className="text-sm font-semibold text-emerald-600">Trusted Care</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 