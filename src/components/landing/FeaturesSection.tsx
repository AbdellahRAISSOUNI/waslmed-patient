'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    title: 'Medical Records',
    description: 'Store and access your complete medical history securely in one place.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.625 16.5a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
        <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 001.06-1.06l-1.047-1.048A3.375 3.375 0 1011.625 18z" clipRule="evenodd" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  },
  {
    title: 'QR Code Sharing',
    description: 'Instantly share your medical information with healthcare providers via secure QR codes.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 9.375v-4.5zM4.875 4.5a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zm1.875-.375a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zM6 6.75A.75.75 0 016.75 6h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75A.75.75 0 016 7.5v-.75zm9.75 0A.75.75 0 0116.5 6h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013 19.125v-4.5zm1.875-.375a.375.375 0 00-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 00.375-.375v-4.5a.375.375 0 00-.375-.375h-4.5zm7.875-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zm6 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zM6 16.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zm9.75 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zm-3 3a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zm6 0a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75z" clipRule="evenodd" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
  },
  {
    title: 'Appointment Management',
    description: 'Schedule and manage all your healthcare appointments in one convenient dashboard.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0117.25 2.25c.41 0 .75.334.75.75V4.5h.75A2.25 2.25 0 0121 6.75v11.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6.75A2.25 2.25 0 015.25 4.5H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: 'Secure Authentication',
    description: 'Industry-standard security protocols to protect your sensitive medical information.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
  }
];

export default function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="features" className="relative py-24 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-48 top-0 h-96 w-96 rounded-full bg-cyan-50"></div>
        <div className="absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-emerald-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-block mb-4 px-4 py-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full"
          >
            <span className="text-sm font-medium text-emerald-700">Advanced Features</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 md:text-5xl"
          >
            Modern Healthcare<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600"> at Your Fingertips</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
          >
            WaslMed combines cutting-edge technology with user-friendly design to revolutionize your healthcare experience.
          </motion.p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative">
                {/* Feature icon */}
                <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 ${feature.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                {/* Glow effect */}
                <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 ${feature.color} w-16 h-16 rounded-2xl opacity-30 blur-xl`}></div>
                
                {/* Content */}
                <div className="pt-10 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              </div>
              
              {/* Decorative dot pattern */}
              <div className="absolute -bottom-3 -right-3 w-24 h-24 text-gray-200 opacity-30">
                <svg className="w-full h-full" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_501_1520)">
                    <circle cx="4" cy="4" r="4" fill="currentColor"/>
                    <circle cx="4" cy="20" r="4" fill="currentColor"/>
                    <circle cx="4" cy="36" r="4" fill="currentColor"/>
                    <circle cx="4" cy="52" r="4" fill="currentColor"/>
                    <circle cx="4" cy="68" r="4" fill="currentColor"/>
                    <circle cx="4" cy="84" r="4" fill="currentColor"/>
                    <circle cx="20" cy="4" r="4" fill="currentColor"/>
                    <circle cx="20" cy="20" r="4" fill="currentColor"/>
                    <circle cx="20" cy="36" r="4" fill="currentColor"/>
                    <circle cx="20" cy="52" r="4" fill="currentColor"/>
                    <circle cx="20" cy="68" r="4" fill="currentColor"/>
                    <circle cx="20" cy="84" r="4" fill="currentColor"/>
                    <circle cx="36" cy="4" r="4" fill="currentColor"/>
                    <circle cx="36" cy="20" r="4" fill="currentColor"/>
                    <circle cx="36" cy="36" r="4" fill="currentColor"/>
                    <circle cx="36" cy="52" r="4" fill="currentColor"/>
                    <circle cx="36" cy="68" r="4" fill="currentColor"/>
                    <circle cx="36" cy="84" r="4" fill="currentColor"/>
                    <circle cx="52" cy="4" r="4" fill="currentColor"/>
                    <circle cx="52" cy="20" r="4" fill="currentColor"/>
                    <circle cx="52" cy="36" r="4" fill="currentColor"/>
                    <circle cx="52" cy="52" r="4" fill="currentColor"/>
                    <circle cx="52" cy="68" r="4" fill="currentColor"/>
                    <circle cx="52" cy="84" r="4" fill="currentColor"/>
                    <circle cx="68" cy="4" r="4" fill="currentColor"/>
                    <circle cx="68" cy="20" r="4" fill="currentColor"/>
                    <circle cx="68" cy="36" r="4" fill="currentColor"/>
                    <circle cx="68" cy="52" r="4" fill="currentColor"/>
                    <circle cx="68" cy="68" r="4" fill="currentColor"/>
                    <circle cx="68" cy="84" r="4" fill="currentColor"/>
                    <circle cx="84" cy="4" r="4" fill="currentColor"/>
                    <circle cx="84" cy="20" r="4" fill="currentColor"/>
                    <circle cx="84" cy="36" r="4" fill="currentColor"/>
                    <circle cx="84" cy="52" r="4" fill="currentColor"/>
                    <circle cx="84" cy="68" r="4" fill="currentColor"/>
                    <circle cx="84" cy="84" r="4" fill="currentColor"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_501_1520">
                      <rect width="100" height="100" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 