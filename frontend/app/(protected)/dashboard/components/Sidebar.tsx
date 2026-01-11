"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Settings, 
  LogOut, 
  FileText,
  Zap,
  Mail,
  Box,
  Settings2,
  BookOpen,
  HelpCircle,
  DollarSign,
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "My Projects", href: "/projects", icon: FileText },
    { label: "My Templates", href: "/templates", icon: Zap },
    { label: "Invitations", href: "/invitations", icon: Mail },
    { label: "Billing", href: "/dashboard/pricings", icon: DollarSign },
    { label: "Marketplace", href: "/dashboard/marketplace", icon: Store },
  ];

  const resourceItems = [
    { label: "All Templates", href: "/resources/templates", icon: FileText },
    { label: "Documentation", href: "/resources/docs", icon: BookOpen },
    { label: "Help Center", href: "/resources/help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-72 h-full z-50 bg-[#fffaf5] border-r border-[#e6dbd1] flex flex-col justify-between py-8 px-6 overflow-y-auto custom-scrollbar"
      >
        <div>
          {/* Logo */}
          <div className="mb-12 pl-2">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="bg-[#FA5F55] p-2.5 rounded-xl shadow-lg shadow-[#FA5F55]/20 group-hover:scale-105 transition-transform duration-300">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-[900] tracking-tight text-[#1f1e24]">
                  TizKit<span className="text-[#FA5F55]">.</span>
                </h1>
                <p className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.2em]">Studio</p>
              </div>
            </Link>
          </div>

          <div className="space-y-1 mb-8">
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#1f1e24]/60 hover:text-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all group"
            >
              <Settings2 className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span>Dashboard Settings</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group cursor-pointer",
                    isActive 
                      ? "bg-white text-[#FA5F55] shadow-sm ring-1 ring-[#e6dbd1]" 
                      : "text-[#1f1e24]/60 hover:text-[#1f1e24] hover:bg-white/50"
                  )}>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 bg-[#FA5F55] rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    <item.icon className={cn("w-5 h-5", isActive ? "text-[#FA5F55]" : "group-hover:text-[#FA5F55] transition-colors")} />
                    <span className="font-bold tracking-wide">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Resources Section */}
          <div className="mt-8 pt-6 border-t border-[#e6dbd1]">
             <div className="text-[10px] font-black text-[#1f1e24]/30 uppercase tracking-[0.2em] px-4 mb-4">
              Resources
             </div>
             <div className="space-y-1">
                {resourceItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer",
                        isActive 
                          ? "bg-white text-[#FA5F55] shadow-sm ring-1 ring-[#e6dbd1]" 
                          : "text-[#1f1e24]/60 hover:text-[#1f1e24] hover:bg-white/50"
                      )}>
                        <item.icon className={cn("w-4 h-4", isActive ? "text-[#FA5F55]" : "group-hover:text-[#FA5F55] transition-colors")} />
                        <span className="font-bold text-sm tracking-wide">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
             </div>
          </div>
        </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#e6dbd1]">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[#1f1e24]/60 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-bold"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
