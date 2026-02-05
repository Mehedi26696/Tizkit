import logging
from typing import Dict, Any
import httpx

from src.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class CopilotService:
    def __init__(self) -> None:
        self.gemini_key = settings.GEMINI_API_KEY or ""
        self.gemini_url = settings.GEMINI_BASE_URL
        self.groq_key = settings.GROQ_API_KEY or ""
        self.groq_url = settings.GROQ_BASE_URL
        self.groq_model = settings.GROQ_MODEL

    def _build_prompt(self, message: str, context: Dict[str, Any]) -> str:
        latex = (context.get("latex") or "").strip()
        selection = (context.get("selection") or "").strip()
        errors = (context.get("errors") or "").strip()
        editor_type = (context.get("editor_type") or "").strip()

        return (
            "You are a LaTeX copilot for an editor.\n"
            "Provide a concise response and a LaTeX snippet suitable for insertion.\n"
            "Return plain text only; no markdown fences.\n\n"
            f"Editor type: {editor_type or 'unknown'}\n"
            f"User request: {message}\n\n"
            f"Current LaTeX (may be empty):\n{latex}\n\n"
            f"Selection (may be empty):\n{selection}\n\n"
            f"Compilation errors (may be empty):\n{errors}\n\n"
            "Respond with three sections:\n"
            "REPLY: <human friendly explanation>\n"
            "INSERT: <latex snippet to insert>\n"
            "TARGET: <exact snippet from Current LaTeX to replace; leave blank if append>\n"
        )

    async def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        if not settings.is_gemini_configured():
            return {"success": False, "error": "Gemini not configured", "data": None}

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }
        params = {"key": self.gemini_key}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.gemini_url, headers=headers, params=params, json=payload)

        if response.status_code != 200:
            return {"success": False, "error": f"Gemini status {response.status_code}", "data": None}

        try:
            result = response.json()
            content = result["candidates"][0]["content"]["parts"][0]["text"]
            return {"success": True, "error": None, "data": {"content": content}}
        except Exception as e:
            logger.error(f"Copilot Gemini parse error: {e}")
            return {"success": False, "error": "Failed to parse Gemini response", "data": None}

    async def _call_groq(self, prompt: str) -> Dict[str, Any]:
        if not settings.is_groq_configured():
            return {"success": False, "error": "Groq not configured", "data": None}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.groq_key}",
        }
        payload = {
            "model": self.groq_model,
            "messages": [
                {"role": "system", "content": "You are a LaTeX copilot."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.groq_url, headers=headers, json=payload)

        if response.status_code != 200:
            return {"success": False, "error": f"Groq status {response.status_code}", "data": None}

        try:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return {"success": True, "error": None, "data": {"content": content}}
        except Exception as e:
            logger.error(f"Copilot Groq parse error: {e}")
            return {"success": False, "error": "Failed to parse Groq response", "data": None}

    async def chat(self, message: str, context: Dict[str, Any], provider: str = "auto") -> Dict[str, Any]:
        prompt = self._build_prompt(message, context)

        if provider == "groq":
            return await self._call_groq(prompt)
        if provider == "gemini":
            return await self._call_gemini(prompt)

        result = await self._call_gemini(prompt)
        if not result.get("success"):
            result = await self._call_groq(prompt)
        return result


def parse_reply_insert(text: str) -> tuple[str, str, str]:
    reply = ""
    insert = ""
    target = ""
    if not text:
        return reply, insert, target

    lower = text.lower()
    markers = ["reply:", "insert:", "target:"]

    def extract_section(marker: str) -> str:
        start_idx = lower.find(marker)
        if start_idx == -1:
            return ""
        start = start_idx + len(marker)
        end = len(text)
        for other in markers:
            other_idx = lower.find(other)
            if other_idx != -1 and other_idx > start_idx:
                end = min(end, other_idx)
        return text[start:end].strip()

    reply = extract_section("reply:")
    insert = extract_section("insert:")
    target = extract_section("target:")

    if not reply and not insert and not target:
        reply = text.strip()
        insert = text.strip()

    return reply, insert, target
