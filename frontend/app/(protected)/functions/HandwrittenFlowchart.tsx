import { useState } from 'react';

interface HandwrittenFlowchartProps {
  onLatexGenerated?: (latexCode: string) => void;
}

const HandwrittenFlowchart: React.FC<HandwrittenFlowchartProps> = ({ onLatexGenerated }) => {
  const [latexCode, setLatexCode] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [processingStep, setProcessingStep] = useState<string>('');
  const [usedFallback, setUsedFallback] = useState<boolean>(false);

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
    setAnalysisData(null);
    setProcessingStep('');
    setUsedFallback(false);

    try {
      setProcessingStep('Uploading and analyzing handwritten flowchart...');

      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', 'Handwritten Flowchart');
      formData.append('style', 'enhanced');

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${BASE_URL}/handwritten_flowchart/process-complete`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setLatexCode(result.latex_code);
        setAnalysisData(result.analysis_data);
        setUsedFallback(result.used_fallback || false);
        
        if (result.error) {
          setError(`Warning: ${result.error}`);
        }
        
        if (onLatexGenerated) {
          onLatexGenerated(result.latex_code);
        }
        
        setProcessingStep('');
      } else {
        throw new Error(result.error || 'Processing failed');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the image');
      setProcessingStep('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Handwritten Flowchart
        </h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleSubmit(file);
                }
              }}
              className="hidden"
              id="flowchart-upload"
              disabled={loading}
            />
            <label htmlFor="flowchart-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                </svg>
                <p className="text-sm text-gray-600">
                  Click to upload your handwritten flowchart image
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </label>
          </div>
          
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">{processingStep || 'Processing...'}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {usedFallback && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm">
                <strong>Note:</strong> A template was generated because the handwritten flowchart couldn't be fully analyzed. 
                Please modify the LaTeX code according to your actual flowchart.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {analysisData && !usedFallback && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Flowchart Analysis
          </h3>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
              {JSON.stringify(analysisData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandwrittenFlowchart;