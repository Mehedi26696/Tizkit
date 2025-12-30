"use client";

import React, { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Copy, Download, Settings, 
  Table, GitBranch, Image as ImageIcon, PenTool, Check, X,
  FileText, ChevronRight, Upload, Eye, GripVertical, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { getProject, getProjectFiles, getFileSignedUrl } from '@/lib/api/projects';
import { getSubProject, updateSubProject, autoSaveSubProject, getSubProjectFileLinks, linkFileToSubProject, unlinkFileFromSubProject } from '@/lib/api/subProjects';
import type { Project, ProjectFile, SubProject, SubProjectType, SubProjectFileLink } from '@/types/project';
import TableEditor from '@/app/(protected)/functions/TableEditor';
import DiagramEditor from '@/app/(protected)/functions/DiagramEditor';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import ExportModal from '@/app/(protected)/functions/ExportModal';
import { latexService, CreditError } from '@/services/latexService';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface PageProps {
  params: Promise<{ projectId: string; subProjectId: string }>;
}

export default function SubProjectEditorPage({ params }: PageProps) {
  const { projectId, subProjectId } = use(params);
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [subProject, setSubProject] = useState<SubProject | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [linkedFiles, setLinkedFiles] = useState<string[]>([]);
  const [fileLinks, setFileLinks] = useState<SubProjectFileLink[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [latexCode, setLatexCode] = useState<string>('');
  const [editorData, setEditorData] = useState<any>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showFilePicker, setShowFilePicker] = useState(false);
  
  // For Image to LaTeX
  const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string; fileId: string } | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [creditError, setCreditError] = useState<CreditError | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load sub-project data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projectData, subProjectData, filesData, linksData] = await Promise.all([
          getProject(projectId),
          getSubProject(projectId, subProjectId),
          getProjectFiles(projectId),
          getSubProjectFileLinks(projectId, subProjectId)
        ]);
        
        setProject(projectData);
        setSubProject(subProjectData);
        setProjectFiles(filesData);
        setLinkedFiles(linksData.map(l => l.project_file_id));
        setFileLinks(linksData);
        
        // Restore editor state
        if (subProjectData.latex_code) {
          setLatexCode(subProjectData.latex_code);
        }
        if (subProjectData.editor_data) {
          try {
            const parsedData = JSON.parse(subProjectData.editor_data);
            setEditorData(parsedData);
          } catch (e) {
            console.error('Failed to parse editor data:', e);
          }
        }
        
        setEditTitle(subProjectData.title);

        // For image processing types, automatically select the first linked image if exists
        if ((subProjectData.sub_project_type === 'imageToLatex' || 
             subProjectData.sub_project_type === 'handwrittenFlowchart') && 
            linksData.length > 0) {
          const firstImageLink = linksData[0];
          const file = filesData.find(f => f.id === firstImageLink.project_file_id);
          if (file && file.file_url) {
            const { url } = await getFileSignedUrl(projectId, file.id);
            setSelectedImage({ url, filename: file.filename, fileId: file.id });
          }
        }
      } catch (error) {
        console.error('Failed to load sub-project:', error);
        toast.error('Failed to load sub-project');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [projectId, subProjectId]);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!subProject || !hasChanges) return;
    
    try {
      setIsSaving(true);
      await autoSaveSubProject(projectId, subProjectId, {
        latex_code: latexCode,
        editor_data: editorData ? JSON.stringify(editorData) : undefined
      });
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, subProjectId, subProject, latexCode, editorData, hasChanges]);

  // Trigger auto-save on changes
  useEffect(() => {
    if (hasChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(performAutoSave, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, performAutoSave]);
  
  // Keyboard shortcut for saving (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performAutoSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performAutoSave]);

  // Generate LaTeX when editor data changes
  useEffect(() => {
    if (!subProject || !editorData || !autoUpdate) return;
    
    const generateLatex = async () => {
      try {
        setIsCompiling(true);
        
        let result;
        if (subProject.sub_project_type === 'diagram') {
          result = await latexService.generateLatex({ type: 'diagram', data: editorData });
        }
        
        if (result?.data?.latex_code) {
          setLatexCode(result.data.latex_code);
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Failed to generate LaTeX:', error);
      } finally {
        setIsCompiling(false);
      }
    };

    const timeoutId = setTimeout(generateLatex, 300);
    return () => clearTimeout(timeoutId);
  }, [editorData, autoUpdate, subProject]);

  // Handle editor data change
  const handleEditorChange = useCallback((data: any) => {
    setEditorData(data);
    if (data.latexCode) {
      setLatexCode(data.latexCode);
    }
    setHasChanges(true);
  }, []);

  // Handle LaTeX code change (manual edit)
  const handleLatexChange = useCallback((code: string) => {
    setLatexCode(code);
    setHasChanges(true);
  }, []);

  // Save title
  const handleSaveTitle = useCallback(async () => {
    if (!editTitle.trim() || !subProject) return;
    
    try {
      await updateSubProject(projectId, subProjectId, { title: editTitle.trim() });
      setSubProject((prev) => prev ? { ...prev, title: editTitle.trim() } : null);
      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
    }
  }, [editTitle, projectId, subProjectId, subProject]);

  // Select file from project
  const handleSelectFile = async (file: ProjectFile) => {
    try {
      // Link file to sub-project
      const linkData = await linkFileToSubProject(projectId, subProjectId, file.id, 'source');
      setLinkedFiles(prev => [...prev, file.id]);
      setFileLinks(prev => [...prev, linkData]);
      
      // Get signed URL for preview
      if (file.file_url) {
        const { url } = await getFileSignedUrl(projectId, file.id);
        setSelectedImage({ url, filename: file.filename, fileId: file.id });
      }
      
      setShowFilePicker(false);
      toast.success(`Selected ${file.filename}`);
    } catch (error) {
      console.error('Failed to select file:', error);
      toast.error('Failed to select file');
    }
  };

  // Unlink file from sub-project
  const handleUnlinkFile = async (fileId: string) => {
    try {
      // Find the link object to get its ID
      const link = fileLinks.find(l => l.project_file_id === fileId);
      if (!link) {
        toast.error('File link not found');
        return;
      }
      
      await unlinkFileFromSubProject(projectId, subProjectId, link.id);
      setLinkedFiles(prev => prev.filter(id => id !== fileId));
      setFileLinks(prev => prev.filter(l => l.project_file_id !== fileId));
      
      // Clear selected image if it was the unlinked file
      if (selectedImage?.fileId === fileId) {
        setSelectedImage(null);
      }
      
      toast.success('File unlinked successfully');
    } catch (error) {
      console.error('Failed to unlink file:', error);
      toast.error('Failed to unlink file');
    }
  };

  // Process image to LaTeX
  const processImage = async () => {
    if (!selectedImage || !subProject) return;
    
    try {
      setIsCompiling(true);
      setCreditError(null); // Clear any previous credit error
      
      // Fetch the image from the signed URL and convert to File
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      const file = new File([blob], selectedImage.filename, { type: blob.type });
      
      // Use different service based on sub-project type
      const isHandwrittenFlowchart = subProject.sub_project_type === 'handwrittenFlowchart';
      const result = isHandwrittenFlowchart 
        ? await latexService.processHandwrittenFlowchart(file)
        : await latexService.processImage(file);
      
      if (result.success && result.data) {
        const latexResult = result.data.data?.latex_code || result.data.latex_code || '';
        setLatexCode(latexResult);
        setConfidence(result.data.data?.confidence || (isHandwrittenFlowchart ? 0 : 85));
        setHasChanges(true);
        
        if (isHandwrittenFlowchart && result.data.used_fallback) {
          toast.warning('Template generated - flowchart couldn\'t be fully analyzed. Please modify as needed.');
        } else {
          toast.success(isHandwrittenFlowchart ? 'Handwritten flowchart converted to LaTeX' : 'Image converted to LaTeX');
        }
      } else if (result.creditError) {
        // Handle credit error with dedicated UI
        setCreditError(result.creditError);
      } else {
        toast.error(result.error || 'Failed to convert image');
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      toast.error('Failed to convert image');
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy LaTeX code to clipboard
  const copyToClipboard = useCallback(() => {
    if (!latexCode) return;
    navigator.clipboard.writeText(latexCode);
    toast.success('LaTeX code copied to clipboard');
  }, [latexCode]);

  // Get icon for type
  const getTypeIcon = (type: SubProjectType) => {
    switch (type) {
      case 'table': return <Table className="w-5 h-5" />;
      case 'diagram': return <GitBranch className="w-5 h-5" />;
      case 'imageToLatex': return <ImageIcon className="w-5 h-5" />;
      case 'handwrittenFlowchart': return <PenTool className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
    }
  };

  // Get preview type for LatexPreview component
  const getPreviewType = (type: SubProjectType): 'table' | 'diagram' | 'imageToLatex' | 'document' => {
    switch (type) {
      case 'table': return 'table';
      case 'diagram': return 'diagram';
      case 'imageToLatex': return 'imageToLatex';
      case 'handwrittenFlowchart': return 'imageToLatex'; // Use imageToLatex preview for handwritten
      case 'document': return 'document';
      default: return 'imageToLatex';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f4eb]/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FA5F55]" />
          <p className="text-[#1f1e24]/70">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!subProject || !project) {
    return (
      <div className="min-h-screen bg-[#f9f4eb]/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1f1e24] mb-2">Sub-project not found</h2>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="text-[#FA5F55] hover:underline"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/projects/${projectId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{project.title}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#FA5F55]/10 rounded flex items-center justify-center text-[#FA5F55]">
                    {getTypeIcon(subProject.sub_project_type)}
                  </div>
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                        autoFocus
                      />
                      <button onClick={handleSaveTitle} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsEditingTitle(false)} className="p-1 text-gray-400 hover:bg-gray-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => setIsEditingTitle(true)}
                      className="font-medium text-gray-800 cursor-pointer hover:text-[#FA5F55] transition-colors"
                    >
                      {subProject.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Auto-save status */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : hasChanges ? (
                  <span className="text-orange-500">Unsaved changes</span>
                ) : null}
              </div>
              
              {/* Auto-update toggle */}
              {(subProject.sub_project_type === 'table' || subProject.sub_project_type === 'diagram') && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoUpdate"
                    checked={autoUpdate}
                    onChange={(e) => setAutoUpdate(e.target.checked)}
                    className="rounded text-[#FA5F55] focus:ring-[#FA5F55]"
                  />
                  <label htmlFor="autoUpdate" className="text-sm text-gray-700">
                    Auto-update
                  </label>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!latexCode}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={performAutoSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                disabled={!latexCode || isCompiling}
                className="flex items-center gap-2 bg-[#FA5F55] hover:bg-[#FA5F55]/90"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Panel Resizable Layout */}
      <div className="h-[calc(100vh-64px)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Editor */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
            <div className="h-full overflow-y-auto bg-white border-r border-gray-200 p-4">
              <div className="space-y-4">
                {/* Editor Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-[#FA5F55]/10 rounded-lg flex items-center justify-center">
                    {getTypeIcon(subProject.sub_project_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Editor</h3>
                    <p className="text-xs text-gray-500">
                      {subProject.sub_project_type === 'table' && 'Configure your data table'}
                      {subProject.sub_project_type === 'diagram' && 'Design your TikZ diagram'}
                      {(subProject.sub_project_type === 'imageToLatex' || subProject.sub_project_type === 'handwrittenFlowchart') && 'Select and process image'}
                      {subProject.sub_project_type === 'document' && 'Edit document and manage assets'}
                    </p>
                  </div>
                </div>

                {/* Editor based on type */}
                {subProject.sub_project_type === 'table' && (
                  <TableEditor onTableChange={handleEditorChange} initialData={editorData} />
                )}

                {subProject.sub_project_type === 'diagram' && (
                  <DiagramEditor onDiagramChange={handleEditorChange} initialData={editorData} />
                )}

                {(subProject.sub_project_type === 'imageToLatex' || subProject.sub_project_type === 'handwrittenFlowchart') && (
                  <div className="space-y-5">
                    {/* Hero Section */}
                    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${
                      subProject.sub_project_type === 'handwrittenFlowchart' 
                        ? 'from-emerald-500 via-teal-500 to-cyan-500' 
                        : 'from-orange-500 via-rose-500 to-pink-500'
                    } p-5`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            {subProject.sub_project_type === 'handwrittenFlowchart' ? <PenTool className="w-5 h-5 text-white" /> : <ImageIcon className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm">
                              {subProject.sub_project_type === 'handwrittenFlowchart' ? 'Flowchart to TikZ' : 'Image to LaTeX'}
                            </h3>
                            <p className="text-white/70 text-xs">
                              {subProject.sub_project_type === 'handwrittenFlowchart' ? 'AI-powered diagram extraction' : 'OCR + AI extraction'}
                            </p>
                          </div>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed">
                          {subProject.sub_project_type === 'handwrittenFlowchart' 
                            ? 'Select a handwritten flowchart and convert it into high-quality TikZ code automatically.' 
                            : 'Select any image containing mathematics or text to extract its LaTeX representation.'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowFilePicker(true)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-xs font-medium text-indigo-700">Link Image</span>
                      </button>
                      <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-700">Export</span>
                      </button>
                    </div>

                    {/* Source Image Card */}
                    {selectedImage && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Active Source</span>
                          {confidence > 0 && (
                            <Badge variant={confidence >= 80 ? "default" : confidence >= 50 ? "secondary" : "destructive"} className="text-[10px] h-5">
                              {confidence}% Conf.
                            </Badge>
                          )}
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="rounded-lg border border-gray-100 p-2 bg-gray-50/50">
                            <img
                              src={selectedImage.url}
                              alt={selectedImage.filename}
                              className="max-h-48 w-full object-contain rounded"
                            />
                            <p className="text-[10px] text-gray-400 text-center mt-2 truncate">{selectedImage.filename}</p>
                          </div>
                          
                          <Button
                            onClick={processImage}
                            disabled={isCompiling}
                            className="w-full bg-gradient-to-r from-[#FA5F55] to-[#ff8c85] hover:from-[#FA5F55]/90 hover:to-[#ff8c85]/90 text-white shadow-md"
                            size="sm"
                          >
                            {isCompiling ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <PenTool className="w-4 h-4 mr-2" />
                                Convert to LaTeX
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Linked Files Section */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Linked Files</span>
                          {linkedFiles.length > 0 && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                              {linkedFiles.length}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilePicker(true)}
                          className="h-7 px-2 text-gray-500 hover:text-gray-700"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      {linkedFiles.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {projectFiles.filter(f => linkedFiles.includes(f.id)).map(file => (
                            <div key={file.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedImage?.fileId === file.id ? 'bg-indigo-100' : 'bg-gradient-to-br from-pink-100 to-rose-100'}`}>
                                  <ImageIcon className={`w-4 h-4 ${selectedImage?.fileId === file.id ? 'text-indigo-600' : 'text-rose-500'}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-sm font-medium truncate ${selectedImage?.fileId === file.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    {file.filename}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Image'}
                                    {selectedImage?.fileId === file.id && ' • Selected'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {selectedImage?.fileId !== file.id && (
                                  <button
                                    onClick={() => handleSelectFile(file)}
                                    className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 transition-all p-1.5 rounded-lg hover:bg-indigo-50"
                                    title="Set as source"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUnlinkFile(file.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                                  title="Unlink file"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-500 mb-1">No images selected</p>
                          <p className="text-xs text-gray-400">Click Link Image above to begin</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {subProject.sub_project_type === 'document' && (
                  <div className="space-y-5">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm">LaTeX Document Editor</h3>
                            <p className="text-white/70 text-xs">Full document support</p>
                          </div>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed">
                          Write any valid LaTeX code with support for linked images, custom packages, and live preview.
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowFilePicker(true)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-emerald-700">Link Image</span>
                      </button>
                      <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-700">Export</span>
                      </button>
                    </div>

                    {/* Linked Files Section */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Linked Files</span>
                          {linkedFiles.length > 0 && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                              {linkedFiles.length}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilePicker(true)}
                          className="h-7 px-2 text-gray-500 hover:text-gray-700"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      {linkedFiles.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {projectFiles.filter(f => linkedFiles.includes(f.id)).map(file => (
                            <div key={file.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-4 h-4 text-rose-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">{file.filename}</p>
                                  <p className="text-xs text-gray-400">
                                    {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Image'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUnlinkFile(file.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                                title="Unlink file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mb-1">No linked files yet</p>
                          <p className="text-xs text-gray-400">Link images to use them in your document</p>
                        </div>
                      )}
                    </div>

                    {/* Image Template Section */}
                    {linkedFiles.length > 0 && (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-blue-200 bg-blue-100/50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📷</span>
                              <span className="text-sm font-semibold text-blue-800">Image Template</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-blue-600 mb-3">Copy this code to include linked images:</p>
                            <pre className="text-xs bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto font-mono shadow-inner">
{`\\begin{figure}[h!]
    \\centering
    \\includegraphics[width=0.8\\textwidth]{filename.png}
    \\caption{Your Caption Here}
    \\label{fig:label}
\\end{figure}`}
                            </pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`\\begin{figure}[h!]
    \\centering
    \\includegraphics[width=0.8\\textwidth]{filename.png}
    \\caption{Your Caption Here}
    \\label{fig:label}
\\end{figure}`);
                                toast.success('Template copied!');
                              }}
                              className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              Copy Template
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-sm">⚠️</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-amber-800">Required Package</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Add <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono text-amber-900">\usepackage&#123;graphicx&#125;</code> to your preamble
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Credit Error Alert */}
                {creditError && (
                  <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-red-800 text-sm">Insufficient Credits</h4>
                        <p className="text-red-600 text-xs mt-1">
                          Need {creditError.credits_needed} credits, have {creditError.available_credits}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => router.push('/dashboard/billing')}
                            className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-xs h-7"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Get Credits
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCreditError(null)}
                            className="text-xs h-7"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - LaTeX Code */}
          <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
            <div className="h-full overflow-hidden bg-gray-900 flex flex-col">
              {/* LaTeX Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-gray-200 text-sm">LaTeX Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">Overleaf Ready</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!latexCode}
                    className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* LaTeX Editor */}
              <div className="flex-1 overflow-hidden">
                {latexCode ? (
                  <textarea
                    value={latexCode}
                    onChange={(e) => handleLatexChange(e.target.value)}
                    className="w-full h-full bg-gray-900 text-green-300 text-sm font-mono p-4 resize-none focus:outline-none border-none"
                    spellCheck={false}
                    placeholder="LaTeX code will appear here..."
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div>
                      <div className="text-4xl mb-3 opacity-50">📄</div>
                      <p className="text-gray-500 text-sm font-medium mb-1">No LaTeX Code Yet</p>
                      <p className="text-gray-600 text-xs">
                        {subProject.sub_project_type === 'document' 
                          ? 'Start typing or paste your LaTeX code'
                          : subProject.sub_project_type === 'table' || subProject.sub_project_type === 'diagram'
                            ? 'Configure your editor to generate LaTeX'
                            : 'Process an image to generate LaTeX'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full overflow-hidden bg-white flex flex-col">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700 text-sm">Live Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCompiling && <Badge variant="secondary" className="text-xs">Compiling...</Badge>}
                  {latexCode && !isCompiling && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Ready</Badge>}
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                {latexCode ? (
                  <div className="h-full p-4">
                    <LatexPreview 
                      latexCode={latexCode} 
                      type={getPreviewType(subProject.sub_project_type)}
                      subProjectId={subProjectId}
                      onLatexFixed={(fixedLatex) => {
                        setLatexCode(fixedLatex);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="text-4xl mb-3 opacity-50">👁️</div>
                      <p className="text-gray-500 text-sm font-medium mb-1">Preview Area</p>
                      <p className="text-gray-400 text-xs">
                        Your LaTeX preview will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* File Picker Modal */}
      {showFilePicker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowFilePicker(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Image</h3>
            
            {projectFiles.filter(f => f.file_type === 'image').length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No images in project</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload images to the project first
                </p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto flex-1">
                {projectFiles.filter(f => f.file_type === 'image').map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <ImageIcon className="w-5 h-5 text-[#FA5F55]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500">
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                      </p>
                    </div>
                    {linkedFiles.includes(file.id) && (
                      <Badge variant="secondary">Linked</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowFilePicker(false)}
              className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          latexCode={latexCode}
          type={getPreviewType(subProject.sub_project_type)}
          subProjectId={subProjectId}
        />
      )}
    </div>
  );
}
