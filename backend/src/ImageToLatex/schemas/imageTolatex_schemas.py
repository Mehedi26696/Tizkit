from pydantic import BaseModel
from typing import Optional

# AI Helper schemas
class FixLatexRequest(BaseModel):
    latex_code: str
    error_message: Optional[str] = ""

class FixLatexResponse(BaseModel):
    success: bool
    fixed_code: Optional[str] = None
    suggestions: list = []
    explanation: Optional[str] = None

class ExplainErrorRequest(BaseModel):
    error_message: str
    latex_code: Optional[str] = ""

class ExplainErrorResponse(BaseModel):
    success: bool
    explanation: str
    suggestions: list = []

# OCR schemas
class OCRResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    data: Optional[dict] = None

# Pix2Tex schemas
class Pix2TexResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    data: Optional[dict] = None

# Gemini schemas
class GeminiFixLatexRequest(BaseModel):
    latex_code: str

class GeminiResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    data: Optional[dict] = None