"use client";

import { Plus, Search, Download, Copy, Trash2, ExternalLink, Archive, Filter, Grid, List, Loader2, Pencil, Check, X, Users, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Sidebar from "../dashboard/components/Sidebar";
import DashboardHeader from "../dashboard/components/DashboardHeader";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import { getProjects, deleteProject, updateProject } from "@/lib/api/projects";
import type { ProjectListItem, ProjectStatus } from "@/types/project";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/AuthContext";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Helper function to format status display
function formatStatus(status: ProjectStatus): { label: string; color: string } {
  const statusMap: Record<ProjectStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    archived: { label: 'Archived', color: 'bg-orange-100 text-orange-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load Projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleSelectProject = (id: string) => {
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

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
      toast.success('Project deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleRenameProject = async (projectId: string) => {
    if (!editingTitle.trim()) return;
    try {
      await updateProject(projectId, { title: editingTitle.trim() });
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, title: editingTitle.trim() } : p
      ));
      toast.success('Project renamed');
      setEditingProjectId(null);
    } catch (error) {
      console.error('Failed to rename project:', error);
      toast.error('Failed to rename project');
    }
  };

  const startEditing = (project: ProjectListItem) => {
    setEditingProjectId(project.id);
    setEditingTitle(project.title);
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
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
              onClick={() => setIsModalOpen(true)}
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

            {isLoading ? (
               <div className="py-12 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
               </div>
            ) : filteredProjects.length === 0 ? (
               <div className="py-12 text-center">
                 <p className="text-[#1f1e24]/50 text-lg">No projects found</p>
                 <p className="text-[#1f1e24]/40 text-sm mt-2">Create a new project to get started</p>
                 <button
                   onClick={() => setIsModalOpen(true)}
                   className="mt-4 text-[#FA5F55] hover:underline font-medium"
                 >
                   Create Project
                 </button>
               </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project, index) => {
                  const statusInfo = formatStatus(project.status);
                  return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "bg-white rounded-xl border-2 p-5 transition-all cursor-pointer group hover:shadow-lg relative",
                      selectedProjects.includes(project.id) 
                        ? "border-[#FA5F55] bg-[#FA5F55]/5" 
                        : "border-[#1f1e24]/10 hover:border-[#FA5F55]/40"
                    )}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-[#FA5F55]/10 rounded-lg text-[#FA5F55]">
                        <Archive className="w-5 h-5" />
                      </div>
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
                    <h3 className="text-lg font-semibold text-[#1f1e24] mb-2 group-hover:text-[#FA5F55] transition-colors truncate">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#1f1e24]/60">
                      Modified {formatRelativeTime(project.updated_at)}
                    </p>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-4 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.role !== 'collaborator' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(project.id);
                          }}
                          className="p-1 hover:bg-red-50 rounded text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )})}
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
                        Last Modified
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1f1e24]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1e24]/10">
                    {filteredProjects.map((project, index) => {
                      const statusInfo = formatStatus(project.status);
                      return (
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
                            {editingProjectId === project.id ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRenameProject(project.id);
                                            if (e.key === 'Escape') setEditingProjectId(null);
                                        }}
                                        className="px-2 py-1 border rounded"
                                        autoFocus
                                    />
                                    <button onClick={() => handleRenameProject(project.id)}><Check className="w-4 h-4 text-green-500"/></button>
                                    <button onClick={() => setEditingProjectId(null)}><X className="w-4 h-4 text-red-500"/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl p-2 bg-[#FA5F55]/10 rounded-lg text-[#FA5F55]">
                                        <Archive className="w-5 h-5"/>
                                    </span>
                                    <div>
                                        <button 
                                            onClick={() => router.push(`/projects/${project.id}`)}
                                            className="text-[#1f1e24] font-medium hover:text-[#FA5F55] transition-colors text-left text-lg block"
                                        >
                                            {project.title}
                                        </button>
                                        {project.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{project.description}</p>}
                                    </div>
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("text-xs px-3 py-1 rounded-full font-medium", statusInfo.color)}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1f1e24]/70">{formatRelativeTime(project.updated_at)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                              title="Open"
                              onClick={() => router.push(`/projects/${project.id}`)}
                            >
                              <ExternalLink className="w-4 h-4 text-[#1f1e24]/70" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                              title="Rename"
                              onClick={() => startEditing(project)}
                            >
                              <Pencil className="w-4 h-4 text-[#1f1e24]/70" />
                            </motion.button>
                            {project.role !== 'collaborator' && (
                                <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                                onClick={() => setDeleteConfirm(project.id)}
                                >
                                <Trash2 className="w-4 h-4 text-red-500" />
                                </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Delete Confirmation Modal */}
            <AnimatePresence>
            {deleteConfirm && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setDeleteConfirm(null)}
                >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-xl font-semibold text-[#1f1e24] mb-2">Delete Project?</h3>
                    <p className="text-[#1f1e24]/70 mb-6">
                    This action cannot be undone. All project files and content will be permanently deleted.
                    </p>
                    <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-[#1f1e24] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDeleteProject(deleteConfirm)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                    </div>
                </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

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
                <button 
                  onClick={() => setSelectedProjects([])}
                  className="px-3 py-1.5 text-sm bg-white hover:bg-[#FA5F55]/10 border border-[#FA5F55]/40 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
