"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Search, 
  Loader2, 
  ChevronRight, 
  FileText,
  Clock,
  Layout,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjects } from "@/lib/api/projects";
import type { ProjectListItem } from "@/types/project";

interface ProjectPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (project: ProjectListItem) => void;
}

export default function ProjectPickerModal({ isOpen, onClose, onSelect }: ProjectPickerModalProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-[#fffaf5] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-[#f1f1f1] flex items-center justify-between bg-white">
               <div>
                  <h2 className="text-xl font-[1000] tracking-tight">Select Project</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Choose a file to contribute</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
               </button>
            </div>

            {/* Search */}
            <div className="p-6 bg-white border-b border-[#f1f1f1]">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your workspace..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#f1f1f1] rounded-2xl focus:border-[#FA5F55]/20 focus:ring-4 focus:ring-[#FA5F55]/5 outline-none transition-all font-medium text-sm"
                  />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
               {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                     <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Syncing Workspace...</p>
                  </div>
               ) : filteredProjects.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                     <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8 text-gray-200" />
                     </div>
                     <p className="text-sm font-bold text-gray-400">No projects available for export.</p>
                  </div>
               ) : (
                  filteredProjects.map((project) => (
                     <motion.button
                        key={project.id}
                        whileHover={{ x: 4 }}
                        onClick={() => onSelect(project)}
                        className="w-full flex items-center gap-4 p-4 bg-white border border-[#f1f1f1] rounded-2xl hover:border-[#FA5F55]/30 hover:shadow-xl hover:shadow-black/5 transition-all text-left group"
                     >
                        <div className="w-12 h-12 rounded-xl bg-[#FA5F55]/5 flex items-center justify-center group-hover:bg-[#FA5F55] transition-colors duration-300">
                           <Layout className="w-5 h-5 text-[#FA5F55] group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="font-extrabold text-[#1f1e24] truncate">{project.title}</h3>
                           <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                 <Clock className="w-3 h-3" />
                                 {new Date(project.updated_at).toLocaleDateString()}
                              </div>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#FA5F55] group-hover:translate-x-1 transition-all" />
                     </motion.button>
                  ))
               )}
            </div>
          </motion.div>
        </div>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
      `}</style>
    </AnimatePresence>
  );
}
