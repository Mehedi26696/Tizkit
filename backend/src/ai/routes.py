from fastapi import APIRouter, Depends, HTTPException

from src.ai.schemas import CopilotChatRequest, CopilotChatResponse
from src.ai.services.copilot_service import CopilotService, parse_reply_insert
from src.auth.routes import get_current_user, User

router = APIRouter()
service = CopilotService()


@router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(
    payload: CopilotChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        context = payload.context.model_dump() if payload.context else {}
        result = await service.chat(payload.message, context, payload.provider or "auto")
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "AI request failed"))

        content = result.get("data", {}).get("content", "")
        reply, insert, target = parse_reply_insert(content)

        return CopilotChatResponse(
            reply=reply or "",
            insert=insert or content,
            target=target or None,
            provider=payload.provider or "auto"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
