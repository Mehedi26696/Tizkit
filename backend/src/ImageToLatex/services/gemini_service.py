import httpx
import logging
import re
from typing import Dict, Any
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

    async def fix_latex_with_error(self, latex_code: str, error_message: str) -> Dict[str, Any]:
        """Fix LaTeX code based on the compilation error using Gemini AI"""
        prompt = f"""You are a LaTeX expert. The following LaTeX code failed to compile with the error shown below. 
Fix the code to make it compile successfully.

ERROR MESSAGE:
{error_message}

Instructions:
- Analyze the error message to understand what went wrong
- Fix the specific issue mentioned in the error
- Remove or replace any problematic packages or commands
- If the error is about missing packages, either add them or remove the commands that need them
- For "Couldn't load requested language" errors in listings package, remove the language option or replace with a supported language
- Ensure the output is a complete, compilable LaTeX document
- Return ONLY the fixed LaTeX code, no explanations or markdown code blocks

LATEX CODE TO FIX:
"""
        result = await self.call_api(prompt, latex_code)
        
        # Post-process: Clean up the response
        if result.get("success") and result.get("data") and result["data"].get("content"):
            content = result["data"]["content"].strip()
            # Remove code block markers
            content = re.sub(r"^```(?:latex|text)?\s*", "", content)
            content = re.sub(r"```$", "", content)
            content = content.strip()
            
            # Ensure it has document structure
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

            logger.info("GeminiService: Using Vision API to extract image content")

            headers = {"Content-Type": "application/json"}
            prompt = """Extract all readable content from this image, including text, mathematical formulas, and any structured data.

**RULES:**
1. If you detect mathematical formulas or equations, return them as LaTeX code
2. If you detect plain text, return the text exactly as shown
3. If you detect tables, return them in a structured format
4. Preserve the original formatting and structure as much as possible

**OUTPUT:**
Return the extracted content. If there are mathematical formulas, wrap them in LaTeX delimiters like $...$ for inline or $$...$$ for display math."""

            # Convert image to base64
            import base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            
            # Detect mime type from image bytes
            mime_type = "image/png"
            if image_bytes[:3] == b'\xff\xd8\xff':
                mime_type = "image/jpeg"
            elif image_bytes[:4] == b'\x89PNG':
                mime_type = "image/png"
            elif image_bytes[:6] in (b'GIF87a', b'GIF89a'):
                mime_type = "image/gif"
            elif image_bytes[:4] == b'RIFF' and len(image_bytes) > 12 and image_bytes[8:12] == b'WEBP':
                mime_type = "image/webp"
            
            logger.info(f"GeminiService: Image size: {len(image_bytes)} bytes, mime_type: {mime_type}")
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "topP": 0.95,
                    "topK": 40,
                    "maxOutputTokens": 4096
                }
            }
            params = {"key": self.api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, params=params, json=payload)
                
                logger.info(f"GeminiService: Vision API response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_detail = ""
                    try:
                        error_detail = response.text[:500]
                    except:
                        pass
                    logger.error(f"Gemini Vision API error response: {error_detail}")
                    return {
                        "success": False,
                        "error": f"Gemini API returned status {response.status_code}",
                        "data": None
                    }
                    
                try:
                    result = response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info(f"GeminiService: Vision API extracted {len(content)} characters")
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
            logger.error(f"Gemini vision API error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": f"Gemini vision API error: {str(e)}",
                "data": None
            }
