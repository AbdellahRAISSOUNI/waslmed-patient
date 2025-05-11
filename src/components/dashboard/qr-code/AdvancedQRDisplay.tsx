'use client';

import { useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';

interface AdvancedQRDisplayProps {
  value: string;
  size?: number;
  qrRef: React.RefObject<HTMLDivElement | null>;
}

export default function AdvancedQRDisplay({ 
  value, 
  size = 250, 
  qrRef 
}: AdvancedQRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Create animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create particles
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }[] = [];
    
    const createParticles = () => {
      const colors = ['#10b981', '#0891b2', '#0ea5e9', '#0d9488'];
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };
    
    createParticles();
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and move particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + '20'; // Add transparency
        ctx.fill();
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
      
      // Connect nearby particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);
  
  // Animation variants
  const scanLineVariants = {
    animate: {
      y: [0, size, 0],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const pulseVariants = {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const glowVariants = {
    animate: {
      boxShadow: [
        '0 0 5px rgba(16, 185, 129, 0.3)',
        '0 0 20px rgba(16, 185, 129, 0.5)',
        '0 0 5px rgba(16, 185, 129, 0.3)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative" ref={qrRef}>
      {/* Background canvas for animated particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 rounded-xl"
      />
      
      <motion.div 
        variants={pulseVariants}
        animate="animate"
        className="relative bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-400 p-1 rounded-2xl overflow-hidden"
      >
        <motion.div
          variants={glowVariants}
          animate="animate" 
          className="bg-white p-4 rounded-xl relative"
        >
          {/* The QR code */}
          <QRCode
            value={value}
            size={size}
            bgColor="#FFFFFF"
            fgColor="#0891b2"
            level="H"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
          
          {/* Scanning animation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal scanning line */}
            <motion.div
              variants={scanLineVariants}
              animate="animate"
              className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/80 to-emerald-400/0 z-10 pointer-events-none"
            />
            
            {/* Advanced scanning effect - vertical line */}
            <motion.div
              animate={{ 
                x: [-10, size + 10, -10],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-0 h-full w-0.5 bg-gradient-to-b from-cyan-400/0 via-cyan-400/80 to-cyan-400/0 z-10"
            />
            
            {/* Scanning frame effect */}
            <motion.div 
              animate={{ 
                boxShadow: [
                  'inset 0 0 0px 0px rgba(16, 185, 129, 0)',
                  'inset 0 0 0px 2px rgba(16, 185, 129, 0.5)',
                  'inset 0 0 0px 0px rgba(16, 185, 129, 0)'
                ],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 rounded-xl"
            />
          </div>
          
          {/* Color overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5 rounded-xl pointer-events-none" />
          
          {/* Center logo/emblem */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              className="bg-white p-2 rounded-lg shadow-md z-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
          </div>
          
          {/* Corner markers for visual enhancement */}
          {[
            "top-2 left-2", 
            "top-2 right-2", 
            "bottom-2 left-2", 
            "bottom-2 right-2"
          ].map((position, index) => (
            <div key={index} className={`absolute ${position} w-3 h-3 border-2 border-cyan-500 rounded-sm pointer-events-none`}></div>
          ))}
        </motion.div>
      </motion.div>
      
      {/* Info dots */}
      <div className="absolute -right-2 -top-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
        <span>i</span>
      </div>
    </div>
  );
} 