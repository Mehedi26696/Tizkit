import apiClient from '@/lib/api/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Credit error interface for 402 responses
export interface CreditError {
  error: string;
  service: string;
  credits_needed: number;
  available_credits: number;
  plan_type: string;
}

// Check if an error detail is a credit error object
export function isCreditError(detail: any): detail is CreditError {
  return (
    detail &&
    typeof detail === 'object' &&
    'credits_needed' in detail &&
    'available_credits' in detail
  );
}

// Helper to extract error message from API error
export function getErrorMessage(error: any): string | CreditError {
  const detail = error?.response?.data?.detail;
  
  if (isCreditError(detail)) {
    return detail; // Return the full credit error object
  }
  
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (detail?.error && typeof detail.error === 'string') {
    return detail.error;
  }
  
  return error?.message || 'An unexpected error occurred';
}

export const latexService = {

  async generateLatex({ type, data }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; data: any }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `/table/generate`;
        break;
      case 'diagram':
        endpoint = `/diagram/generate`;
        break;
      case 'imageToLatex':
        endpoint = `/image_to_latex/pix2tex-formula`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `/handwritten_flowchart/generate-latex`;
        break;
      default:
        throw new Error('Invalid type specified');
    }

    return apiClient.post(endpoint, { data });
  },

  async preview({ type, data, latex_code, output_format }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; data?: any; latex_code: string; output_format: 'pdf' | 'png' }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `/table/preview`;
        break;
      case 'diagram':
        endpoint = `/diagram/preview`;
        break;
      case 'imageToLatex':
        endpoint = `/image_to_latex/preview`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `/handwritten_flowchart/compile`;
        break;
      default:
        throw new Error('Invalid type specified');
    }

    return apiClient.post(endpoint, { data, latex_code, output_format }, { responseType: 'blob' });
  },

  async compile({ type, latex_code, output_format }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; latex_code: string; output_format: 'pdf' | 'png' }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `/table/compile`;
        break;
      case 'diagram':
        endpoint = `/diagram/compile`;
        break;
      case 'imageToLatex':
        endpoint = `/image_to_latex/compile`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `/handwritten_flowchart/compile`;
        break;
      default:
        throw new Error('Invalid type specified');
    }
    
    return apiClient.post(endpoint, { 
      latex_code, 
      output_format 
    }, { 
      responseType: 'blob' 
    });
  },

  async processImage(image: File): Promise<{ success: boolean; data?: any; error?: string; creditError?: CreditError }> {
    const endpoint = `/image_to_latex/ocr-text`;
    const formData = new FormData();
    formData.append('image', image);
    try {
      const res = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      const errorResult = getErrorMessage(error);
      if (isCreditError(errorResult)) {
        return { success: false, creditError: errorResult };
      }
      return { success: false, error: errorResult };
    }
  },

  async processHandwrittenFlowchart(image: File): Promise<{ success: boolean; data?: any; error?: string; creditError?: CreditError }> {
    const endpoint = `/handwritten_flowchart/process-complete`;
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', 'Handwritten Flowchart');
    formData.append('style', 'enhanced');
    try {
      const res = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        return { 
          success: true, 
          data: { 
            latex_code: res.data.latex_code,
            analysis_data: res.data.analysis_data,
            used_fallback: res.data.used_fallback
          }
        };
      }
      return { success: false, error: res.data.error || 'Processing failed' };
    } catch (error: any) {
      const errorResult = getErrorMessage(error);
      if (isCreditError(errorResult)) {
        return { success: false, creditError: errorResult };
      }
      return { success: false, error: errorResult };
    }
  },

  async fixLatexWithError(latexCode: string, errorMessage: string): Promise<{ success: boolean; fixedLatex?: string; error?: string; creditError?: CreditError }> {
    const endpoint = `/image_to_latex/fix-latex`;
    try {
      const res = await apiClient.post(endpoint, {
        latex_code: latexCode,
        error_message: errorMessage,
      });
      if (res.data.success && res.data.fixed_latex) {
        return { success: true, fixedLatex: res.data.fixed_latex };
      }
      return { success: false, error: res.data.error || 'Failed to fix LaTeX' };
    } catch (error: any) {
      const errorResult = getErrorMessage(error);
      if (isCreditError(errorResult)) {
        return { success: false, creditError: errorResult };
      }
      return { success: false, error: errorResult };
    }
  },
};