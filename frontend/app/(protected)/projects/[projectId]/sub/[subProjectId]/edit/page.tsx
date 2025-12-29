"use client";

import React, { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Copy, Download, Settings, 
  Table, GitBranch, Image as ImageIcon, PenTool, Check, X,
  FileText, ChevronRight, Upload, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProject, getProjectFiles, getFileSignedUrl } from '@/lib/api/projects';
import { getSubProject, updateSubProject, autoSaveSubProject, getSubProjectFileLinks, linkFileToSubProject } from '@/lib/api/subProjects';
import type { Project, ProjectFile, SubProject, SubProjectType } from '@/types/project';
import TableEditor from '@/app/(protected)/functions/TableEditor';
import DiagramEditor from '@/app/(protected)/functions/DiagramEditor';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import ExportModal from '@/app/(protected)/functions/ExportModal';
import { latexService } from '@/services/latexService';

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

  // Generate LaTeX when editor data changes
  useEffect(() => {
    if (!subProject || !editorData || !autoUpdate) return;
    
    const generateLatex = async () => {
      try {
        setIsCompiling(true);
        
        let result;
        if (subProject.sub_project_type === 'table') {
          result = await latexService.generateLatex({ type: 'table', data: editorData });
        } else if (subProject.sub_project_type === 'diagram') {
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
  const handleEditorChange = (data: any) => {
    setEditorData(data);
    setHasChanges(true);
  };

  // Handle LaTeX code change (manual edit)
  const handleLatexChange = (code: string) => {
    setLatexCode(code);
    setHasChanges(true);
  };

  // Save title
  const handleSaveTitle = async () => {
    if (!editTitle.trim() || !subProject) return;
    
    try {
      await updateSubProject(projectId, subProjectId, { title: editTitle.trim() });
      setSubProject({ ...subProject, title: editTitle.trim() });
      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title');
    }
  };

  // Select file from project
  const handleSelectFile = async (file: ProjectFile) => {
    try {
      // Link file to sub-project
      await linkFileToSubProject(projectId, subProjectId, file.id, 'source');
      setLinkedFiles(prev => [...prev, file.id]);
      
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

  // Process image to LaTeX
  const processImage = async () => {
    if (!selectedImage) return;
    
    try {
      setIsCompiling(true);
      
      // Fetch the image from the signed URL and convert to File
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      const file = new File([blob], selectedImage.filename, { type: blob.type });
      
      // Call the OCR API
      const result = await latexService.processImage(file);
      
      if (result.success && result.data) {
        const latexResult = result.data.data?.latex_code || result.data.latex_code || '';
        setLatexCode(latexResult);
        setConfidence(result.data.data?.confidence || 85);
        setHasChanges(true);
        toast.success('Image converted to LaTeX');
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

  // Copy LaTeX to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    toast.success('Copied to clipboard');
  };

  // Get icon for type
  const getTypeIcon = (type: SubProjectType) => {
    switch (type) {
      case 'table': return <Table className="w-5 h-5" />;
      case 'diagram': return <GitBranch className="w-5 h-5" />;
      case 'imageToLatex': return <ImageIcon className="w-5 h-5" />;
      case 'handwrittenFlowchart': return <PenTool className="w-5 h-5" />;
    }
  };

  // Get preview type for LatexPreview component
  const getPreviewType = (type: SubProjectType): 'table' | 'diagram' | 'imageToLatex' => {
    switch (type) {
      case 'table': return 'table';
      case 'diagram': return 'diagram';
      case 'imageToLatex': return 'imageToLatex';
      case 'handwrittenFlowchart': return 'imageToLatex'; // Use imageToLatex preview for handwritten
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Editor */}
          <div className="space-y-6">
            {/* Editor based on type */}
            {subProject.sub_project_type === 'table' && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#FA5F55]/10 rounded-lg flex items-center justify-center">
                    <Table className="w-5 h-5 text-[#FA5F55]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Table Configuration</h3>
                    <p className="text-xs text-gray-500">Create and customize your data table</p>
                  </div>
                </div>
                <TableEditor onTableChange={handleEditorChange} initialData={editorData} />
              </Card>
            )}

            {subProject.sub_project_type === 'diagram' && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#FA5F55]/10 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-[#FA5F55]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Diagram Editor</h3>
                    <p className="text-xs text-gray-500">Design your TikZ diagram</p>
                  </div>
                </div>
                <DiagramEditor onDiagramChange={handleEditorChange} initialData={editorData} />
              </Card>
            )}

            {(subProject.sub_project_type === 'imageToLatex' || subProject.sub_project_type === 'handwrittenFlowchart') && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#FA5F55]/10 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[#FA5F55]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {subProject.sub_project_type === 'imageToLatex' ? 'Image to LaTeX' : 'Handwritten Flowchart'}
                      </h3>
                      <p className="text-xs text-gray-500">Select an image from your project files</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilePicker(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                </div>
                
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-4">
                      <img
                        src={selectedImage.url}
                        alt={selectedImage.filename}
                        className="max-h-64 w-full object-contain rounded"
                      />
                      <p className="text-sm text-gray-500 text-center mt-2">{selectedImage.filename}</p>
                    </div>
                    
                    <Button
                      onClick={processImage}
                      disabled={isCompiling}
                      className="w-full bg-[#FA5F55] hover:bg-[#FA5F55]/90"
                    >
                      {isCompiling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Convert to LaTeX</>
                      )}
                    </Button>
                    {confidence > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <Badge variant={confidence >= 80 ? "default" : confidence >= 50 ? "secondary" : "destructive"}>
                          {confidence}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center cursor-pointer hover:border-[#FA5F55]/50 transition-colors"
                    onClick={() => setShowFilePicker(true)}
                  >
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">No image selected</p>
                    <p className="text-sm text-gray-400">Click to select from project files</p>
                  </div>
                )}
              </Card>
            )}

            {/* Linked Files */}
            {linkedFiles.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Linked Files</h4>
                <div className="space-y-2">
                  {projectFiles.filter(f => linkedFiles.includes(f.id)).map(file => (
                    <div key={file.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      {file.filename}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel - Preview & LaTeX */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Live Preview</h3>
                    <p className="text-xs text-gray-500">Real-time rendering</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompiling && <Badge variant="secondary">Compiling...</Badge>}
                  {latexCode && <Badge variant="secondary">Ready</Badge>}
                </div>
              </div>
              
              {latexCode ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[200px]">
                  <LatexPreview 
                    latexCode={latexCode} 
                    type={getPreviewType(subProject.sub_project_type)} 
                    onLatexFixed={(fixedLatex) => {
                      setLatexCode(fixedLatex);
                      setHasChanges(true);
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">👁️</div>
                  <h4 className="font-semibold text-gray-700 mb-2">Preview Area</h4>
                  <p className="text-sm text-gray-500">
                    Your LaTeX preview will appear here
                  </p>
                </div>
              )}
            </Card>

            {/* LaTeX Code */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">LaTeX Source Code</h3>
                    <p className="text-xs text-gray-500">Editable LaTeX output</p>
                  </div>
                </div>
                <Badge variant="secondary">Overleaf Ready</Badge>
              </div>
              
              {latexCode ? (
                <div className="relative">
                  <textarea
                    value={latexCode}
                    onChange={(e) => handleLatexChange(e.target.value)}
                    className="w-full h-64 bg-gray-900 text-green-300 text-sm font-mono p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FA5F55]"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <h4 className="font-semibold text-gray-700 mb-2">No LaTeX Code Yet</h4>
                  <p className="text-sm text-gray-500">
                    {subProject.sub_project_type === 'table' || subProject.sub_project_type === 'diagram'
                      ? 'Configure your editor to generate LaTeX code.'
                      : 'Select and process an image to generate LaTeX.'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

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
        />
      )}
    </div>
  );
}
