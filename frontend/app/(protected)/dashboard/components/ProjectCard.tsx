// app/(protected)/dashboard/components/ProjectCard.tsx
"use client";

import { Clock, MoreVertical, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  status?: string;
  progress?: number;
}

export default function ProjectCard({ title, status = "Active", progress = 50 }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "text-green-600 bg-green-100";
      case "In Progress": return "text-[#FA5F55] bg-[#FA5F55]/10";
      case "Planning": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <motion.div 
      className="bg-[#f9f4eb]/50 border-2 border-[#FA5F55]/40 rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FA5F55]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative min-h-[120px]">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-[#1f1e24] text-3xl group-hover:text-[#FA5F55] transition-colors duration-300">
            {title}
          </h3>
          <motion.button 
            className="text-[#1f1e24]/60 hover:text-[#FA5F55] hover:bg-[#FA5F55]/10 p-1 rounded transition-all"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
        </div>
        
        
        <div className="flex items-center gap-2 text-sm text-[#1f1e24]/70">
          <Clock className="w-4 h-4" />
          <span>Updated 2 days ago</span>
        </div>
      </div>
    </motion.div>
  );
}
