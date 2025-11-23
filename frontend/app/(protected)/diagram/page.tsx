'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Copy } from 'lucide-react';
import DiagramEditor from '@/app/(protected)/functions/DiagramEditor';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import ExportModal from '@/app/(protected)/functions/ExportModal';
import { latexService } from '@/services/latexService';

export default function DiagramPage() {
  const [latexCode, setLatexCode] = React.useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [diagramData, setDiagramData] = React.useState<any>(null);
  const [autoUpdate, setAutoUpdate] = React.useState(true);
  const [diagramType, setDiagramType] = React.useState<'tikz' | 'flowchart' | 'sequence'>('tikz');

  // Generate LaTeX when diagram data changes
  React.useEffect(() => {
    if (diagramData && autoUpdate) {
      const timeoutId = setTimeout(async () => {
        try {
          setIsCompiling(true);
          const result = await latexService.generateLatex({ 
            type: 'diagram', 
            data: { ...diagramData, diagramType } 
          });
          if (result.data) {
            setLatexCode(result.data.latex_code);
          }
        } catch (error) {
          console.error('Failed to generate LaTeX:', error);
        } finally {
          setIsCompiling(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [diagramData, diagramType, autoUpdate]);

  const handleDiagramChange = (data: any) => {
    setDiagramData(data);
  };

  const handleManualGenerate = async () => {
    if (diagramData) {
      try {
        setIsCompiling(true);
        const result = await latexService.generateLatex({ 
          type: 'diagram', 
          data: { ...diagramData, diagramType } 
        });
        if (result.data) {
          setLatexCode(result.data.latex_code);
        }
      } catch (error) {
        console.error('Failed to generate LaTeX:', error);
      } finally {
        setIsCompiling(false);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 font-aloevera">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-aloevera-condensed">T</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tizkit
                </h1>
                <span className="text-gray-400">•</span>
                <h2 className="text-lg font-semibold text-gray-800">Diagram Editor</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 font-medium">Type:</label>
                <select
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="tikz">TikZ</option>
                  <option value="flowchart">Flowchart</option>
                  <option value="sequence">Sequence</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="autoUpdate" className="text-sm text-gray-700 font-medium">
                  Auto-update
                </label>
              </div>
              {!autoUpdate && (
                <Button
                  variant="secondary"
                  size="default"
                  onClick={handleManualGenerate}
                  disabled={isCompiling || !diagramData}
                  className="animate-fade-in hover:scale-105 transition-transform duration-200"
                >
                  Generate LaTeX
                </Button>
              )}
              <Button
                variant="secondary"
                size="default"
                onClick={() => setIsExportModalOpen(true)}
                disabled={!latexCode.trim() || isCompiling}
                className="hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diagram Editor */}
          <div>
            <Card variant="glass" padding="lg">
              <CardHeader
                title="Diagram Designer"
                description={`Create ${diagramType.toUpperCase()} diagrams visually`}
                icon={
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📐</span>
                  </div>
                }
                action={
                  <Badge variant="secondary" size="sm">
                    {diagramType.toUpperCase()}
                  </Badge>
                }
              />
              <CardContent>
                <DiagramEditor 
                  onDiagramChange={handleDiagramChange} 
                />
              </CardContent>
            </Card>

            {/* Diagram Tools */}
            <Card variant="default" padding="md" className="mt-6">
              <CardHeader title="Diagram Tools" />
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="justify-start">
                    🎯 Add Node
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    🔗 Connect
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    🎨 Style
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    📏 Align
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    🔄 Transform
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    📊 Layout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Gallery */}
            <Card variant="default" padding="md" className="mt-6">
              <CardHeader title="Templates" description="Quick start with predefined diagrams" />
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl mb-1">🌐</div>
                    <span className="text-xs">Network</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl mb-1">🏗️</div>
                    <span className="text-xs">Architecture</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl mb-1">🔄</div>
                    <span className="text-xs">Process</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview and LaTeX Code */}
          <div className="space-y-6">
            {/* LaTeX Preview */}
            <Card variant="glass" padding="lg">
              <CardHeader
                title="Live Preview"
                description="Real-time diagram rendering"
                icon={
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👁️</span>
                  </div>
                }
                action={
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" size="sm">Real-time</Badge>
                    {latexCode && <Badge variant="success" size="sm">Rendered</Badge>}
                  </div>
                }
              />
              <CardContent>
                {latexCode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-80">
                    <LatexPreview latexCode={latexCode} type="diagram" />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center min-h-80 flex flex-col justify-center">
                    <div className="text-4xl mb-4">📐</div>
                    <h4 className="font-semibold text-gray-700 mb-2">Preview Area</h4>
                    <p className="text-sm text-gray-500">
                      Start designing your diagram to see the live preview here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LaTeX Code */}
            <Card variant="default" padding="lg">
              <CardHeader
                title="TikZ Source Code"
                description="Generated TikZ/LaTeX for your diagram"
                icon={
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                }
                action={
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CopyIcon className="w-4 h-4" />}
                      onClick={copyToClipboard}
                      disabled={!latexCode}
                    >
                      Copy
                    </Button>
                    <Badge variant="secondary" size="sm">TikZ</Badge>
                  </div>
                }
              />
              <CardContent>
                {latexCode ? (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                    <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                      <code>{latexCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <h4 className="font-semibold text-gray-700 mb-2">No TikZ Code Yet</h4>
                    <p className="text-sm text-gray-500">
                      Design your diagram to generate TikZ code.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Bar */}
        <Card variant="default" padding="md" className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCompiling && (
                <>
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-purple-600">Generating TikZ...</span>
                </>
              )}
              {!isCompiling && latexCode && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">TikZ Ready</span>
                  <Badge variant="success" size="sm">
                    {latexCode.split('\n').length} lines
                  </Badge>
                </>
              )}
              {!isCompiling && !latexCode && (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Start designing to generate TikZ</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size="sm">{diagramType.toUpperCase()} Mode</Badge>
              <Badge variant="primary" size="sm">Diagram</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        latexCode={latexCode}
        type="diagram"
      />
    </div>
  );
}