"use client";

import { useRouter } from "next/navigation";
import { Settings, ChevronDown, LogOut, Bell, Search, Command } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const displayName = user?.full_name || user?.username || 'User';

  return (
    <motion.header 
      className={cn(
        "fixed top-0 left-72 right-0 z-30 transition-all duration-300 px-10 h-24 flex items-center justify-center",
        scrolled ? "bg-[#fcfcfc]/80 backdrop-blur-xl border-b border-[#f1f1f1]" : "bg-transparent"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Search / Command Palette Shortcut */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA5F55] transition-all duration-300" />
            <input 
              type="text" 
              placeholder="Search in your universe..." 
              className="w-full pl-12 pr-14 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#FA5F55]/20 focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none font-medium text-sm text-[#1f1e24]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 border border-gray-200 rounded-lg text-[10px] text-gray-400 font-black bg-white shadow-sm">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FA5F55] rounded-full border-2 border-white" />
          </button>
          
          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-2" />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FA5F55] to-[#ff8c85] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#FA5F55]/20 group-hover:scale-105 transition-transform">
                {getInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-[#1f1e24] line-clamp-1">{displayName}</p>
                <div className="flex items-center gap-1">
                   <p className="text-[10px] text-gray-400 font-medium">Free Plan</p>
                   <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", showDropdown && "rotate-180")} />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-black/5 border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center gap-3">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#FA5F55] font-bold text-lg border border-[#FA5F55]/10 shadow-sm">
                        {getInitials()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-[#1f1e24] truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="p-2">
                       <button onClick={() => router.push("/dashboard/settings")} className="w-full flex items-center gap-3 p-3 text-sm text-gray-600 hover:text-[#1f1e24] hover:bg-gray-50 rounded-xl transition-all group">
                         <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#FA5F55]" />
                         <span>Account Settings</span>
                       </button>
                    </div>

                    <div className="p-2 border-t border-gray-50 bg-gray-50/20">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-bold">Sign Out</span>
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
