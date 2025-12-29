import os
import re
import sys
import base64
import logging
import subprocess
import tempfile
from typing import Dict, Any

import httpx
from src.config import get_settings

# Get settings instance
settings = get_settings()

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google Gemini API (text + vision)."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or ""
        self.base_url = settings.GEMINI_BASE_URL

    async def call_api(self, prompt: str, content: str) -> Dict[str, Any]:
        """Helper function to call Gemini API with custom prompt."""
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API key not configured or service disabled",
                    "data": None,
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
                response = await client.post(
                    self.base_url, headers=headers, params=params, json=payload
                )

            if response.status_code == 403:
                return {
                    "success": False,
                    "error": "Gemini API key is invalid or quota exceeded",
                    "data": None,
                }
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Gemini API returned status {response.status_code}",
                    "data": None,
                }

            try:
                result = response.json()
                fixed_content = result["candidates"][0]["content"]["parts"][0]["text"]
                return {"success": True, "error": None, "data": {"content": fixed_content}}
            except Exception as e:
                logger.error(f"Failed to parse Gemini response: {str(e)}")
                return {
                    "success": False,
                    "error": "Failed to parse Gemini response",
                    "data": None,
                }

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {"success": False, "error": f"Gemini API error: {str(e)}", "data": None}

    async def explain_error(self, error_message: str, latex_code: str = "") -> Dict[str, Any]:
        prompt = (
            "Explain this LaTeX compilation error in simple terms and provide specific solutions.\n\n"
            f"LaTeX code context: {latex_code[:500]}...\n\n"
            f"Error message: {error_message}\n\n"
            "Instructions:\n"
            "- Explain what the error means in plain English\n"
            "- Provide 2-5 concrete fixes (specific commands/packages/syntax)\n"
            "- If the error is likely caused by a missing package, name it\n"
            "- If the error is likely caused by a missing brace/environment, point where to look\n"
            "- Keep it short and actionable\n"
        )
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
                    "data": None,
                }

            headers = {"Content-Type": "application/json"}
            prompt = (
                "You are an AI assistant. Extract all readable content from the image, including text, "
                "mathematical formulas, and objects. If you detect math, return the LaTeX code. "
                "If you detect text, return the text. Summarize the image content in a concise way."
            )

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/png", "data": image_b64}},
                        ]
                    }
                ]
            }
            params = {"key": self.api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url, headers=headers, params=params, json=payload
                )

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Gemini API returned status {response.status_code}",
                    "data": None,
                }

            try:
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                return {"success": True, "error": None, "data": {"content": content}}
            except Exception as e:
                logger.error(f"Failed to parse Gemini vision response: {str(e)}")
                return {
                    "success": False,
                    "error": "Failed to parse Gemini vision response",
                    "data": None,
                }

        except Exception as e:
            logger.error(f"Gemini vision API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini vision API error: {str(e)}",
                "data": None,
            }


class OCRService:
    """Service for OCR text extraction."""

    def __init__(self):
        self.api_key = settings.OCR_SPACE_API_KEY or ""
        self.base_url = settings.OCR_SPACE_BASE_URL

    async def extract_text(self, image_content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        """Extract text from image using OCR.space API."""
        try:
            if not settings.is_ocr_configured():
                return {"success": False, "error": "OCR.space API key not configured or service disabled", "text": None}

            files = {"file": (filename, image_content, content_type)}
            data = {
                "apikey": self.api_key,
                "language": "eng",
                "isOverlayRequired": False,
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, data=data, files=files)

            if response.status_code == 403:
                return {"success": False, "error": "OCR.space API key is invalid or quota exceeded", "text": None}
            if response.status_code != 200:
                return {"success": False, "error": f"OCR.space API returned status {response.status_code}", "text": None}

            try:
                result = response.json()
            except Exception as e:
                return {"success": False, "error": f"Failed to parse OCR.space response as JSON: {str(e)}", "text": None}

            if result.get("IsErroredOnProcessing"):
                error_msg = result.get("ErrorMessage", "OCR failed")
                return {"success": False, "error": f"OCR processing failed: {error_msg}", "text": None}

            parsed_results = result.get("ParsedResults", [])
            if not parsed_results:
                return {"success": False, "error": "No text found in the image", "text": None}

            text = (parsed_results[0].get("ParsedText", "") or "").strip()
            if not text:
                return {"success": False, "error": "No text found in the image", "text": None}

            return {"success": True, "error": None, "text": text}

        except Exception as e:
            logger.error(f"OCR error: {str(e)}")
            return {"success": False, "error": f"Internal server error: {str(e)}", "text": None}


class ImageToLatexService:
    """Service for OCR-to-LaTeX pipeline with Gemini, Groq, and Vision fallback."""

    def __init__(self):
        # Gemini
        self.gemini_api_key = settings.GEMINI_API_KEY or ""
        self.gemini_base_url = settings.GEMINI_BASE_URL

        # Groq
        self.groq_api_key = settings.GROQ_API_KEY or ""
        self.groq_base_url = settings.GROQ_BASE_URL
        self.groq_model = settings.GROQ_MODEL

        # OCR
        self.ocr_service = OCRService()

    async def _call_gemini(self, prompt: str, content: str) -> Dict[str, Any]:
        try:
            if not settings.is_gemini_configured():
                return {"success": False, "error": "Gemini API key not configured or service disabled", "data": None}

            headers = {"Content-Type": "application/json"}
            payload = {"contents": [{"parts": [{"text": f"{prompt}\n\nContent to process:\n{content}"}]}]}
            params = {"key": self.gemini_api_key}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.gemini_base_url, headers=headers, params=params, json=payload)

            if response.status_code == 403:
                return {"success": False, "error": "Gemini API key is invalid or quota exceeded", "data": None}
            if response.status_code != 200:
                return {"success": False, "error": f"Gemini API returned status {response.status_code}", "data": None}

            try:
                result = response.json()
                fixed_content = result["candidates"][0]["content"]["parts"][0]["text"]
                return {"success": True, "error": None, "data": {"content": fixed_content}}
            except Exception as e:
                logger.error(f"Failed to parse Gemini response: {str(e)}")
                return {"success": False, "error": "Failed to parse Gemini response", "data": None}

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {"success": False, "error": f"Gemini API error: {str(e)}", "data": None}

    async def _call_groq(self, prompt: str, content: str) -> Dict[str, Any]:
        try:
            if not settings.is_groq_configured():
                return {"success": False, "error": "Groq API key not configured or service disabled", "data": None}

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.groq_api_key}",
            }
            payload = {
                "model": self.groq_model,
                "messages": [{"role": "user", "content": f"{prompt}\n\nContent to process:\n{content}"}],
                "temperature": 0.1,
                "max_tokens": 4096,
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.groq_base_url, headers=headers, json=payload)

            if response.status_code == 401:
                return {"success": False, "error": "Groq API key is invalid", "data": None}
            if response.status_code == 429:
                return {"success": False, "error": "Groq API rate limit exceeded", "data": None}
            if response.status_code != 200:
                return {"success": False, "error": f"Groq API returned status {response.status_code}", "data": None}

            try:
                result = response.json()
                fixed_content = result["choices"][0]["message"]["content"]
                return {"success": True, "error": None, "data": {"content": fixed_content}}
            except Exception as e:
                logger.error(f"Failed to parse Groq response: {str(e)}")
                return {"success": False, "error": "Failed to parse Groq response", "data": None}

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return {"success": False, "error": f"Groq API error: {str(e)}", "data": None}

    async def fix_latex(self, latex_code: str) -> Dict[str, Any]:
        """
        Fix LaTeX (especially OCR output) and return compilable LaTeX.
        Logic preserved:
        - Try Gemini first
        - Fallback to Groq (if configured)
        - Post-process: strip code fences, escape stray &, wrap into minimal document if needed
        """
        prompt = (
            "Fix this LaTeX so it compiles.\n"
            "- Preserve the original meaning and structure\n"
            "- Fix common OCR LaTeX mistakes (missing braces, wrong commands, broken environments)\n"
            "- If tables exist, keep tabular environments valid\n"
            "- Return ONLY the corrected LaTeX (no explanation)\n"
        )

        result = await self._call_gemini(prompt, latex_code)
        if not result.get("success") and settings.is_groq_configured():
            result = await self._call_groq(prompt, latex_code)

        if result.get("success") and result.get("data") and result["data"].get("content"):
            content = (result["data"]["content"] or "").strip()

            # Remove fenced blocks if model returns ```latex ... ```
            content = re.sub(r"^```(?:latex|text)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

            # If any remaining fenced blocks exist, convert to verbatim
            if "```" in content:
                content = re.sub(
                    r"```(?:text|latex)?(.*?)```",
                    r"\\begin{verbatim}\1\\end{verbatim}",
                    content,
                    flags=re.DOTALL,
                )

            def escape_ampersands(text: str) -> str:
                tabular_pattern = r"\\begin\{tabular\}.*?\\end\{tabular\}"
                math_pattern = r"\$.*?\$"

                blocks = []
                for m in re.finditer(tabular_pattern, text, re.DOTALL):
                    blocks.append((m.start(), m.end()))
                for m in re.finditer(math_pattern, text, re.DOTALL):
                    blocks.append((m.start(), m.end()))

                blocks.sort()
                out = []
                idx = 0
                for start, end in blocks:
                    chunk = text[idx:start].replace("&", r"\&")
                    out.append(chunk)
                    out.append(text[start:end])
                    idx = end
                out.append(text[idx:].replace("&", r"\&"))
                return "".join(out)

            content = escape_ampersands(content)

            # Wrap if it doesn't already look like a full document
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
        """
        Fix and improve OCR text:
        - If math-looking, convert to proper LaTeX
        - Otherwise grammar/punctuation fix
        - Return only corrected text
        - Try Gemini first, fallback to Groq
        """
        prompt = (
            "Fix and improve this text extracted from an image using OCR.\n"
            "- If the text appears to be mathematical content, convert it to proper LaTeX format\n"
            "- If it's regular text, ensure proper grammar and punctuation\n"
            "- Preserve the original meaning and structure\n"
            "- Return only the corrected text without any explanation\n"
        )

        result = await self._call_gemini(prompt, text)
        if not result.get("success") and settings.is_groq_configured():
            result = await self._call_groq(prompt, text)
        return result

    async def explain_error(self, error_message: str, latex_code: str = "") -> Dict[str, Any]:
        prompt = (
            "Explain this LaTeX compilation error in simple terms and provide specific solutions.\n\n"
            f"LaTeX code context: {latex_code[:500]}...\n\n"
            f"Error message: {error_message}\n\n"
            "Instructions:\n"
            "- Explain what the error means in plain English\n"
            "- Provide 2-5 concrete fixes (specific commands/packages/syntax)\n"
            "- Keep it short and actionable\n"
        )

        result = await self._call_gemini(prompt, error_message)
        if not result.get("success") and settings.is_groq_configured():
            result = await self._call_groq(prompt, error_message)
        return result

    async def extract_image_content(self, image_bytes: bytes, filename: str = "image.png") -> Dict[str, Any]:
        """Extract content from an image using Gemini vision model."""
        try:
            if not settings.is_gemini_configured():
                return {"success": False, "error": "Gemini API key not configured or service disabled", "data": None}

            headers = {"Content-Type": "application/json"}
            prompt = (
                "You are an AI assistant. Extract all readable content from the image, including text, "
                "mathematical formulas, and objects. If you detect math, return the LaTeX code. "
                "If you detect text, return the text. Summarize the image content in a concise way."
            )

            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/png", "data": image_b64}},
                        ]
                    }
                ]
            }
            params = {"key": self.gemini_api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.gemini_base_url, headers=headers, params=params, json=payload)

            if response.status_code != 200:
                return {"success": False, "error": f"Gemini API returned status {response.status_code}", "data": None}

            try:
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                return {"success": True, "error": None, "data": {"content": content}}
            except Exception as e:
                logger.error(f"Failed to parse Gemini vision response: {str(e)}")
                return {"success": False, "error": "Failed to parse Gemini vision response", "data": None}

        except Exception as e:
            logger.error(f"Gemini vision API error: {str(e)}")
            return {"success": False, "error": f"Gemini vision API error: {str(e)}", "data": None}


class Pix2TexService:
    """Service for converting mathematical images to LaTeX using Pix2Tex."""

    def __init__(self):
        pass

    async def extract_latex(self, image_content: bytes) -> Dict[str, Any]:
        """Extract LaTeX code from formula image using Pix2Tex."""
        try:
            # Check if pix2tex is available as Python module
            try:
                import pix2tex  # noqa: F401
            except ImportError:
                return {
                    "success": False,
                    "error": "Pix2Tex is not installed. Please install pix2tex package.",
                    "latex_code": None,
                }

            # Save image to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(image_content)
                tmp_path = tmp.name

            try:
                result = subprocess.run(
                    [sys.executable, "-m", "pix2tex", tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=120,
                )

                if result.returncode != 0:
                    error_msg = result.stderr.strip() if result.stderr else "Unknown error"
                    return {"success": False, "error": f"Pix2Tex processing failed: {error_msg}", "latex_code": None}

                latex_code = (result.stdout or "").strip()
                clean_latex = self._clean_pix2tex_output(latex_code)

                if not clean_latex or len(clean_latex) < 3:
                    return {"success": False, "error": "No LaTeX formula detected in the image", "latex_code": None}

                return {"success": True, "error": None, "latex_code": clean_latex}

            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "error": (
                        "Pix2Tex processing timed out. This may happen on first run while downloading models. "
                        "Please try again."
                    ),
                    "latex_code": None,
                }
            except Exception as e:
                logger.error(f"Pix2Tex error: {e}")
                return {"success": False, "error": f"Pix2Tex processing failed: {str(e)}", "latex_code": None}
            finally:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Pix2Tex error: {str(e)}")
            return {"success": False, "error": f"Internal server error: {str(e)}", "latex_code": None}

    def _clean_pix2tex_output(self, latex_code: str) -> str:
        """Clean up pix2tex output to extract just the LaTeX formula."""
        clean_latex = latex_code.strip()

        # Remove download messages first
        lines = clean_latex.split("\n")
        content_lines = [
            line for line in lines
            if not ("download" in line.lower() and "weights" in line.lower())
        ]
        clean_latex = "\n".join(content_lines).strip()

        # Handle filepath prefix: "C:\path\file.png: \latex{formula}"
        if ".png:" in clean_latex or ".jpg:" in clean_latex or ".jpeg:" in clean_latex:
            match = re.search(r"\.(?:png|jpg|jpeg):\s*(.+)", clean_latex)
            if match:
                clean_latex = match.group(1).strip()

        # Remove any remaining noisy path at the start
        if clean_latex.startswith("\\") and ("Users" in clean_latex or "temp" in clean_latex.lower()):
            latex_match = re.search(
                r"(\\(?:left|right|frac|sum|int|alpha|beta|gamma|delta|pi|mu|sigma|theta|lambda|omega|mathrm|mathit|mathbf|stackrel).+)",
                clean_latex,
            )
            if latex_match:
                clean_latex = latex_match.group(1).strip()

        return clean_latex


# Global service instances
image_to_latex_service = ImageToLatexService()
ocr_service = OCRService()
pix2tex_service = Pix2TexService()
