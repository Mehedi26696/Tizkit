"use client";

import { Plus, Search, Download, Copy, Trash2, ExternalLink, Archive, Filter, Grid, List } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Sidebar from "../dashboard/components/Sidebar";
import DashboardHeader from "../dashboard/components/DashboardHeader";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const projects = [
    { id: 1, title: "Research Paper Tables", status: "In Progress", owner: "You", lastModified: "2 hours ago", type: "table", itemCount: 5 },
    { id: 2, title: "Flowchart Diagrams", status: "Completed", owner: "You", lastModified: "1 day ago", type: "diagram", itemCount: 12 },
    { id: 3, title: "Thesis Figures", status: "In Progress", owner: "You", lastModified: "3 days ago", type: "imageToLatex", itemCount: 8 },
    { id: 4, title: "Algorithm Flowcharts", status: "Planning", owner: "You", lastModified: "5 days ago", type: "handwrittenFlowchart", itemCount: 3 },
    { id: 5, title: "Data Visualization", status: "In Progress", owner: "You", lastModified: "1 week ago", type: "table", itemCount: 15 },
    { id: 6, title: "Network Architecture", status: "Completed", owner: "You", lastModified: "2 weeks ago", type: "diagram", itemCount: 7 },
    { id: 7, title: "Mathematical Equations", status: "Planning", owner: "You", lastModified: "3 weeks ago", type: "imageToLatex", itemCount: 20 },
    { id: 8, title: "System Design", status: "In Progress", owner: "You", lastModified: "1 month ago", type: "diagram", itemCount: 6 },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status.toLowerCase().replace(' ', '') === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
        return '📊';
      case 'diagram':
        return '📐';
      case 'imageToLatex':
        return '🖼️';
      case 'handwrittenFlowchart':
        return '✏️';
      default:
        return '📄';
    }
  };

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <div className="ml-64 min-h-screen bg-[#f9f4eb]/50 p-8 pt-20">
      <main>
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-bold text-[#1f1e24] mb-2">Projects</h1>
          <p className="text-[#1f1e24]/60">Manage all your LaTeX projects in one place</p>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div 
          className="mb-6 flex items-center justify-between gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-[#1f1e24]/20 rounded-lg focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="planning">Planning</option>
            </select>

            <div className="flex items-center gap-1 bg-white border-2 border-[#1f1e24]/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'list' ? "bg-[#FA5F55] text-white" : "hover:bg-gray-100"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'grid' ? "bg-[#FA5F55] text-white" : "hover:bg-gray-100"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <motion.button 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const id = Math.random().toString(36).substring(2, 10);
              router.push(`/projects/${id}/edit`);
            }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </motion.button>
        </motion.div>

        {/* Projects Section */}
        <motion.div 
          className="bg-gradient-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1f1e24]/40" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#1f1e24]/20 rounded-lg focus:outline-none focus:border-[#FA5F55] focus:ring-2 focus:ring-[#FA5F55]/20 transition-all text-[#1f1e24] placeholder:text-[#1f1e24]/40"
              />
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "bg-white rounded-xl border-2 p-5 transition-all cursor-pointer group hover:shadow-lg",
                    selectedProjects.includes(project.id) 
                      ? "border-[#FA5F55] bg-[#FA5F55]/5" 
                      : "border-[#1f1e24]/10 hover:border-[#FA5F55]/40"
                  )}
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getTypeIcon(project.type)}</div>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectProject(project.id);
                      }}
                      className="w-4 h-4 rounded border-2 border-[#1f1e24]/30 text-[#FA5F55] focus:ring-[#FA5F55]"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1f1e24] mb-2 group-hover:text-[#FA5F55] transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getStatusColor(project.status))}>
                      {project.status}
                    </span>
                    <span className="text-xs text-[#1f1e24]/60">
                      {project.itemCount} items
                    </span>
                  </div>
                  <p className="text-sm text-[#1f1e24]/60">
                    Modified {project.lastModified}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
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
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                      Last Modified
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
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(project.type)}</span>
                          <button 
                            onClick={() => router.push(`/projects/${project.id}/edit`)}
                            className="text-[#1f1e24] font-medium hover:text-[#FA5F55] transition-colors text-left text-lg"
                          >
                            {project.title}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs px-3 py-1 rounded-full font-medium", getStatusColor(project.status))}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#1f1e24]/70">{project.itemCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#1f1e24]/70">{project.lastModified}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#1f1e24]/50 text-lg">No projects found</p>
              <p className="text-[#1f1e24]/40 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Selection Info */}
        {selectedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-3 bg-[#FA5F55]/10 border-2 border-[#FA5F55]/40 rounded-lg flex items-center justify-between"
          >
            <p className="text-sm text-[#1f1e24]">
              <span className="font-semibold">{selectedProjects.length}</span> project{selectedProjects.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-white hover:bg-[#FA5F55]/10 border border-[#FA5F55]/40 rounded-lg transition-colors">
                Export
              </button>
              <button className="px-3 py-1.5 text-sm bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
    </>
  );
}
