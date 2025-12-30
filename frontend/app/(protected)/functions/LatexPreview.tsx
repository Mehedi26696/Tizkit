import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { latexService, CreditError, isCreditError } from '@/services/latexService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CreditCard, RotateCcw } from 'lucide-react';

// react-pdf imports
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface LatexPreviewProps {
  latexCode: string;
  type: 'table' | 'diagram' | 'imageToLatex' | 'document';
  subProjectId?: string;
  onLatexFixed?: (fixedLatex: string) => void;
}

const LatexPreview: React.FC<LatexPreviewProps> = ({ latexCode, type, subProjectId, onLatexFixed }) => {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditError, setCreditError] = useState<CreditError | null>(null);
  
  // PDF State
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    toast.error('Failed to load PDF viewer: ' + error.message);
  }

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
    setCreditError(null);
    // Reset pages while loading
    setNumPages(0);

    try {
      let response;
      let outputFormat: 'pdf' | 'png' = 'png';
      if (type === 'document') {
        outputFormat = 'pdf';
      }

      response = await latexService.compile({
        type,
        latex_code: cleanLatex,
        output_format: outputFormat,
        sub_project_id: subProjectId
      });
      
      const blob = new Blob([response.data], { 
        type: outputFormat === 'pdf' ? 'application/pdf' : 'image/png' 
      });
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
            // Check if it's a credit error
            if (isCreditError(errorData.detail)) {
              setCreditError(errorData.detail);
              return;
            } else if (isCreditError(errorData)) {
              setCreditError(errorData);
              return;
            }
            errorMessage = errorData.detail || errorMessage;
          } catch {
            errorMessage = 'Failed to parse error response';
          }
        } else if (typeof err.response.data === 'object') {
          // Direct JSON response - check for credit error
          if (isCreditError(err.response.data.detail)) {
            setCreditError(err.response.data.detail);
            return;
          } else if (isCreditError(err.response.data)) {
            setCreditError(err.response.data);
            return;
          }
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
      } else if (result.creditError) {
        setCreditError(result.creditError);
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
    // Skip auto-compile for document type - use manual compile button instead
    if (type === 'document') return;
    
    const timeoutId = setTimeout(() => {
      if (latexCode) {
        generatePreview();
      }
    }, 1000); // Debounce preview generation

    return () => clearTimeout(timeoutId);
  }, [latexCode, type]);

  // Cleanup URL when component unmounts or updates
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
          className={`px-4 py-2 text-white rounded text-sm font-medium flex items-center space-x-2 transition-all ${
            type === 'document' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400' 
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300'
          } disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>{type === 'document' ? 'Compile PDF' : 'Refresh'}</span>
            </>
          )}
        </button>
      </div>

      <div className={`flex-1 overflow-hidden border border-gray-300 rounded-lg ${type === 'document' ? 'bg-gray-200' : 'bg-white'} flex flex-col relative`}>
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center gap-3 text-gray-600">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Compiling LaTeX with Tectonic...</p>
          </div>
        )}

        {/* Credit Error UI */}
        {creditError && (
          <div className="p-6 h-full flex items-center justify-center">
             <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-red-800">Insufficient Credits</h3>
                  <p className="text-red-600 text-sm">You&apos;ve run out of credits</p>
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {creditError.service.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Credits needed:</span>
                  <span className="font-medium text-red-600">{creditError.credits_needed}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Your balance:</span>
                  <span className="font-medium text-gray-800">{creditError.available_credits}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/dashboard/billing')}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FA5F55] to-[#FF8C42] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Get More Credits
                </button>
                <button
                  onClick={() => setCreditError(null)}
                  className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {error && !creditError && (
          <div className="text-red-600 p-6 overflow-auto">
            <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden max-w-3xl mx-auto">
              {/* Error Content */}
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

        {/* Content Display */}
        {!error && !creditError && previewUrl && (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
             {type === 'document' ? (
              <div className="min-h-full p-8 flex flex-col items-center gap-6">
                 <Document
                    key={previewUrl}
                    file={previewUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col gap-6"
                    loading={
                      <div className="flex items-center gap-2 text-gray-500 p-4">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading PDF...</span>
                      </div>
                    }
                 >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page 
                        key={`page_${index + 1}`} 
                        pageNumber={index + 1} 
                        renderTextLayer={false} 
                        renderAnnotationLayer={false}
                        className="shadow-xl bg-white"
                        width={600} // Default width, can make responsive if needed
                      />
                    ))}
                 </Document>
              </div>
            ) : (
              <div className="p-4 min-h-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="LaTeX Preview"
                  className="max-w-full h-auto shadow-lg rounded border"
                />
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !previewUrl && latexCode && (
          <div className="text-gray-500 text-center p-6 flex flex-col items-center justify-center flex-1">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium mb-2">Preview Ready</p>
            <p className="text-sm">Click "Refresh" to generate preview</p>
          </div>
        )}

        {!latexCode && (
          <div className="text-gray-400 text-center p-6 flex flex-col items-center justify-center flex-1">
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