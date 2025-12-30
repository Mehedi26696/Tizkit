"use client";

import React, { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Upload, Loader2, FileText, Image as ImageIcon, 
  Table, GitBranch, PenTool, Trash2, Edit, MoreVertical, FolderOpen,
  Download, Eye, Users, Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { getProject, getProjectFiles, uploadProjectFile, deleteFile, getFileSignedUrl, getFileTypeFromExtension } from '@/lib/api/projects';
import { getSubProjects, createSubProject, deleteSubProject, getSubProjectTypeLabel } from '@/lib/api/subProjects';
import type { Project, ProjectFile, SubProjectListItem, SubProjectType } from '@/types/project';
import { PREBUILT_PROJECTS } from '@/lib/constants/prebuilt-projects';
import CollaboratorsModal from '@/components/CollaboratorsModal';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [subProjects, setSubProjects] = useState<SubProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'file' | 'subproject'; id: string } | null>(null);
  const [showCollaborators, setShowCollaborators] = useState(false);
  
  const isOwner = user?.id === project?.user_id;
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const [projectData, filesData, subProjectsData] = await Promise.all([
          getProject(projectId),
          getProjectFiles(projectId),
          getSubProjects(projectId)
        ]);
        setProject(projectData);
        setFiles(filesData);
        setSubProjects(subProjectsData);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [projectId]);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;
    
    setIsUploadingFile(true);
    
    try {
      for (const file of Array.from(uploadedFiles)) {
        const fileType = getFileTypeFromExtension(file.name);
        const uploadedFile = await uploadProjectFile(projectId, file, fileType, files.length);
        setFiles(prev => [...prev, uploadedFile]);
        toast.success(`Uploaded ${file.name}`);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete file handler
  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(projectId, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Open file
  const handleOpenFile = async (file: ProjectFile) => {
    if (!file.file_url) return;
    
    try {
      const { url } = await getFileSignedUrl(projectId, file.id);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get file URL:', error);
      toast.error('Failed to open file');
    }
  };

  // Create sub-project
  const handleCreateSubProject = async (type: SubProjectType, template?: typeof PREBUILT_PROJECTS[0]) => {
    try {
      const newSubProject = await createSubProject(projectId, {
        title: template ? template.title : `New ${getSubProjectTypeLabel(type)}`,
        sub_project_type: type,
        latex_code: template ? template.latex_content : undefined
      });
      setSubProjects(prev => [newSubProject, ...prev]);
      setShowCreateModal(false);
      toast.success('Sub-project created');
      // Navigate to edit the new sub-project
      router.push(`/projects/${projectId}/sub/${newSubProject.id}/edit`);
    } catch (error) {
      console.error('Failed to create sub-project:', error);
      toast.error('Failed to create sub-project');
    }
  };

  // Delete sub-project
  const handleDeleteSubProject = async (subProjectId: string) => {
    try {
      await deleteSubProject(projectId, subProjectId);
      setSubProjects(prev => prev.filter(sp => sp.id !== subProjectId));
      toast.success('Sub-project deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete sub-project:', error);
      toast.error('Failed to delete sub-project');
    }
  };

  // Get icon for sub-project type
  const getTypeIcon = (type: SubProjectType) => {
    switch (type) {
      case 'table': return <Table className="w-5 h-5" />;
      case 'diagram': return <GitBranch className="w-5 h-5" />;
      case 'imageToLatex': return <ImageIcon className="w-5 h-5" />;
      case 'handwrittenFlowchart': return <PenTool className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f4eb]/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FA5F55]" />
          <p className="text-[#1f1e24]/70">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f9f4eb]/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1f1e24] mb-2">Project not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#FA5F55] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#FA5F55]/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1f1e24]" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1f1e24]">{project.title}</h1>
              {project.description && (
                <p className="text-sm text-[#1f1e24]/60">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-[#1f1e24]/60">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                  <Crown className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">Owner: {project.owner_name}</span>
                </div>
                {project.collaborators && project.collaborators.length > 0 && (
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800">
                      Collaborators: {project.collaborators.map(c => c.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={() => setShowCollaborators(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#f9f4eb] text-[#1f1e24] rounded-lg border border-[#1f1e24]/20 hover:border-[#FA5F55]/40 transition-all"
                title="Manage Collaborators"
              >
                <Users className="w-4 h-4" />
                Collaborators
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
              className="flex items-center gap-2 px-4 py-2 bg-[#f9f4eb] text-[#1f1e24] rounded-lg border border-[#1f1e24]/20 hover:border-[#FA5F55]/40 transition-all disabled:opacity-50"
            >
              {isUploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".tex,.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Sub-Project
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Files Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#1f1e24]/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1f1e24]">Project Files</h2>
                <span className="text-sm text-[#1f1e24]/50">{files.length} files</span>
              </div>
              
              {files.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 text-[#1f1e24]/20" />
                  <p className="text-sm text-[#1f1e24]/50">No files uploaded yet</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-sm text-[#FA5F55] hover:underline"
                  >
                    Upload your first file
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-[#f9f4eb]/50 transition-colors"
                    >
                      {file.file_type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-[#FA5F55]/70 flex-shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#FA5F55]/70 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1f1e24] truncate">{file.filename}</p>
                        <p className="text-xs text-[#1f1e24]/40">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenFile(file)}
                          className="p-1.5 hover:bg-[#FA5F55]/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-[#1f1e24]/70" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => setDeleteConfirm({ type: 'file', id: file.id })}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sub-Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#1f1e24]/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1f1e24]">Sub-Projects</h2>
                <span className="text-sm text-[#1f1e24]/50">{subProjects.length} items</span>
              </div>
              
              {subProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#FA5F55]/10 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-[#FA5F55]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#1f1e24] mb-2">No sub-projects yet</h3>
                  <p className="text-sm text-[#1f1e24]/50 mb-4">
                    Create a table, diagram, or convert an image to LaTeX
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Sub-Project
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subProjects.map((subProject) => (
                    <motion.div
                      key={subProject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55]/40 transition-all cursor-pointer"
                      onClick={() => router.push(`/projects/${projectId}/sub/${subProject.id}/edit`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          subProject.is_completed ? 'bg-green-100 text-green-600' : 'bg-[#FA5F55]/10 text-[#FA5F55]'
                        }`}>
                          {getTypeIcon(subProject.sub_project_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#1f1e24] truncate">{subProject.title}</h3>
                          <p className="text-xs text-[#1f1e24]/50 mt-0.5">
                            {getSubProjectTypeLabel(subProject.sub_project_type)}
                          </p>
                          {subProject.description && (
                            <p className="text-sm text-[#1f1e24]/60 mt-1 truncate">{subProject.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Preview thumbnail if available */}
                      {subProject.preview_image_url && (
                        <div className="mt-3 h-24 rounded-lg bg-gray-100 overflow-hidden">
                          <img
                            src={subProject.preview_image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-[#1f1e24]/40">
                        <span>{new Date(subProject.updated_at).toLocaleDateString()}</span>
                        {subProject.is_completed && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      
                      {/* Delete button */}
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ type: 'subproject', id: subProject.id });
                          }}
                          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Sub-Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-[#1f1e24] mb-4">Create Sub-Project</h3>
              <p className="text-[#1f1e24]/60 mb-6">Choose the type of content you want to create:</p>
              
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                
                {/* Documents Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#1f1e24]/50 uppercase tracking-wider mb-3">Full Documents</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCreateSubProject('document')}
                      className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left flex flex-col h-full"
                    >
                      <FileText className="w-8 h-8 text-[#FA5F55] mb-2" />
                      <h4 className="font-medium text-[#1f1e24]">Blank Document</h4>
                      <p className="text-xs text-[#1f1e24]/50">Start from scratch</p>
                    </button>

                    {PREBUILT_PROJECTS.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleCreateSubProject('document', template)}
                          className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left flex flex-col h-full"
                        >
                          <Icon className="w-8 h-8 text-[#FA5F55] mb-2" />
                          <h4 className="font-medium text-[#1f1e24] line-clamp-1">{template.title}</h4>
                          <p className="text-xs text-[#1f1e24]/50 line-clamp-2">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tools Section */}
                <div>
                  <h4 className="text-sm font-medium text-[#1f1e24]/50 uppercase tracking-wider mb-3">Components & Tools</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCreateSubProject('table')}
                      className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left"
                    >
                      <Table className="w-8 h-8 text-[#FA5F55] mb-2" />
                      <h4 className="font-medium text-[#1f1e24]">Table</h4>
                      <p className="text-xs text-[#1f1e24]/50">Create LaTeX tables</p>
                    </button>
                    
                    <button
                      onClick={() => handleCreateSubProject('diagram')}
                      className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left"
                    >
                      <GitBranch className="w-8 h-8 text-[#FA5F55] mb-2" />
                      <h4 className="font-medium text-[#1f1e24]">Diagram</h4>
                      <p className="text-xs text-[#1f1e24]/50">Create TikZ diagrams</p>
                    </button>
                    
                    <button
                      onClick={() => handleCreateSubProject('imageToLatex')}
                      className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left"
                    >
                      <ImageIcon className="w-8 h-8 text-[#FA5F55] mb-2" />
                      <h4 className="font-medium text-[#1f1e24]">Image to LaTeX</h4>
                      <p className="text-xs text-[#1f1e24]/50">Convert images to code</p>
                    </button>
                    
                    <button
                      onClick={() => handleCreateSubProject('handwrittenFlowchart')}
                      className="p-4 rounded-xl border-2 border-[#1f1e24]/10 hover:border-[#FA5F55] hover:bg-[#FA5F55]/5 transition-all text-left"
                    >
                      <PenTool className="w-8 h-8 text-[#FA5F55] mb-2" />
                      <h4 className="font-medium text-[#1f1e24]">Handwritten</h4>
                      <p className="text-xs text-[#1f1e24]/50">AI flowchart analysis</p>
                    </button>
                  </div>
                </div>

              </div>
              
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-4 w-full py-2 text-[#1f1e24]/70 hover:text-[#1f1e24] transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h3 className="text-xl font-semibold text-[#1f1e24] mb-2">
                Delete {deleteConfirm.type === 'file' ? 'File' : 'Sub-Project'}?
              </h3>
              <p className="text-[#1f1e24]/70 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-[#1f1e24] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'file') {
                      handleDeleteFile(deleteConfirm.id);
                    } else {
                      handleDeleteSubProject(deleteConfirm.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaborators Modal */}
      <CollaboratorsModal
        isOpen={showCollaborators}
        onClose={() => setShowCollaborators(false)}
        projectId={projectId}
        projectTitle={project.title}
        isOwner={isOwner}
      />
    </div>
  );
}
