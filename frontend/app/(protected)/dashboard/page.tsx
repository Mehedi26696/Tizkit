"use client";

import DashboardHeader from "./components/DashboardHeader";
import { Plus, Search, Download, Copy, Trash2, ExternalLink, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

export default function DashboardPage() {
    const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);

  const projects = [
    { id: 1, title: "Website Redesign", status: "In Progress", owner: "You", lastModified: "7 days ago by You" },
    { id: 2, title: "Mobile App", status: "Completed", owner: "You", lastModified: "25 days ago by You" },
    { id: 3, title: "Marketing Campaign", status: "Planning", owner: "You", lastModified: "a month ago by You" },
    { id: 4, title: "API Integration", status: "In Progress", owner: "You", lastModified: "a month ago by You" },
    { id: 5, title: "Database Migration", status: "Planning", owner: "You", lastModified: "a month ago by You" },
  ];

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectProject = (id: number) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50">
      <DashboardHeader />
      
      <main className="ml-64 p-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-xl text-[#1f1e24]/70">Welcome</p>
          <h1 className="text-4xl font-bold text-[#1f1e24]">Abs</h1>
        </motion.div>

        {/* Projects Section */}
        <motion.div 
          className="bg-gradient-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header with Search and Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1f1e24]">Your Projects</h2>
                <p className="text-sm text-[#1f1e24]/60 mt-1">Manage and track your active projects</p>
              </div>
              <motion.button 
  className="flex items-center gap-2 px-4 py-2.5 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm font-medium"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
    const id = Math.random().toString(36).substring(2, 10);
    router.push(`/projects/${id}/edit`);  // This route matches our structure!
  }}
>
  <Plus className="w-4 h-4" />
  New Project
</motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1f1e24]/40" />
              <input
                type="text"
                placeholder="Search in all projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#f9f4eb]/20 border-2 border-[#1f1e24]/20 rounded-lg focus:outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all text-[#1f1e24] placeholder:text-[#1f1e24]/40"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="w-full">
              <thead className="bg-[#f9f4eb]/40 border-y-2 border-[#1f1e24]/20">
                <tr>
                  <th className="px-6 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-2 border-[#1f1e24]/30 text-[#FA5F55] focus:ring-[#FA5F55] cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                    <div className="flex items-center gap-1">
                      Last modified
                      <span className="text-xs">↓</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1e24]/10">
                {filteredProjects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "hover:bg-[#f9f4eb]/50 transition-colors group",
                      selectedProjects.includes(project.id) && "bg-[#FA5F55]/5"
                    )}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleSelectProject(project.id)}
                        className="w-4 h-4 rounded border-2 border-[#1f1e24]/30 text-[#FA5F55] focus:ring-[#FA5F55] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#1f1e24] font-medium hover:text-[#FA5F55] transition-colors text-left text-lg">
                        {project.title}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#1f1e24]/70">{project.owner}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#1f1e24]/70">{project.lastModified}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4 text-[#1f1e24]/70" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-[#1f1e24]/70" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4 text-[#1f1e24]/70" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                          title="Open"
                        >
                          <ExternalLink className="w-4 h-4 text-[#1f1e24]/70" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#1f1e24]/50">No projects found</p>
            </div>
          )}
        </motion.div>

        {/* Selection Info */}
        {selectedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 bg-[#FA5F55]/10 border-2 border-[#FA5F55]/40 rounded-lg"
          >
            <p className="text-sm text-[#1f1e24]">
              <span className="font-semibold">{selectedProjects.length}</span> project{selectedProjects.length > 1 ? 's' : ''} selected
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
