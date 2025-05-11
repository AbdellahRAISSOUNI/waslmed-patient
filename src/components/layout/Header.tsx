'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation smoothly
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's a hash link
    if (href.startsWith('/#')) {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // If we're on the homepage, just scroll to the element
        if (pathname === '/') {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If we're on another page, navigate to homepage first, then scroll
          window.location.href = href;
        }
      }
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -right-1/4 top-0 w-96 h-32 bg-emerald-300/10 rounded-full filter blur-3xl transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}></div>
          <div className={`absolute -left-1/4 top-0 w-96 h-32 bg-cyan-300/10 rounded-full filter blur-3xl transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}></div>
        </div>

        <div className="flex justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative h-8 w-32 flex items-center justify-center">
                <Image 
                  src="/images/logo.png" 
                  alt="WaslMed Logo" 
                  width={100} 
                  height={32}
                  className="object-contain max-h-8"
                  priority
                />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex md:items-center md:space-x-6"
          >
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-3 py-2 text-sm font-medium relative group ${
                  pathname === item.href
                    ? 'text-emerald-600'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:w-full transition-all duration-300 ${
                  pathname === item.href ? 'w-full' : 'w-0'
                }`}></span>
              </Link>
            ))}
          </motion.div>

          {/* Auth Buttons/User Menu */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            {session ? (
              <div className="flex items-center space-x-3">
                <div className={`hidden md:block py-1 px-3 rounded-full ${
                  scrolled 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-white/20 backdrop-blur-md text-emerald-700'
                }`}>
                  <span className="text-sm font-medium">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="relative overflow-hidden px-4 py-2 text-sm font-medium text-white rounded-lg group"
                >
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:skew-x-12"></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-gradient-to-r from-cyan-500 to-emerald-500 group-hover:-skew-x-12"></span>
                  <span className="absolute bottom-0 left-0 hidden w-10 h-20 transition-all duration-100 ease-out transform -translate-x-8 translate-y-10 bg-emerald-600 -rotate-12"></span>
                  <span className="absolute bottom-0 right-0 hidden w-10 h-20 transition-all duration-100 ease-out transform translate-x-10 translate-y-8 bg-cyan-600 -rotate-12"></span>
                  <span className="relative">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className={`relative px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                    scrolled 
                      ? 'text-emerald-600 hover:text-white hover:bg-emerald-600' 
                      : 'text-emerald-600 bg-white/80 backdrop-blur-sm hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="relative overflow-hidden px-5 py-2.5 text-sm font-medium text-white rounded-lg group"
                >
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:skew-x-12"></span>
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-gradient-to-r from-cyan-500 to-emerald-500 group-hover:-skew-x-12"></span>
                  <span className="relative">Register</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-emerald-50 p-2 rounded-lg text-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden py-3 bg-white/90 backdrop-blur-md rounded-b-xl shadow-lg"
          >
            <div className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'text-emerald-700 bg-emerald-50 rounded-lg'
                      : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {session && (
                <div className="px-3 py-2 text-sm font-medium text-emerald-700">
                  {session.user?.name}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
} 