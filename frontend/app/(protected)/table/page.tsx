'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Copy, Sparkles } from 'lucide-react';
import TableEditor from '@/app/(protected)/functions/TableEditor';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import ExportModal from '@/app/(protected)/functions/ExportModal';
import { latexService } from '@/services/latexService';
import { toast } from 'sonner';
import CopilotSidebar from '@/components/copilot/CopilotSidebar';
import { parseTabular } from '@/lib/utils/latexTable';

export default function TablePage() {
  const [latexCode, setLatexCode] = React.useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [tableData, setTableData] = React.useState<any>(null);
  const [autoUpdate, setAutoUpdate] = React.useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = React.useState(false);
  const [selectionText, setSelectionText] = React.useState('');
  const [copilotErrors, setCopilotErrors] = React.useState('');
  const [tableEditorSeed, setTableEditorSeed] = React.useState(0);
  const [tableEditorInitialData, setTableEditorInitialData] = React.useState<any>(null);

  const handleTableChange = (data: any) => {
    setTableData(data);
    if (autoUpdate && data?.latexCode) {
      setLatexCode(data.latexCode);
    }
  };

  const handleManualGenerate = async () => {
    if (tableData) {
      try {
        setIsCompiling(true);
        const result = await latexService.generateLatex({ type: 'table', data: tableData });
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

  const handleCodeSelection = () => {
    const selected = window.getSelection()?.toString() || '';
    setSelectionText(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-aloevera">
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-aloevera-condensed">T</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Tizkit
                </h1>
                <span className="text-gray-400">•</span>
                <h2 className="text-lg font-semibold text-gray-800">Table Editor</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoUpdate"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
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
                  disabled={isCompiling || !tableData}
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
              <Button
                variant="outline"
                size="default"
                onClick={() => setIsCopilotOpen(true)}
                className="hover:scale-105 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FA5F55]" /> Copilot
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Editor */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">Table Configuration</div>
                  <div className="text-xs text-gray-500">Create and customize your data table</div>
                </div>
              </div>
              <div>
                <TableEditor
                  key={tableEditorSeed}
                  onTableChange={handleTableChange}
                  initialData={tableEditorInitialData}
                />
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6 p-4">
              <div className="font-semibold text-lg mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="justify-start">➕ Add Row</Button>
                <Button variant="outline" size="sm" className="justify-start">📋 Add Column</Button>
                <Button variant="outline" size="sm" className="justify-start">🎨 Format Cells</Button>
                <Button variant="outline" size="sm" className="justify-start">🔄 Sort Data</Button>
              </div>
            </Card>
          </div>

          {/* Preview and LaTeX Code */}
          <div className="space-y-6">
            {/* LaTeX Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👁️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Live Preview</div>
                    <div className="text-xs text-gray-500">Real-time table rendering</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Real-time</Badge>
                  {latexCode && <Badge variant="secondary">Compiled</Badge>}
                </div>
              </div>
              <div>
                {latexCode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <LatexPreview 
                      latexCode={latexCode} 
                      type="table" 
                      onLatexFixed={(fixedLatex) => setLatexCode(fixedLatex)}
                      onCompileErrorChange={(error) => setCopilotErrors(error || '')}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="font-semibold text-gray-700 mb-2">Preview Area</h4>
                    <p className="text-sm text-gray-500">
                      Start creating your table to see the live preview here.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* LaTeX Code */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">LaTeX Source Code</div>
                    <div className="text-xs text-gray-500">Generated LaTeX for your table</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!latexCode}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                  <Badge variant="secondary">Overleaf Ready</Badge>
                </div>
              </div>
              <div>
                {latexCode ? (
                  <div
                    className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96"
                    onMouseUp={handleCodeSelection}
                    onKeyUp={handleCodeSelection}
                  >
                    <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                      <code>{latexCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <h4 className="font-semibold text-gray-700 mb-2">No LaTeX Code Yet</h4>
                    <p className="text-sm text-gray-500">
                      Configure your table to generate LaTeX code.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCompiling && (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-blue-600">Generating LaTeX...</span>
                </>
              )}
              {!isCompiling && latexCode && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">LaTeX Ready</span>
                  <Badge variant="secondary">
                    {latexCode.split('\n').length} lines
                  </Badge>
                </>
              )}
              {!isCompiling && !latexCode && (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Start editing to generate LaTeX</span>
                </>
              )}
            </div>
            <Badge variant="secondary">Table Mode</Badge>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        latexCode={latexCode}
        type="table"
      />

      <CopilotSidebar
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        latex={latexCode}
        selection={selectionText}
        errors={copilotErrors}
        editorType="table"
        onInsert={(snippet, meta) => {
          if (!snippet) return;
          if (autoUpdate) {
            setAutoUpdate(false);
            toast.info('Auto-update disabled to keep Copilot edits.');
          }
          if (meta?.target && latexCode.includes(meta.target)) {
            const updated = latexCode.replace(meta.target, snippet);
            setLatexCode(updated);
            const parsed = parseTabular(updated);
            if (parsed) {
              setTableEditorInitialData(parsed);
              setTableEditorSeed((prev) => prev + 1);
              setTableData(parsed);
            }
            return;
          }
          if (selectionText && latexCode.includes(selectionText)) {
            const updated = latexCode.replace(selectionText, snippet);
            setLatexCode(updated);
            const parsed = parseTabular(updated);
            if (parsed) {
              setTableEditorInitialData(parsed);
              setTableEditorSeed((prev) => prev + 1);
              setTableData(parsed);
            }
            return;
          }
          const tabularRegex = /\\begin\{tabular\}[\s\S]*?\\end\{tabular\}/;
          if (tabularRegex.test(latexCode) && tabularRegex.test(snippet)) {
            setLatexCode((prev) => prev.replace(tabularRegex, snippet));
            const parsed = parseTabular(snippet);
            if (parsed) {
              setTableEditorInitialData(parsed);
              setTableEditorSeed((prev) => prev + 1);
              setTableData(parsed);
            }
            return;
          }
          setLatexCode((prev) => (prev ? `${prev}\n${snippet}` : snippet));
        }}
      />
    </div>
  );
}