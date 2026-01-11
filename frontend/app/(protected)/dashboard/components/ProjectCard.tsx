"use client";

import { Clock, ArrowUpRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  updatedAt: string;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: () => void;
}

export default function ProjectCard({ 
  title, 
  description, 
  status, 
  updatedAt,
  onClick
}: ProjectCardProps) {
  
  const statusColors = {
    draft: "text-gray-500 border-gray-200 bg-gray-50",
    in_progress: "text-blue-600 border-blue-200 bg-blue-50",
    completed: "text-green-600 border-green-200 bg-green-50",
    archived: "text-orange-600 border-orange-200 bg-orange-50",
  };

  const statusColor = statusColors[status.toLowerCase().replace(' ', '_') as keyof typeof statusColors] || statusColors.draft;

  const project = { title, description, status, updatedAt }; // Convenience object for cleaner JSX

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border-2 border-[#e6dbd1] p-6 cursor-pointer relative overflow-hidden transition-all duration-500 hover:border-[#FA5F55]/30 hover:shadow-xl hover:shadow-[#FA5F55]/5"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={cn(
          "p-4 rounded-xl transition-colors duration-500 shadow-inner",
           "bg-[#f9f4eb] text-[#FA5F55] group-hover:bg-[#FA5F55] group-hover:text-white"
        )}>
          <FileText className="w-7 h-7" />
        </div>
        <Badge variant="secondary" className={cn(
            "px-3 py-1 text-[10px] uppercase font-black tracking-[0.2em] border shadow-sm",
            statusColor
          )}>
          {project.status.replace('-', ' ')}
        </Badge>
      </div>
      
      <div className="relative z-10">
        <h3 className="font-extrabold text-[#1f1e24] text-2xl mb-2 group-hover:text-[#FA5F55] transition-colors duration-300 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-[#1f1e24]/60 text-sm font-medium line-clamp-2 h-10 leading-relaxed">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-[#f4eadd] flex items-center justify-between relative z-10">
         <span className="text-xs font-bold text-[#1f1e24]/40 uppercase tracking-wider">
           Edited {new Date(project.updatedAt).toLocaleDateString()}
         </span>
         <div className="flex items-center gap-1 text-[#FA5F55] font-bold text-xs opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            Open <ArrowUpRight className="w-3 h-3" />
         </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FA5F55]/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150" />
    </motion.div>
  );
}
