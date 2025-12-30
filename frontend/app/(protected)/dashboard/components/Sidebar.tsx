"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  FileCode2, 
  DollarSign, 
  Settings, 
  LogOut, 
  Library, 
  ChevronDown, 
  ChevronUp,
  FileText,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Templates", href: "/templates", icon: FileCode2 },
    { name: "Pricings", href: "/dashboard/pricings", icon: DollarSign },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const resourceItems = [
    { name: "System Templates", href: "/resources/templates", icon: FileText },
    { name: "Documentation", href: "/resources/docs", icon: BookOpen },
    { name: "Help Center", href: "/resources/help", icon: HelpCircle },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  const isResourceActive = resourceItems.some(item => pathname.startsWith(item.href));

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
          style={{ height: 'auto' }}
        />
      </motion.div>

      {/* Navigation - Flex grow to push logout to bottom */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                    : "text-gray-700 hover:bg-gray-100 border-transparent"
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

        {/* Resources Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: navItems.length * 0.1 }}
        >
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className={cn(
              "w-full flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-all duration-200 border-2",
              isResourceActive
                ? "bg-[#262626] text-white hover:bg-[#333333] border-[#FA5F55]"
                : "text-gray-700 hover:bg-gray-100 border-transparent"
            )}
          >
            <div className="flex items-center gap-4">
              <Library className={cn(
                "w-5 h-5",
                isResourceActive ? "text-white" : "text-[#FA5F55]"
              )} />
              <span className="font-medium text-lg">Resources</span>
            </div>
            {resourcesOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {resourcesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden"
              >
                {resourceItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                        isActive
                          ? "bg-[#FA5F55]/10 text-[#FA5F55] font-semibold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
