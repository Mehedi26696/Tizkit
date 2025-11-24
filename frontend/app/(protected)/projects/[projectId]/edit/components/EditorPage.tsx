import React from 'react';
import '@/app/(protected)/functions/split-gutter.css';
import LatexCodeSection from '@/app/(protected)/functions/LatexCodeSection';
import TableEditor from '@/app/(protected)/functions/TableEditor';
import DiagramEditor from '@/app/(protected)/functions/DiagramEditor';
import ImageToLatex from '@/app/(protected)/functions/ImageToLatex';
import HandwrittenFlowchart from '@/app/(protected)/functions/HandwrittenFlowchart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Copy } from 'lucide-react';
import ExportModal from '@/app/(protected)/functions/ExportModal';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import { latexService } from '@/services/latexService';
import Split from './Splitter';
import { motion } from 'framer-motion';
import Splitter from './Splitter';

interface EditorPageProps {
  onNavigateToHome: () => void;
  projectId?: string;
}

export const EditorPage: React.FC<EditorPageProps> = ({ onNavigateToHome, projectId }) => {
  const [activeTab, setActiveTab] = React.useState<'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'>('table');
  const [latexCode, setLatexCode] = React.useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [editorData, setEditorData] = React.useState<any>(null);
  const [autoUpdate, setAutoUpdate] = React.useState(true);

  // Save project data to localStorage
  React.useEffect(() => {
    if (projectId && latexCode) {
      localStorage.setItem(`project_${projectId}`, JSON.stringify({
        latexCode,
        activeTab,
        editorData,
        lastModified: new Date().toISOString()
      }));
    }
  }, [projectId, latexCode, activeTab, editorData]);

  // Load project data on mount
  React.useEffect(() => {
    if (projectId) {
      const savedData = localStorage.getItem(`project_${projectId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setLatexCode(parsed.latexCode || '');
          setActiveTab(parsed.activeTab || 'table');
          setEditorData(parsed.editorData || null);
        } catch (error) {
          console.error('Failed to load project data:', error);
        }
      }
    }
  }, [projectId]);

  // Debounced LaTeX generation function
  const generateLatexDebounced = React.useCallback(
    async (type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart', data: any) => {
      if (!autoUpdate || !data || type === 'imageToLatex' || type === 'handwrittenFlowchart') return;
      
      try {
        setIsCompiling(true);
        const result = await latexService.generateLatex({ type, data });
        if (result.data) {
          setLatexCode(result.data.latex_code);
        }
      } catch (error) {
        console.error(`Failed to generate LaTeX for ${type}:`, error);
      } finally {
        setIsCompiling(false);
      }
    },
    [autoUpdate]
  );

  // Auto-generate LaTeX when data changes
  React.useEffect(() => {
    if (editorData && autoUpdate) {
      const timeoutId = setTimeout(() => {
        generateLatexDebounced(activeTab as 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart', editorData);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [editorData, activeTab, generateLatexDebounced, autoUpdate]);

  const handleDataChange = (data: any) => {
    console.log('Editor data received:', data);
    setEditorData(data);
    if (data.latexCode) {
      setLatexCode(data.latexCode);
    }
  };

  const handleImageToLatexGenerated = (latexCode: string) => {
    setLatexCode(latexCode);
  };

  const handleManualGenerate = () => {
    if (editorData) {
      generateLatexDebounced(activeTab as 'table' | 'diagram' | 'imageToLatex', editorData);
    }
  };

  const handleCompile = async (format: 'pdf' | 'png') => {
    if (!latexCode.trim()) {
      console.error('No LaTeX code to compile');
      return;
    }
    try {
      setIsCompiling(true);
      const response = await latexService.preview({ 
        type: activeTab as 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart',  
        latex_code: latexCode, 
        output_format: format 
      });
      if (response.data) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tizkit-output.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to compile LaTeX:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
  };

  return (
    <div className="min-h-screen bg-[#f9f4eb]">
      {/* Header */}
      <motion.header 
        className="bg-white border-b-2 border-[#FA5F55]/40 sticky top-0 z-40 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onNavigateToHome}
                className="p-2 hover:bg-[#FA5F55]/10 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-[#1f1e24]" />
              </motion.button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FA5F55] to-[#FA5F55]/70 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1f1e24]">
                    Tizkit
                  </h1>
                  <p className="text-xs text-[#1f1e24]/60">
                    {projectId ? `Project: ${projectId}` : 'Visual LaTeX Editor'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-[#f9f4eb] rounded-lg border border-[#1f1e24]/20">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="rounded text-[#FA5F55] focus:ring-[#FA5F55]"
                />
                <label htmlFor="autoUpdate" className="text-sm text-[#1f1e24] font-medium cursor-pointer">
                  Auto-update
                </label>
              </div>
              {!autoUpdate && (
                <motion.button
                  onClick={handleManualGenerate}
                  disabled={isCompiling || !editorData}
                  className="px-4 py-2 bg-[#f9f4eb] text-[#1f1e24] rounded-lg border border-[#1f1e24]/20 hover:border-[#FA5F55]/40 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Generate LaTeX
                </motion.button>
              )}
              <motion.button
                onClick={() => setIsExportModalOpen(true)}
                disabled={!latexCode.trim() || isCompiling}
                className="flex items-center gap-2 px-4 py-2 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" /> Export
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content with resizable panels */}
      <Splitter
        className="flex h-[calc(100vh-4rem)]"
        sizes={[18, 32, 25, 25]}
        minSize={[200, 300, 200, 200]}
        gutterSize={8}
        direction="horizontal"
      >
        {/* Left Sidebar - Editor Selection */}
        <div className="w-full max-w-[320px] bg-white border-r-2 border-[#FA5F55]/40 flex flex-col">
          <div className="p-6 border-b-2 border-[#FA5F55]/40 bg-gradient-to-br from-[#f9f4eb]/50 to-white">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#FA5F55] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1f1e24]">Editors</h3>
            </div>
            <div className="space-y-3">
              {/* Table Editor Button */}
              <motion.button
                onClick={() => setActiveTab('table')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  activeTab === 'table'
                    ? 'bg-[#FA5F55]/10 border-[#FA5F55] shadow-md'
                    : 'bg-[#f9f4eb]/50 border-transparent hover:border-[#FA5F55]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === 'table' 
                      ? 'bg-[#FA5F55] shadow-lg' 
                      : 'bg-[#FA5F55]/20'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'table' ? 'text-white' : 'text-[#FA5F55]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1f1e24]">Table Editor</div>
                    <div className="text-sm text-[#1f1e24]/70">Create data tables</div>
                  </div>
                  {activeTab === 'table' && (
                    <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.button>

              {/* Diagram Editor Button */}
              <motion.button
                onClick={() => setActiveTab('diagram')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  activeTab === 'diagram'
                    ? 'bg-[#FA5F55]/10 border-[#FA5F55] shadow-md'
                    : 'bg-[#f9f4eb]/50 border-transparent hover:border-[#FA5F55]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === 'diagram' 
                      ? 'bg-[#FA5F55] shadow-lg' 
                      : 'bg-[#FA5F55]/20'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'diagram' ? 'text-white' : 'text-[#FA5F55]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1f1e24]">Diagram Editor</div>
                    <div className="text-sm text-[#1f1e24]/70">Design flowcharts</div>
                  </div>
                  {activeTab === 'diagram' && (
                    <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.button>

              {/* Image to LaTeX Button */}
              <motion.button
                onClick={() => setActiveTab('imageToLatex')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  activeTab === 'imageToLatex'
                    ? 'bg-[#FA5F55]/10 border-[#FA5F55] shadow-md'
                    : 'bg-[#f9f4eb]/50 border-transparent hover:border-[#FA5F55]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === 'imageToLatex' 
                      ? 'bg-[#FA5F55] shadow-lg' 
                      : 'bg-[#FA5F55]/20'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'imageToLatex' ? 'text-white' : 'text-[#FA5F55]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1f1e24]">Image to LaTeX</div>
                    <div className="text-sm text-[#1f1e24]/70">OCR extraction</div>
                  </div>
                  {activeTab === 'imageToLatex' && (
                    <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.button>

              {/* Handwritten Flowchart Button */}
              <motion.button
                onClick={() => setActiveTab('handwrittenFlowchart')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  activeTab === 'handwrittenFlowchart'
                    ? 'bg-[#FA5F55]/10 border-[#FA5F55] shadow-md'
                    : 'bg-[#f9f4eb]/50 border-transparent hover:border-[#FA5F55]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === 'handwrittenFlowchart' 
                      ? 'bg-[#FA5F55] shadow-lg' 
                      : 'bg-[#FA5F55]/20'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'handwrittenFlowchart' ? 'text-white' : 'text-[#FA5F55]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#1f1e24]">Handwritten Flow</div>
                    <div className="text-sm text-[#1f1e24]/70">AI analysis</div>
                  </div>
                  {activeTab === 'handwrittenFlowchart' && (
                    <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.button>
            </div>
          </div>

          {/* Status Section */}
          <div className="p-6 border-t-2 border-[#FA5F55]/40 mt-auto bg-gradient-to-br from-white to-[#f9f4eb]/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1f1e24]/70">Active Editor</span>
                <span className="px-2 py-1 bg-[#FA5F55]/10 text-[#FA5F55] rounded-full font-medium">
                  {activeTab === 'table' ? 'Table' : activeTab === 'diagram' ? 'Diagram' : activeTab === 'imageToLatex' ? 'Image' : 'Flowchart'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1f1e24]/70">Lines of Code</span>
                <span className="font-mono text-[#1f1e24] font-medium">{latexCode ? latexCode.split('\n').length : 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1f1e24]/70">Status</span>
                <div className="flex items-center space-x-2">
                  {isCompiling && <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>}
                  {!isCompiling && latexCode && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  {!isCompiling && !latexCode && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                  <span className={`font-medium ${isCompiling ? 'text-[#FA5F55]' : latexCode ? 'text-green-600' : 'text-gray-400'}`}>
                    {isCompiling ? 'Compiling' : latexCode ? 'Ready' : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="w-full bg-white flex flex-col border-r-2 border-[#FA5F55]/40">
          <div className="p-4 border-b-2 border-[#FA5F55]/40 bg-[#f9f4eb]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FA5F55] flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {activeTab === 'table' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                  {activeTab === 'diagram' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  )}
                  {activeTab === 'imageToLatex' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                  {activeTab === 'handwrittenFlowchart' && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                </svg>
              </div>
              <div>
                <div className="font-semibold text-[#1f1e24]">
                  {activeTab === 'table' ? 'Table Editor' : activeTab === 'diagram' ? 'Diagram Editor' : activeTab === 'imageToLatex' ? 'Image to LaTeX' : 'Handwritten Flowchart'}
                </div>
                <div className="text-xs text-[#1f1e24]/70">
                  {activeTab === 'table' 
                    ? 'Create and customize data tables' 
                    : activeTab === 'diagram'
                    ? 'Design diagrams and flowcharts'
                    : activeTab === 'imageToLatex'
                    ? 'Extract text from images using OCR + AI'
                    : 'Convert handwritten flowcharts to TikZ LaTeX'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-[#f9f4eb]/30">
            <div className="transition-all duration-300">
              {activeTab === 'table' && (
                <div className="animate-fade-in">
                  <TableEditor onTableChange={handleDataChange} />
                </div>
              )}
              {activeTab === 'diagram' && (
                <div className="animate-fade-in">
                  <DiagramEditor onDiagramChange={handleDataChange} />
                </div>
              )}
              {activeTab === 'imageToLatex' && (
                <div className="animate-fade-in">
                  <ImageToLatex onLatexGenerated={handleImageToLatexGenerated} />
                </div>
              )}
              {activeTab === 'handwrittenFlowchart' && (
                <div className="animate-fade-in">
                  <HandwrittenFlowchart onLatexGenerated={handleImageToLatexGenerated} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LaTeX Code Panel */}
        <div className="w-full bg-white flex flex-col border-r-2 border-[#FA5F55]/40">
          <div className="p-4 border-b-2 border-[#FA5F55]/40 bg-[#f9f4eb]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#1f1e24] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e24]">LaTeX Source</h3>
                  <p className="text-xs text-[#1f1e24]/70">Generated code</p>
                </div>
              </div>
              <motion.button
                onClick={copyToClipboard}
                disabled={!latexCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FA5F55]/10 text-[#FA5F55] rounded-lg hover:bg-[#FA5F55]/20 transition-all disabled:opacity-50 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" /> Copy
              </motion.button>
            </div>
          </div>
          <LatexCodeSection
            title=""
            description=""
            generatedLatex={latexCode}
            onCopy={copyToClipboard}
            onLatexEdit={setLatexCode}
          />
        </div>

        {/* Preview Panel */}
        <div className="w-full bg-white flex flex-col">
          <div className="bg-[#f9f4eb]/50 border-b-2 border-[#FA5F55]/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#FA5F55] rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1f1e24]">Live Preview</h3>
                  <p className="text-xs text-[#1f1e24]/70">Real-time rendering</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-[#FA5F55]/10 text-[#FA5F55] rounded-full text-xs font-medium animate-pulse">
                  Real-time
                </span>
                {latexCode && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Compiled
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-[#f9f4eb]/30">
            {latexCode ? (
              <div className="animate-fade-in">
                <LatexPreview latexCode={latexCode} type={activeTab === 'handwrittenFlowchart' ? 'diagram' : activeTab as 'table' | 'diagram' | 'imageToLatex'} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 bg-[#FA5F55]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-[#FA5F55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-[#1f1e24] mb-3">Preview Area</h4>
                  <p className="text-sm text-[#1f1e24]/70 leading-relaxed">
                    Your {activeTab === 'table' ? 'table' : activeTab === 'diagram' ? 'diagram' : activeTab === 'imageToLatex' ? 'LaTeX output' : 'flowchart'} will appear here as you build it
                  </p>
                  <div className="mt-4 inline-flex items-center space-x-2 text-xs text-[#FA5F55] bg-[#FA5F55]/10 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-[#FA5F55] rounded-full animate-pulse"></div>
                    <span className="font-medium">Waiting for content</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Splitter>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        latexCode={latexCode}
        type={activeTab as 'table' | 'diagram' | 'imageToLatex'}
      />
    </div>
  );
};
