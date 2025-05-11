'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-emerald-50/50"></div>
      
      {/* Floating circles */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-20 
              ${i % 3 === 0 ? 'bg-emerald-200' : i % 3 === 1 ? 'bg-cyan-200' : 'bg-blue-200'}`}
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]"></div>
      
      {/* Dots pattern */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full bg-emerald-600"
            style={{
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.2 + 0.05,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [Math.random() * 0.2 + 0.05, Math.random() * 0.3 + 0.1, Math.random() * 0.2 + 0.05],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
} 