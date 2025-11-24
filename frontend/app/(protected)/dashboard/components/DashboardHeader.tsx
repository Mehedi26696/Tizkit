"use client";

import { useRouter } from "next/navigation";
import { Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardHeader() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    initials: "JD"
  };

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
    <motion.header 
      className="bg-[#f9f4eb]/50  px-6 py-4 fixed top-0 left-64 right-0 z-30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Empty or can add breadcrumbs */}
        <div></div>

        {/* Right side - Settings and User profile */}
        <div className="flex items-center gap-3">
          {/* Settings Icon */}
          <motion.button 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 pr-3 hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* User Avatar */}
              <div className="w-9 h-9 bg-[#FA5F55] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.initials}
              </div>

              {/* User Info */}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
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
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/dashboard/profile");
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Profile Settings
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
