"use client";

import { useState } from 'react';
import { latexService } from '@/services/latexService';

interface ImageToLatexProps {
  onLatexGenerated?: (latexCode: string) => void;
}

const ImageToLatex: React.FC<ImageToLatexProps> = ({ onLatexGenerated }) => {
  const [latexCode, setLatexCode] = useState<string>('');
  const [originalText, setOriginalText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isImproved, setIsImproved] = useState<boolean>(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy.');
    }
  };

  const handleSubmit = async (image: File) => {
    setLoading(true);
    setError('');
    setLatexCode('');
    setOriginalText('');
    setProcessingStep('');
    setIsImproved(false);

    let extracted: string = '';

    try {
      setProcessingStep('Extracting text with OCR + AI...');

      const res = await latexService.processImage(image, 'text');
      console.log('Backend response:', res);

      const payload = res.data?.data; // ✅ Corrected: using data.data

      if (!res.success) {
        setError(res.error || 'Processing failed');
        return;
      }

      extracted = payload.latex_code || '';
      setOriginalText(payload.text || payload.original_text || '');
      setIsImproved(payload.improved || false);

      console.log('Extracted LaTeX:', extracted);
      setLatexCode(extracted);
      setProcessingStep('Complete! LaTeX code generated.');

      if (onLatexGenerated) {
        onLatexGenerated(extracted);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        className="p-4 border rounded shadow bg-white max-w-md mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          const file = fileInput?.files?.[0];
          if (file) {
            await handleSubmit(file);
          }
        }}
      >
        <h2 className="text-lg font-bold mb-2">Image to LaTeX Converter</h2>
        <p className="text-sm text-gray-600 mb-4">Extract text from images using OCR + AI</p>
        <div className="mb-4">
          <input id="fileInput" type="file" accept="image/*" />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Convert to LaTeX
        </button>
      </form>

      {loading && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 font-medium">
            {processingStep || 'Processing image...'}
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-medium">Error: {error}</div>
        </div>
      )}

      {/* Original extracted text (before LaTeX formatting) */}
      {originalText && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-700">📝 Extracted Text</h4>
            <button
              onClick={() => handleCopy(originalText)}
              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Copy
            </button>
          </div>
          <pre className="text-xs whitespace-pre-wrap text-gray-600 bg-gray-100 p-2 rounded">
            {originalText}
          </pre>
        </div>
      )}

      {/* Final LaTeX code removed as requested */}

      {!loading && !error && !latexCode && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-gray-500 mb-2">
            <span className="text-2xl">📤</span>
          </div>
          <h4 className="font-medium text-gray-700 mb-1">Upload an Image</h4>
          <p className="text-sm text-gray-500">
            Upload an image to extract text using OCR + AI
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageToLatex;