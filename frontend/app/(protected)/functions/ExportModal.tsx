'use client';

import React, { useState } from 'react';
import { latexService } from '@/services/latexService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  latexCode: string;
  type: 'table' | 'diagram' | 'imageToLatex' | 'document';
  subProjectId?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, latexCode, type, subProjectId }) => {
  const [exportFormat, setExportFormat] = useState<'latex' | 'pdf' | 'png'>('latex');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setExportStatus('LaTeX code copied to clipboard!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      setExportStatus('Failed to copy to clipboard');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const downloadFile = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      if (exportFormat === 'latex') {
        // Download LaTeX as text file
        const blob = new Blob([latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tizkit-${type}.tex`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportStatus('LaTeX file downloaded!');
      } else {
        // Compile to PDF or PNG via backend
        const response = await latexService.compile({
          type: type,
          latex_code: latexCode,
          output_format: exportFormat as 'pdf' | 'png',
          sub_project_id: subProjectId,
        });

        if (response.data) {
          const blob = response.data;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tizkit-${type}.${exportFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setExportStatus(`${exportFormat.toUpperCase()} file downloaded!`);
        } else {
          throw new Error(`Failed to compile to ${exportFormat.toUpperCase()}`);
        }
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setExportStatus(err?.response?.data?.detail || err?.message || 'Export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-aloevera">Export Your Work</h2>
                <p className="text-sm text-blue-100 font-aloevera">Choose your preferred format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl transition-all duration-200 hover:scale-110 hover:rotate-90"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Export Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 font-aloevera">Select Export Format:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('latex')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  exportFormat === 'latex'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    exportFormat === 'latex'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                      : 'bg-gray-100 group-hover:bg-blue-100'
                  }`}>
                    <svg className={`w-7 h-7 ${exportFormat === 'latex' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold font-aloevera ${exportFormat === 'latex' ? 'text-blue-700' : 'text-gray-700'}`}>
                      LaTeX Code
                    </div>
                    <div className="text-xs text-gray-500 font-aloevera">.tex file</div>
                  </div>
                </div>
                {exportFormat === 'latex' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              <button
                onClick={() => setExportFormat('pdf')}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  exportFormat === 'pdf'
                    ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    exportFormat === 'pdf'
                      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg'
                      : 'bg-gray-100 group-hover:bg-red-100'
                  }`}>
                    <svg className={`w-7 h-7 ${exportFormat === 'pdf' ? 'text-white' : 'text-gray-600 group-hover:text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold font-aloevera ${exportFormat === 'pdf' ? 'text-red-700' : 'text-gray-700'}`}>
                      PDF Document
                    </div>
                    <div className="text-xs text-gray-500 font-aloevera">.pdf file</div>
                  </div>
                </div>
                {exportFormat === 'pdf' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* LaTeX Code Preview */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700 font-aloevera">LaTeX Source Code:</label>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xs rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="font-medium font-aloevera">Copy Code</span>
              </button>
            </div>
            <div className="relative group">
              <pre className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-xl text-sm overflow-auto max-h-64 font-mono border-2 border-gray-700 shadow-lg text-green-400 leading-relaxed">
{latexCode}</pre>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-blue-400"></div>
            </div>
            <div className="mt-3 flex items-start space-x-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-blue-700 font-aloevera leading-relaxed">
                <strong>Ready for Overleaf!</strong> This is a complete LaTeX document. Copy and paste it directly into Overleaf or your favorite LaTeX editor to compile.
              </p>
            </div>
          </div>

          {/* Export Status */}
          {exportStatus && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-fade-in ${
              exportStatus.includes('Failed') || exportStatus.includes('failed')
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200'
                : 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200'
            }`}>
              {exportStatus.includes('Failed') || exportStatus.includes('failed') ? (
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`font-medium font-aloevera ${
                exportStatus.includes('Failed') || exportStatus.includes('failed') ? 'text-red-700' : 'text-green-700'
              }`}>
                {exportStatus}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600 font-aloevera">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Export as <strong className="text-gray-800">{exportFormat.toUpperCase()}</strong></span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium font-aloevera hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={downloadFile}
              disabled={isExporting || !latexCode.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium font-aloevera"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download {exportFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;