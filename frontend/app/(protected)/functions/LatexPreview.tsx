'use client';

import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { latexService } from '@/services/latexService';
import { toast } from 'sonner';

interface LatexPreviewProps {
  latexCode: string;
  type: 'table' | 'diagram' | 'imageToLatex';
  onLatexFixed?: (fixedLatex: string) => void;
}

const LatexPreview: React.FC<LatexPreviewProps> = ({ latexCode, type, onLatexFixed }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove Markdown code block markers and backticks from LaTeX code
  const sanitizeLatex = (code: string) => {
    let sanitized = code.trim();
    // Remove triple backtick blocks (```latex ... ```)
    sanitized = sanitized.replace(/^```latex[\r\n]+/i, '');
    sanitized = sanitized.replace(/```$/g, '');
    // Remove any remaining backticks
    sanitized = sanitized.replace(/`+/g, '');
    return sanitized.trim();
  };

  const generatePreview = async () => {
    const cleanLatex = sanitizeLatex(latexCode);
    if (!cleanLatex) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      response = await latexService.compile({
        type,
        latex_code: cleanLatex,
        output_format: 'png',
      });
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err: any) {
      // Extract detailed error message from backend
      let errorMessage = 'Unknown error occurred';
      
      if (err.response?.data) {
        // If response is a Blob (error might be JSON in blob)
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorMessage;
          } catch {
            errorMessage = 'Failed to parse error response';
          }
        } else if (typeof err.response.data === 'object') {
          // Direct JSON response
          errorMessage = err.response.data.detail || err.response.data.message || errorMessage;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix LaTeX with AI when compilation fails
  const handleFixWithAI = async () => {
    if (!error || !latexCode || !onLatexFixed) return;
    
    setIsFixing(true);
    try {
      const result = await latexService.fixLatexWithError(latexCode, error);
      
      if (result.success && result.fixedLatex) {
        onLatexFixed(result.fixedLatex);
        setError(null);
        toast.success('LaTeX fixed! Recompiling...');
      } else {
        toast.error(result.error || 'Failed to fix LaTeX');
      }
    } catch (err) {
      console.error('Failed to fix LaTeX:', err);
      toast.error('Failed to fix LaTeX with AI');
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (latexCode) {
        generatePreview();
      }
    }, 1000); // Debounce preview generation

    return () => clearTimeout(timeoutId);
  }, [latexCode]);

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Preview</h3>
        <button
          onClick={generatePreview}
          disabled={isLoading || !latexCode.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 border border-gray-300 rounded-lg bg-white flex items-center justify-center overflow-hidden">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Compiling LaTeX with Tectonic...</p>
          </div>
        )}

        {error && (
          <div className="text-red-600 p-6 max-w-3xl w-full">
            <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
              <div className="bg-red-100 px-4 py-3 border-b border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <span className="font-semibold text-lg">LaTeX Compilation Error</span>
                </div>
                {onLatexFixed && (
                  <button
                    onClick={handleFixWithAI}
                    disabled={isFixing}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 shadow-md"
                  >
                    {isFixing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Fixing...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Fix with AI</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-4 rounded border border-red-200 overflow-x-auto max-h-96 overflow-y-auto">
                  {error}
                </pre>
              </div>
              <div className="bg-red-50 px-4 py-3 border-t border-red-200 text-sm text-red-800">
                <p className="font-medium mb-1">Common fixes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check for missing or mismatched braces: {'{}'}</li>
                  <li>Verify all LaTeX commands are spelled correctly</li>
                  <li>Ensure required packages are included</li>
                  <li>Check for special characters that need escaping</li>
                </ul>
                {onLatexFixed && (
                  <p className="mt-3 text-purple-700 font-medium">
                    💡 Click "Fix with AI" above to automatically attempt to fix the error using Gemini AI
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && previewUrl && (
          <div className="w-full h-full p-4 overflow-auto">
            <img
              src={previewUrl}
              alt="LaTeX Preview"
              className="max-w-full h-auto mx-auto shadow-lg rounded border"
            />
          </div>
        )}

        {!isLoading && !error && !previewUrl && latexCode && (
          <div className="text-gray-500 text-center p-6">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium mb-2">Preview Ready</p>
            <p className="text-sm">Click "Refresh" to generate preview</p>
          </div>
        )}

        {!latexCode && (
          <div className="text-gray-400 text-center p-6">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-medium mb-2">No content to preview</p>
            <p className="text-sm">Start building your {type} to see a preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatexPreview;