"""
ImageToLatex Services Module

This module provides AI-powered services for image-to-LaTeX conversion:
- GeminiService: Google Gemini API for LaTeX fixing and text improvement
- OCRService: OCR.space API for text extraction from images

Usage:
    from src.ImageToLatex.services import gemini_service, ocr_service, image_to_latex_service
"""

from .gemini_service import GeminiService
from .ocr_service import OCRService
from .imageTolatex_services import ImageToLatexService

# Global service instances for easy import

gemini_service = GeminiService()
ocr_service = OCRService()
image_to_latex_service = ImageToLatexService()

__all__ = [
    'GeminiService',
    'OCRService',
    'ImageToLatexService',
    'gemini_service',
    'ocr_service',
    'image_to_latex_service',
]
