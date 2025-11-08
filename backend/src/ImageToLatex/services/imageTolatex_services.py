import httpx
import os
import logging
import subprocess
import tempfile
from typing import Dict, Any, Optional
from src.config import get_settings

# Get settings instance
settings = get_settings()

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or ""
        self.base_url = settings.GEMINI_BASE_URL
    
    async def call_api(self, prompt: str, content: str) -> Dict[str, Any]:
        """
        Helper function to call Gemini API with custom prompt
        """
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API key not configured or service disabled",
                    "data": None
                }
            
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{prompt}\n\nContent to process:\n{content}"}
                        ]
                    }
                ]
            }
            params = {"key": self.api_key}
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, params=params, json=payload)
                
                if response.status_code == 403:
                    return {
                        "success": False,
                        "error": "Gemini API key is invalid or quota exceeded",
                        "data": None
                    }
                elif response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Gemini API returned status {response.status_code}",
                        "data": None
                    }
                
                try:
                    result = response.json()
                    fixed_content = result["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "error": None,
                        "data": {"content": fixed_content}
                    }
                except Exception as e:
                    logger.error(f"Failed to parse Gemini response: {str(e)}")
                    return {
                        "success": False,
                        "error": "Failed to parse Gemini response",
                        "data": None
                    }
                    
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini API error: {str(e)}",
                "data": None
            }
    
    async def fix_latex(self, latex_code: str) -> Dict[str, Any]:
        """Fix LaTeX code using Gemini AI and ensure output is a compilable document for Tectonic."""
        prompt = """
You are a LaTeX expert. Given the input, return a complete, compilable LaTeX document suitable for Tectonic.

Instructions:
- If the input is plain text, convert it to proper LaTeX format.
- If the input is a LaTeX formula, ensure it's properly formatted and wrapped in a minimal document.
- Always include necessary packages (amsmath, amssymb, etc.) and document structure (\documentclass, \begin{document}, \end{document}).
- Fix any syntax errors and ensure the code compiles without errors in Tectonic.
- Return only the final LaTeX code, no explanations.

Input to process:
"""
        result = await self.call_api(prompt, latex_code)
        # Post-process: If Gemini returns only a fragment, wrap it in a minimal document
        if result.get("success") and result.get("data") and result["data"].get("content"):
            content = result["data"]["content"].strip()
            # Remove code block markers (e.g., ```latex, ```) and wrap in verbatim if needed
            import re
            # Remove opening and closing triple backticks
            content = re.sub(r"^```(?:latex|text)?\s*", "", content)
            content = re.sub(r"```$", "", content)
            # If any triple backticks remain, replace code block with verbatim environment
            if '```' in content:
                content = re.sub(r"```(?:text)?(.*?)```", r"\\begin{verbatim}\1\\end{verbatim}", content, flags=re.DOTALL)
            # Escape & outside math/table environments
            def escape_ampersands(text):
                tabular_pattern = r'\\begin\{tabular\}.*?\\end\{tabular\}'
                math_pattern = r'\$.*?\$'
                blocks = []
                for m in re.finditer(tabular_pattern, text, re.DOTALL):
                    blocks.append((m.start(), m.end()))
                for m in re.finditer(math_pattern, text, re.DOTALL):
                    blocks.append((m.start(), m.end()))
                blocks.sort()
                result_text = ''
                idx = 0
                for start, end in blocks:
                    chunk = text[idx:start]
                    chunk = chunk.replace('&', '\\&')
                    result_text += chunk
                    result_text += text[start:end]
                    idx = end
                chunk = text[idx:]
                chunk = chunk.replace('&', '\\&')
                result_text += chunk
                return result_text

            content = escape_ampersands(content)
            if "\\documentclass" not in content:
                wrapped = (
                    "\\documentclass[12pt]{article}\n"
                    "\\usepackage[utf8]{inputenc}\n"
                    "\\usepackage{amsmath,amssymb,amsfonts}\n"
                    "\\begin{document}\n"
                    f"{content}\n"
                    "\\end{document}"
                )
                result["data"]["content"] = wrapped
            else:
                result["data"]["content"] = content
        return result
    
    async def improve_text(self, text: str) -> Dict[str, Any]:
        """Improve OCR-extracted text using Gemini AI"""
        prompt = """Fix and improve this text extracted from an image using OCR.

Instructions:
- Correct any OCR errors and typos
- Fix spacing and formatting issues
- If the text appears to be mathematical content, convert it to proper LaTeX format
- If it's regular text, ensure proper grammar and punctuation
- Preserve the original meaning and structure
- Return only the corrected text without any explanation

Text to improve:"""
        
        return await self.call_api(prompt, text)
    
    async def explain_error(self, error_message: str, latex_code: str = "") -> Dict[str, Any]:
        """Explain LaTeX compilation errors using Gemini AI"""
        prompt = f"""Explain this LaTeX compilation error in simple terms and provide specific solutions.

LaTeX code context: {latex_code[:500]}...

Error message: {error_message}

Instructions:
- Explain what the error means in plain English
- Identify the specific cause of the error
- Provide step-by-step solutions to fix it
- Give examples of correct syntax if applicable
- Be concise but thorough"""
        
        return await self.call_api(prompt, error_message)

    async def extract_image_content(self, image_bytes: bytes, filename: str = "image.png") -> Dict[str, Any]:
        """
        Extract content (text, math, objects) from an image using Gemini vision model.
        Returns a summary and any detected formulas or text.
        """
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API key not configured or service disabled",
                    "data": None
                }

            headers = {"Content-Type": "application/json"}
            prompt = (
                "You are an AI assistant. Extract all readable content from the image, including text, mathematical formulas, and objects. "
                "If you detect math, return the LaTeX code. If you detect text, return the text. "
                "Summarize the image content in a concise way."
            )
            # Gemini vision API expects base64-encoded image
            import base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/png", "data": image_b64}}
                        ]
                    }
                ]
            }
            params = {"key": self.api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, params=params, json=payload)
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Gemini API returned status {response.status_code}",
                        "data": None
                    }
                try:
                    result = response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "error": None,
                        "data": {"content": content}
                    }
                except Exception as e:
                    logger.error(f"Failed to parse Gemini vision response: {str(e)}")
                    return {
                        "success": False,
                        "error": "Failed to parse Gemini vision response",
                        "data": None
                    }
        except Exception as e:
            logger.error(f"Gemini vision API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini vision API error: {str(e)}",
                "data": None
            }
    

class OCRService:
    """Service for OCR text extraction"""
    
    def __init__(self):
        self.api_key = settings.OCR_SPACE_API_KEY or ""
        self.base_url = settings.OCR_SPACE_BASE_URL
    
    async def extract_text(self, image_content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        """Extract text from image using OCR.space API"""
        try:
            if not settings.is_ocr_configured():
                return {
                    "success": False,
                    "error": "OCR.space API key not configured or service disabled",
                    "text": None
                }
            
            files = {"file": (filename, image_content, content_type)}
            data = {
                "apikey": self.api_key,
                "language": "eng",
                "isOverlayRequired": False
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, data=data, files=files)
                
                if response.status_code == 403:
                    return {
                        "success": False,
                        "error": "OCR.space API key is invalid or quota exceeded",
                        "text": None
                    }
                elif response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"OCR.space API returned status {response.status_code}",
                        "text": None
                    }
                
                try:
                    result = response.json()
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Failed to parse OCR.space response as JSON: {str(e)}",
                        "text": None
                    }
            
            # Check if OCR processing was successful
            if result.get("IsErroredOnProcessing"):
                error_msg = result.get("ErrorMessage", "OCR failed")
                return {
                    "success": False,
                    "error": f"OCR processing failed: {error_msg}",
                    "text": None
                }
            
            parsed_results = result.get("ParsedResults", [])
            if not parsed_results:
                return {
                    "success": False,
                    "error": "No text found in the image",
                    "text": None
                }
                
            text = parsed_results[0].get("ParsedText", "").strip()
            
            if not text:
                return {
                    "success": False,
                    "error": "No text found in the image",
                    "text": None
                }
            
            return {
                "success": True,
                "error": None,
                "text": text
            }
            
        except Exception as e:
            logger.error(f"OCR error: {str(e)}")
            return {
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "text": None
            }


class Pix2TexService:
    """Service for converting mathematical images to LaTeX using Pix2Tex"""
    
    def __init__(self):
        pass
    
    async def extract_latex(self, image_content: bytes) -> Dict[str, Any]:
        """Extract LaTeX code from formula image using Pix2Tex"""
        try:
            # Check if pix2tex is available as Python module
            try:
                import pix2tex
            except ImportError:
                return {
                    "success": False,
                    "error": "Pix2Tex is not installed. Please install pix2tex package.",
                    "latex_code": None
                }
            
            # Save image to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(image_content)
                tmp_path = tmp.name
            
            try:
                # Use sys.executable to ensure we use the correct Python interpreter
                import sys
                result = subprocess.run([
                    sys.executable, "-m", "pix2tex", tmp_path
                ], capture_output=True, text=True, timeout=120)
                
                if result.returncode != 0:
                    error_msg = result.stderr.strip() if result.stderr else "Unknown error"
                    return {
                        "success": False,
                        "error": f"Pix2Tex processing failed: {error_msg}",
                        "latex_code": None
                    }
                
                latex_code = result.stdout.strip()
                
                # Clean up pix2tex output
                clean_latex = self._clean_pix2tex_output(latex_code)
                
                if not clean_latex or len(clean_latex) < 3:
                    return {
                        "success": False,
                        "error": "No LaTeX formula detected in the image",
                        "latex_code": None
                    }
                
                return {
                    "success": True,
                    "error": None,
                    "latex_code": clean_latex
                }
                
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "error": "Pix2Tex processing timed out. This may happen on first run while downloading models. Please try again.",
                    "latex_code": None
                }
            except Exception as e:
                logger.error(f"Pix2Tex error: {e}")
                return {
                    "success": False,
                    "error": f"Pix2Tex processing failed: {str(e)}",
                    "latex_code": None
                }
                
            finally:
                # Clean up temp file
                try:
                    os.unlink(tmp_path)
                except:
                    pass
            
        except Exception as e:
            logger.error(f"Pix2Tex error: {str(e)}")
            return {
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "latex_code": None
            }
    
    def _clean_pix2tex_output(self, latex_code: str) -> str:
        """Clean up pix2tex output to extract just the LaTeX formula"""
        clean_latex = latex_code
        
        # Remove download messages first
        lines = clean_latex.split('\n')
        content_lines = [line for line in lines if not ('download' in line.lower() and 'weights' in line.lower())]
        clean_latex = '\n'.join(content_lines).strip()
        
        # Handle filepath prefix: "C:\path\file.png: \latex{formula}"
        if '.png:' in clean_latex or '.jpg:' in clean_latex or '.jpeg:' in clean_latex:
            # Find the colon after file extension and extract everything after it
            import re
            match = re.search(r'\.(?:png|jpg|jpeg):\s*(.+)', clean_latex)
            if match:
                clean_latex = match.group(1).strip()
        
        # Remove any remaining backslash file paths at the start
        if clean_latex.startswith('\\') and ('Users' in clean_latex or 'temp' in clean_latex.lower()):
            # Find first occurrence of LaTeX command like \left, \frac, etc.
            import re
            latex_match = re.search(r'(\\(?:left|right|frac|sum|int|alpha|beta|gamma|delta|pi|mu|sigma|theta|lambda|omega|mathrm|mathit|mathbf|stackrel).+)', clean_latex)
            if latex_match:
                clean_latex = latex_match.group(1).strip()
        
        return clean_latex


# Global service instances
gemini_service = GeminiService()
ocr_service = OCRService()
pix2tex_service = Pix2TexService()