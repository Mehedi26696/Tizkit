"""
ImageToLatex Services Module

This module provides AI-powered services for image-to-LaTeX conversion:
- GeminiService: Google Gemini API for LaTeX fixing and text improvement
- OCRService: OCR.space API for text extraction from images
- Pix2TexService: Pix2Tex for mathematical formula recognition

Usage:
    from src.ImageToLatex.services import gemini_service, ocr_service, pix2tex_service
"""

from .gemini_service import GeminiService
from .ocr_service import OCRService
from .imageTolatex_services import Pix2TexService

# Global service instances for easy import
gemini_service = GeminiService()
ocr_service = OCRService()
pix2tex_service = Pix2TexService()

__all__ = [
    'GeminiService',
    'OCRService',
    'Pix2TexService',
    'gemini_service',
    'ocr_service',
    'pix2tex_service',
]
