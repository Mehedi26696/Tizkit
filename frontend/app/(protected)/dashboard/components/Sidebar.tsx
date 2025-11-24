"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FolderKanban, DollarSign, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Pricings", href: "/dashboard/pricings", icon: DollarSign },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    // For example: signOut(), clearSession(), etc.
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full bg-[#f9f4eb]/50 border-r border-[#FA5F55]/50 w-64 flex flex-col">
      {/* Logo/Brand */}
      <motion.div 
        className="p-5 border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Image
          src="/images/Log.png"
          alt="Logo"
          width={150}
          height={40}
        />
      </motion.div>

      {/* Navigation - Flex grow to push logout to bottom */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group border-2",
                  isActive 
                    ? "bg-[#262626] text-white hover:bg-[#333333] border-[#FA5F55]" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-[#FA5F55]"
                )} />
                <span className="font-medium text-lg">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Button - At Bottom */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="cursor-pointer font-medium text-lg">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}
