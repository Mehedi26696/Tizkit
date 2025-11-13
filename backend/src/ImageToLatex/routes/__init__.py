from fastapi import APIRouter

from .ocr_text import ocr_router
from .compile import compile_router



__all__ = [
    "ImageToLatex_Router",
    "ocr_router", 
    "compile_router"
]

ImageToLatex_Router = APIRouter()

ImageToLatex_Router.include_router(ocr_router)
ImageToLatex_Router.include_router(compile_router)