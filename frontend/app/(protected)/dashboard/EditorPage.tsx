import React from 'react';
import './split-gutter.css';
import LatexCodeSection from '@/app/(protected)/functions/LatexCodeSection';
import TableEditor from '@/app/(protected)/functions/TableEditor';
import DiagramEditor from '@/app/(protected)/functions/DiagramEditor';
import ImageToLatex from '@/app/(protected)/functions/ImageToLatex';
import HandwrittenFlowchart from '@/app/(protected)/functions/HandwrittenFlowchart';
import { CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
import ExportModal from '@/app/(protected)/functions/ExportModal';

interface EditorPageProps {
  onNavigateToHome: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ onNavigateToHome }) => {
  const [activeTab, setActiveTab] = React.useState<'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'>('table');
  const [latexCode, setLatexCode] = React.useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [editorData, setEditorData] = React.useState<any>(null);
  const [autoUpdate, setAutoUpdate] = React.useState(true);

  // Debounced LaTeX generation function
  const generateLatexDebounced = React.useCallback(
    async (type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart', data: any) => {
      // Skip auto-generation for AI-powered tools (imageToLatex and handwrittenFlowchart)
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
    console.log('Diagram data received from editor:', data);
    setEditorData(data);

    // Update LaTeX code if provided by the editor
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-full mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <IconButton
                variant="ghost"
                size="md"
                icon={<ArrowLeftIcon className="w-5 h-5" />}
                onClick={onNavigateToHome}
                tooltip="Back to Home"
                className="hover:scale-105 transition-transform duration-200"
              />
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm font-aloevera-condensed">T</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-aloevera">
                    Tizkit
                  </h1>
                  <Badge variant="secondary" size="sm" className="mt-0.5">
                    Visual LaTeX Editor
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/50 rounded-lg border border-gray-200/50 backdrop-blur-sm">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 transition-all duration-200"
                />
                <label htmlFor="autoUpdate" className="text-sm text-gray-700 font-medium font-aloevera cursor-pointer">
                  Auto-update
                </label>
              </div>
              {!autoUpdate && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleManualGenerate}
                  disabled={isCompiling || !editorData}
                  isLoading={isCompiling}
                  className="animate-fade-in hover:scale-105 transition-transform duration-200"
                >
                  Generate LaTeX
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsExportModalOpen(true)}
                disabled={!latexCode.trim() || isCompiling}
                leftIcon={<DownloadIcon className="w-4 h-4" />}
                className="hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with resizable panels */}
      <Split
        className="flex h-[calc(100vh-4rem)] bg-gray-50"
        sizes={[18, 32, 25, 25]}
        minSize={[200, 300, 200, 200]}
        gutterSize={8}
        direction="horizontal"
      >
        {/* Left Sidebar - Editor Selection */}
        <div className="w-full max-w-[320px] bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-aloevera">Editors</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('table')}
                className={`group w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === 'table'
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 shadow-lg shadow-blue-100'
                    : 'bg-gray-50/50 border-2 border-transparent hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeTab === 'table' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' 
                      : 'bg-blue-100 group-hover:bg-blue-200'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'table' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 font-aloevera group-hover:text-blue-600 transition-colors">Table Editor</div>
                    <div className="text-sm text-gray-600 font-aloevera">Create data tables</div>
                  </div>
                  {activeTab === 'table' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('diagram')}
                className={`group w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === 'diagram'
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 shadow-lg shadow-purple-100'
                    : 'bg-gray-50/50 border-2 border-transparent hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeTab === 'diagram' 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg' 
                      : 'bg-purple-100 group-hover:bg-purple-200'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'diagram' ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 font-aloevera group-hover:text-purple-600 transition-colors">Diagram Editor</div>
                    <div className="text-sm text-gray-600 font-aloevera">Design flowcharts</div>
                  </div>
                  {activeTab === 'diagram' && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('imageToLatex')}
                className={`group w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === 'imageToLatex'
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-lg shadow-green-100'
                    : 'bg-gray-50/50 border-2 border-transparent hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeTab === 'imageToLatex' 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                      : 'bg-green-100 group-hover:bg-green-200'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'imageToLatex' ? 'text-white' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 font-aloevera group-hover:text-green-600 transition-colors">Image to LaTeX</div>
                    <div className="text-sm text-gray-600 font-aloevera">OCR text extraction</div>
                  </div>
                  {activeTab === 'imageToLatex' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('handwrittenFlowchart')}
                className={`group w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === 'handwrittenFlowchart'
                    ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 shadow-lg shadow-orange-100'
                    : 'bg-gray-50/50 border-2 border-transparent hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeTab === 'handwrittenFlowchart' 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg' 
                      : 'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <svg className={`w-6 h-6 ${activeTab === 'handwrittenFlowchart' ? 'text-white' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 font-aloevera group-hover:text-orange-600 transition-colors">Handwritten Flowchart</div>
                    <div className="text-sm text-gray-600 font-aloevera">AI flowchart analysis</div>
                  </div>
                  {activeTab === 'handwrittenFlowchart' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
          {/* Status */}
          <div className="p-6 border-t border-gray-200/50 mt-auto bg-gradient-to-br from-gray-50/50 to-blue-50/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-aloevera">
                <span className="text-gray-500">Active Editor</span>
                <Badge variant={activeTab === 'table' ? 'primary' : activeTab === 'diagram' ? 'secondary' : activeTab === 'imageToLatex' ? 'success' : 'warning'} size="sm">
                  {activeTab === 'table' ? 'Table' : activeTab === 'diagram' ? 'Diagram' : activeTab === 'imageToLatex' ? 'Image' : 'Flowchart'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-aloevera">
                <span className="text-gray-500">Lines of Code</span>
                <span className="font-mono text-gray-700 font-medium">{latexCode ? latexCode.split('\n').length : 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-aloevera">
                <span className="text-gray-500">Status</span>
                <div className="flex items-center space-x-2">
                  {isCompiling && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  {!isCompiling && latexCode && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  {!isCompiling && !latexCode && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                  <span className={`${isCompiling ? 'text-blue-600' : latexCode ? 'text-green-600' : 'text-gray-400'} font-medium`}>
                    {isCompiling ? 'Compiling' : latexCode ? 'Ready' : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="w-full bg-white/80 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-blue-50/30">
            <CardHeader
              title={activeTab === 'table' ? 'Table Editor' : activeTab === 'diagram' ? 'Diagram Editor' : activeTab === 'imageToLatex' ? 'Image to LaTeX' : 'Handwritten Flowchart'}
              description={
                activeTab === 'table' 
                  ? 'Create and customize data tables' 
                  : activeTab === 'diagram'
                  ? 'Design diagrams and flowcharts'
                  : activeTab === 'imageToLatex'
                  ? 'Extract text from images using OCR + AI'
                  : 'Convert handwritten flowcharts to TikZ LaTeX'
              }
              icon={
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${
                  activeTab === 'table' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : activeTab === 'diagram'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                    : activeTab === 'imageToLatex'
                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}>
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
              }
            />
          </div>
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-white/50 to-gray-50/30">
            <div className="transition-all duration-300 ease-in-out">
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
        <div className="w-full bg-white/80 backdrop-blur-sm border-l border-gray-200/50 flex flex-col">
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-gray-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-aloevera">LaTeX Source</h3>
                  <p className="text-xs text-gray-600 font-aloevera">Generated code</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CopyIcon className="w-4 h-4" />}
                onClick={copyToClipboard}
                disabled={!latexCode}
                className="hover:scale-105 transition-transform duration-200"
              >
                Copy
              </Button>
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
        <div className="w-full bg-white/80 backdrop-blur-sm flex flex-col border-l border-gray-200/50">
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-b border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-aloevera">Live Preview</h3>
                  <p className="text-xs text-gray-600 font-aloevera">Real-time rendering</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="primary" size="sm" className="animate-pulse">Real-time</Badge>
                {latexCode && <Badge variant="success" size="sm">Compiled</Badge>}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-white/50 to-blue-50/20">
            {latexCode ? (
              <div className="animate-fade-in">
                <LatexPreview latexCode={latexCode} type={activeTab === 'handwrittenFlowchart' ? 'diagram' : activeTab as 'table' | 'diagram' | 'imageToLatex'} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center max-w-sm transform hover:scale-105 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-3 font-aloevera">Preview Area</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-aloevera">
                    Your {activeTab === 'table' ? 'table' : activeTab === 'diagram' ? 'diagram' : activeTab === 'imageToLatex' ? 'LaTeX output' : 'flowchart'} will appear here as you build it
                  </p>
                  <div className="mt-4 inline-flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium font-aloevera">Waiting for content</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Split>

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