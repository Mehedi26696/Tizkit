// Navbar component
"use client";

import React, { useState } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/AuthContext'

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate initials from user data
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const displayName = user?.full_name || user?.username || 'User';
  const displayEmail = user?.email || '';

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  return (
    <div className='flex flex-row items-center justify-around w-full min-w-5xl p-4 fixed top-0 left-0 bg-transparent/80 backdrop-blur-sm z-50'>
      <Link href="/">
        <Image
          src="/images/Log.png"
          alt="Logo"
          width={150}
          height={40}
          className='cursor-pointer'
          priority
          style={{ height: 'auto' }}
        />
      </Link>

      <div className='flex border-1 border-[#FA5F55]/30 rounded-full px-6 py-4 bg-transparent text-gray-900'>
        <ul className='flex gap-8'>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <a href="/#home">Home</a>
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <a href="/#services">Services</a>
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <a href="/#features">Features</a>
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <Link href="/docs">Docs</Link>
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <a href="/#pricing">Pricing</a>
            </li>
            <li className='text-md font-extralight hover:text-[#FA5F55] cursor-pointer hover:underline-offset-1 transition-colors duration-300'>
              <a href="/#contact">Contact</a>
            </li>
        </ul>
      </div>

      <div className='flex gap-4'>
        {user ? (
          // Logged in user - Show profile
          <div className="relative">
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 pr-4 hover:bg-white/50 rounded-full transition-all border border-[#FA5F55]/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* User Avatar */}
              <div className="w-9 h-9 bg-[#FA5F55] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials()}
              </div>

              {/* User Info */}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{displayName}</p>
              </div>

              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-gray-600 transition-transform duration-300",
                  showDropdown && "rotate-180"
                )}
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDropdown(false)}
                  />
                  
                  <motion.div 
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-800">{displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Profile Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Not logged in - Show login/signup buttons
          <>
            <Link href="/login" className='border-1 border-[#FA5F55]/30 rounded-full px-6 py-4 bg-transparent text-gray-900 font-normal hover:bg-[#FA5F55] hover:text-white cursor-pointer transition-all duration-300'>
              Login
            </Link>
            <Link href="/register" className='border-1 border-[#FA5F55] rounded-full px-6 py-4 bg-[#1f1e24] text-white font-normal hover:bg-[#FA5F55]/90 cursor-pointer transition-all duration-300'>
              SignUp
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar
