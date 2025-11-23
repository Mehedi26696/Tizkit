import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const latexService = {

  async generateLatex({ type, data }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; data: any }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `${BASE_URL}/table/generate`;
        break;
      case 'diagram':
        endpoint = `${BASE_URL}/diagram/generate`;
        break;
      case 'imageToLatex':
        endpoint = `${BASE_URL}/image_to_latex/pix2tex-formula`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `${BASE_URL}/handwritten_flowchart/generate-latex`;
        break;
      default:
        throw new Error('Invalid type specified');
    }

    return axios.post(endpoint, { data });
  },

  async preview({ type, data, latex_code, output_format }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; data?: any; latex_code: string; output_format: 'pdf' | 'png' }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `${BASE_URL}/table/preview`;
        break;
      case 'diagram':
        endpoint = `${BASE_URL}/diagram/preview`;
        break;
      case 'imageToLatex':
        endpoint = `${BASE_URL}/image_to_latex/preview`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `${BASE_URL}/handwritten_flowchart/compile`;
        break;
      default:
        throw new Error('Invalid type specified');
    }

    return axios.post(endpoint, { data, latex_code, output_format }, { responseType: 'blob' });
  },

  async compile({ type, latex_code, output_format }: { type: 'table' | 'diagram' | 'imageToLatex' | 'handwrittenFlowchart'; latex_code: string; output_format: 'pdf' | 'png' }) {
    let endpoint = '';

    switch (type) {
      case 'table':
        endpoint = `${BASE_URL}/table/compile`;
        break;
      case 'diagram':
        endpoint = `${BASE_URL}/diagram/compile`;
        break;
      case 'imageToLatex':
        endpoint = `${BASE_URL}/image_to_latex/compile`;
        break;
      case 'handwrittenFlowchart':
        endpoint = `${BASE_URL}/handwritten_flowchart/compile`;
        break;
      default:
        throw new Error('Invalid type specified');
    }
    
    return axios.post(endpoint, { 
      latex_code, 
      output_format 
    }, { 
      responseType: 'blob' 
    });
  },

  async processImage(image: File, type: 'text' | 'formula'): Promise<{ success: boolean; data?: any; error?: string }> {
    let endpoint = '';
    if (type === 'text') {
      endpoint = `${BASE_URL}/image_to_latex/ocr-text`;
    } else if (type === 'formula') {
      endpoint = `${BASE_URL}/image_to_latex/pix2tex-formula`;
    } else {
      throw new Error('Invalid extraction type');
    }
    const formData = new FormData();
    formData.append('image', image);
    try {
      const res = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error?.response?.data?.detail || error.message };
    }
  },
};