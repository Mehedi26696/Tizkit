"use client";

import DashboardHeader from "./components/DashboardHeader";
import { Plus, Search, Copy, Trash2, ExternalLink, Archive, Loader2, FileText, Pencil, MoreVertical, Check, X, Crown, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getProjects, createProject, deleteProject, updateProject } from "@/lib/api/projects";
import type { ProjectListItem, ProjectStatus } from "@/types/project";
import { toast } from "sonner";


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

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

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name || user?.username || 'User';

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch projects on mount
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

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const newProject = await createProject({
        title: 'Untitled Project',
        status: 'draft',
        latex_content: '\\documentclass{article}\n\\begin{document}\n\nHello, World!\n\n\\end{document}'
      });
      toast.success('Project created!');
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
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
    if (!editingTitle.trim()) {
      toast.error('Project title cannot be empty');
      return;
    }
    try {
      await updateProject(projectId, { title: editingTitle.trim() });
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, title: editingTitle.trim() } : p
      ));
      toast.success('Project renamed');
      setEditingProjectId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename project:', error);
      toast.error('Failed to rename project');
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      ));
      toast.success(`Status updated to ${formatStatus(newStatus).label}`);
      setStatusMenuOpen(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const startEditing = (project: ProjectListItem) => {
    setEditingProjectId(project.id);
    setEditingTitle(project.title);
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setEditingTitle('');
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-[#1f1e24]">{displayName}</h1>
        </motion.div>

        {/* Projects Section */}
        <motion.div 
          className="bg-linear-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header with Search and Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1f1e24]">Your Projects</h2>
                <p className="text-sm text-[#1f1e24]/60 mt-1">
                  {projects.length} project{projects.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <motion.button 
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm font-medium disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateProject}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
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

          {/* Loading State */}
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
            </div>
          ) : filteredProjects.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#1f1e24]/20" />
              <h3 className="text-lg font-medium text-[#1f1e24] mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-[#1f1e24]/50 mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first project to get started'}
              </p>
              {!searchQuery && (
                <motion.button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateProject}
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </motion.button>
              )}
            </div>
          ) : (
            /* Table View */
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
                      Status
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
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                                className="px-3 py-1.5 text-lg font-medium border-2 border-[#FA5F55] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA5F55]/20 bg-white"
                                autoFocus
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRenameProject(project.id)}
                                className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={cancelEditing}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/title">
                              <button 
                                onClick={() => handleOpenProject(project.id)}
                                className="text-[#1f1e24] font-medium hover:text-[#FA5F55] transition-colors text-left text-lg"
                              >
                                {project.title}
                              </button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startEditing(project)}
                                className="p-1 opacity-0 group-hover/title:opacity-100 hover:bg-[#FA5F55]/10 rounded transition-all"
                                title="Rename"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#1f1e24]/50" />
                              </motion.button>
                            </div>
                          )}
                          {project.description && (
                            <p className="text-sm text-[#1f1e24]/50 truncate max-w-md mt-1">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {project.role === 'collaborator' ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <Users className="w-3 h-3" />
                                Collaborator
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                <Crown className="w-3 h-3" />
                                Owner
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative" ref={statusMenuOpen === project.id ? statusMenuRef : null}>
                            <button
                              onClick={() => setStatusMenuOpen(statusMenuOpen === project.id ? null : project.id)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[#FA5F55]/30 transition-all",
                                statusInfo.color
                              )}
                            >
                              {statusInfo.label}
                              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <AnimatePresence>
                              {statusMenuOpen === project.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute z-20 mt-1 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[140px]"
                                >
                                  {(['draft', 'in_progress', 'completed', 'archived'] as ProjectStatus[]).map((status) => {
                                    const info = formatStatus(status);
                                    return (
                                      <button
                                        key={status}
                                        onClick={() => handleUpdateStatus(project.id, status)}
                                        className={cn(
                                          "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors",
                                          project.status === status && "bg-gray-50"
                                        )}
                                      >
                                        <span className={cn("w-2 h-2 rounded-full", info.color.split(' ')[0])} />
                                        {info.label}
                                        {project.status === status && (
                                          <Check className="w-3.5 h-3.5 ml-auto text-[#FA5F55]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1f1e24]/70">
                            {formatRelativeTime(project.updated_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                              title="Open"
                              onClick={() => handleOpenProject(project.id)}
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
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-[#1f1e24]/70" />
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
                    );
                  })}
                </tbody>
              </table>
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
              <button
                onClick={() => setSelectedProjects([])}
                className="text-sm text-[#1f1e24]/70 hover:text-[#1f1e24]"
              >
                Clear selection
              </button>
            </div>
          </motion.div>
        )}

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
      </main>
    </div>
  );
}
