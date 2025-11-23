'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Copy, Upload } from 'lucide-react';
import LatexPreview from '@/app/(protected)/functions/LatexPreview';
import ExportModal from '@/app/(protected)/functions/ExportModal';

export default function ImageToLatexPage() {
  const [latexCode, setLatexCode] = React.useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [confidence, setConfidence] = React.useState<number>(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('method', 'text');

      // const result = await latexService.convertImageToLatex(formData);
      // For now, we'll simulate the service call
      const result = { 
        data: { 
          latex_code: '\\frac{d}{dx}[f(x)] = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
          confidence: 85 
        } 
      };
      if (result.data) {
        setLatexCode(result.data.latex_code);
        setConfidence(result.data.confidence || 0);
      }
    } catch (error) {
      console.error('Failed to process image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setLatexCode('');
    setConfidence(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 font-aloevera">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={() => window.history.back()}
              >
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-aloevera-condensed">T</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Tizkit
                </h1>
                <span className="text-gray-400">•</span>
                <h2 className="text-lg font-semibold text-gray-800">Image to LaTeX</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="success"
                size="md"
                onClick={processImage}
                disabled={isProcessing || !uploadedImage}
                isLoading={isProcessing}
              >
                Process Image
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsExportModalOpen(true)}
                disabled={!latexCode.trim() || isProcessing}
                leftIcon={<DownloadIcon className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload */}
          <div>
            <Card variant="glass" padding="lg">
              <CardHeader
                title="Image Upload"
                description="Upload mathematical equations, formulas, or text images"
                icon={
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📷</span>
                  </div>
                }
                action={
                  uploadedImage && (
                    <Button variant="outline" size="sm" onClick={clearImage}>
                      Clear
                    </Button>
                  )
                }
              />
              <CardContent>
                {!imagePreview ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                    onDrop={handleImageDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Drop image here or click to browse
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Supports PNG, JPG, JPEG, WebP (max 10MB)
                        </p>
                        <Button variant="primary" size="sm">
                          Choose File
                        </Button>
                      </div>
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Uploaded mathematical content"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>File:</strong> {uploadedImage?.name} ({Math.round((uploadedImage?.size || 0) / 1024)}KB)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Options */}
            <Card variant="default" padding="md" className="mt-6">
              <CardHeader title="About OCR Processing" />
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Our OCR + AI system extracts text from images and converts it to properly formatted LaTeX code.
                  </p>
                  <div className="text-sm text-gray-700">
                    <strong>How it works:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                      <li>Extract text using OCR technology</li>
                      <li>Enhance with AI-powered formatting</li>
                      <li>Generate clean LaTeX code</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card variant="default" padding="md" className="mt-6">
              <CardHeader title="Tips for Better Results" />
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Ensure good contrast between text and background</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Avoid blurry or low-resolution images</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Crop to focus on the text content</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>Use clear, well-lit images for best OCR results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview and LaTeX Code */}
          <div className="space-y-6">
            {/* LaTeX Preview */}
            <Card variant="glass" padding="lg">
              <CardHeader
                title="LaTeX Preview"
                description="Processed mathematical content"
                icon={
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👁️</span>
                  </div>
                }
                action={
                  <div className="flex items-center space-x-2">
                    {confidence > 0 && (
                      <Badge 
                        variant={confidence > 80 ? "success" : confidence > 60 ? "warning" : "danger"} 
                        size="sm"
                      >
                        {confidence.toFixed(0)}% confidence
                      </Badge>
                    )}
                    {latexCode && <Badge variant="success" size="sm">Processed</Badge>}
                  </div>
                }
              />
              <CardContent>
                {latexCode ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <LatexPreview latexCode={latexCode} type="imageToLatex" />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h4 className="font-semibold text-gray-700 mb-2">Preview Area</h4>
                    <p className="text-sm text-gray-500">
                      Upload and process an image to see the extracted LaTeX here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LaTeX Code */}
            <Card variant="default" padding="lg">
              <CardHeader
                title="Extracted LaTeX Code"
                description="Generated LaTeX from your image"
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
                    <Badge variant="success" size="sm">Math Mode Ready</Badge>
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
                    <h4 className="font-semibold text-gray-700 mb-2">No LaTeX Code Yet</h4>
                    <p className="text-sm text-gray-500">
                      Process an image to extract LaTeX code.
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
              {isProcessing && (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-emerald-600">Processing image...</span>
                </>
              )}
              {!isProcessing && latexCode && (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">LaTeX Extracted</span>
                  <Badge variant="success" size="sm">
                    {latexCode.split('\n').length} lines
                  </Badge>
                  {confidence > 0 && (
                    <Badge 
                      variant={confidence > 80 ? "success" : confidence > 60 ? "warning" : "danger"} 
                      size="sm"
                    >
                      {confidence.toFixed(0)}% accuracy
                    </Badge>
                  )}
                </>
              )}
              {!isProcessing && !latexCode && (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Upload an image to get started</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" size="sm">OCR + AI</Badge>
              <Badge variant="primary" size="sm">Image to LaTeX</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        latexCode={latexCode}
        type="imageToLatex"
      />
    </div>
  );
}