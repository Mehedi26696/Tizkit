from pydantic import BaseModel
from typing import Optional


class CopilotContext(BaseModel):
    latex: Optional[str] = None
    selection: Optional[str] = None
    errors: Optional[str] = None
    editor_type: Optional[str] = None


class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[CopilotContext] = None
    provider: Optional[str] = "auto"  # auto | gemini | groq


class CopilotChatResponse(BaseModel):
    reply: str
    insert: str
    provider: str
