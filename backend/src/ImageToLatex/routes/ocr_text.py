from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
import logging
from ..services import ocr_service, image_to_latex_service, gemini_service
from ..services.latex_reconstruct import wrap_latex
from ..schemas.imageTolatex_schemas import OCRResponse
from ...auth.middleware.credits_middleware import create_credit_checker
from ...auth.models.credits import ServiceType

from ...auth.routes import get_current_user, User
from ...utils.database import get_session

logger = logging.getLogger(__name__)

ocr_router = APIRouter()


async def extract_text_with_vision_fallback(image_content: bytes, filename: str, content_type: str) -> dict:
    """
    Extract text from image using OCR.space API with Gemini Vision fallback.
    Returns dict with 'success', 'text', 'error', and 'used_fallback' keys.
    """
    # Try OCR.space first
    ocr_result = await ocr_service.extract_text(image_content, filename, content_type)
    
    if ocr_result["success"] and ocr_result.get("text"):
        return {
            "success": True,
            "text": ocr_result["text"],
            "error": None,
            "used_fallback": False
        }
    
    # OCR failed, try Gemini Vision API as fallback
    logger.warning(f"OCR failed for {filename}, falling back to Gemini Vision API")
    
    vision_result = await gemini_service.extract_image_content(image_content, filename)
    
    if vision_result["success"] and vision_result.get("data", {}).get("content"):
        extracted_text = vision_result["data"]["content"]
        logger.info(f"Vision API fallback succeeded, extracted {len(extracted_text)} characters")
        return {
            "success": True,
            "text": extracted_text,
            "error": None,
            "used_fallback": True
        }
    
    # Both failed
    ocr_error = ocr_result.get("error", "OCR failed")
    vision_error = vision_result.get("error", "Vision API failed")
    return {
        "success": False,
        "text": None,
        "error": f"OCR failed: {ocr_error}. Vision fallback also failed: {vision_error}",
        "used_fallback": True
    }


@ocr_router.post("/ocr-text", response_model=OCRResponse)
async def ocr_text(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    credit_check: dict = Depends(create_credit_checker(ServiceType.OCR_TEXT_EXTRACTION))
):
    """
    Extract text from image using OCR.space API with Gemini Vision fallback
    """
    try:
        # Extract credit service and user info from dependency
        credits_service = credit_check["credits_service"]
        user_id = credit_check["user_id"]
        
        image_content = await image.read()
        
        # Extract text using OCR with Vision API fallback
        extraction_result = await extract_text_with_vision_fallback(
            image_content, image.filename, image.content_type
        )
        
        if not extraction_result["success"]:
            return OCRResponse(
                success=False,
                error=extraction_result["error"],
                data=None
            )
        
        original_text = extraction_result["text"]
        used_fallback = extraction_result["used_fallback"]
        
        # Try to improve the text using Gemini
        improvement_result = await image_to_latex_service.improve_text(original_text)
        
        if improvement_result["success"]:
            improved_text = improvement_result["data"]["content"].strip()
            latex_code = wrap_latex(improved_text)
            
            # Send the generated LaTeX code to Gemini for refinement
            refinement_result = await image_to_latex_service.fix_latex(latex_code)
            
            if refinement_result["success"]:
                refined_latex = refinement_result["data"]["content"].strip()
                
                # Consume credits for successful processing
                await credits_service.consume_credits(
                    user_id, 
                    ServiceType.OCR_TEXT_EXTRACTION,
                    {"filename": image.filename, "improved": True, "refined": True}
                )
                
                return OCRResponse(
                    success=True,
                    error=None,
                    data={
                        "text": improved_text,
                        "latex_code": refined_latex,
                        "original_text": original_text,
                        "original_latex": latex_code,
                        "improved": True,
                        "refined": True,
                        "used_vision_fallback": used_fallback
                    }
                )
            else:
                # Return non-refined LaTeX if refinement fails
                # Consume credits for successful processing (even without refinement)
                await credits_service.consume_credits(
                    user_id, 
                    ServiceType.OCR_TEXT_EXTRACTION,
                    {"filename": image.filename, "improved": True, "refined": False}
                )
                
                return OCRResponse(
                    success=True,
                    error=None,
                    data={
                        "text": improved_text,
                        "latex_code": latex_code,
                        "original_text": original_text,
                        "improved": True,
                        "refined": False,
                        "refinement_error": refinement_result["error"],
                        "used_vision_fallback": used_fallback
                    }
                )
        else:
            latex_code = wrap_latex(original_text)
            
            # Even with original text, try to refine the LaTeX
            refinement_result = await image_to_latex_service.fix_latex(latex_code)
            
            if refinement_result["success"]:
                refined_latex = refinement_result["data"]["content"].strip()
                
                # Consume credits for successful processing
                await credits_service.consume_credits(
                    user_id, 
                    ServiceType.OCR_TEXT_EXTRACTION,
                    {"filename": image.filename, "improved": False, "refined": True}
                )
                
                return OCRResponse(
                    success=True,
                    error=None,
                    data={
                        "text": original_text,
                        "latex_code": refined_latex,
                        "original_text": original_text,
                        "original_latex": latex_code,
                        "improved": False,
                        "refined": True,
                        "improvement_error": improvement_result["error"],
                        "used_vision_fallback": used_fallback
                    }
                )
            else:
                # Return original text with note about improvement failure
                # Consume credits for basic OCR processing
                await credits_service.consume_credits(
                    user_id, 
                    ServiceType.OCR_TEXT_EXTRACTION,
                    {"filename": image.filename, "improved": False, "refined": False}
                )
                
                return OCRResponse(
                    success=True,
                    error=None,
                    data={
                        "text": original_text,
                        "latex_code": latex_code,
                        "original_text": original_text,
                        "improved": False,
                        "refined": False,
                        "improvement_error": improvement_result["error"],
                        "refinement_error": refinement_result["error"],
                        "used_vision_fallback": used_fallback
                    }
                )
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        return OCRResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            data=None
        )


from pydantic import BaseModel

class FixLatexRequest(BaseModel):
    latex_code: str
    error_message: str

class FixLatexResponse(BaseModel):
    success: bool
    fixed_latex: str | None = None
    error: str | None = None


@ocr_router.post("/fix-latex", response_model=FixLatexResponse)
async def fix_latex_with_error(
    request: FixLatexRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Fix LaTeX code based on compilation error using Gemini AI.
    This endpoint is called when LaTeX compilation fails.
    """
    try:
        logger.info(f"Fixing LaTeX for user {current_user.email}")
        logger.info(f"Error message: {request.error_message[:200]}...")
        
        # Call Gemini to fix the LaTeX with error context
        # Use Gemini first, fallback to Groq
        fix_result = await image_to_latex_service.explain_error(request.error_message, request.latex_code)
        
        if fix_result.get("success") and fix_result.get("data"):
            fixed_code = fix_result["data"].get("content", "")
            return FixLatexResponse(
                success=True,
                fixed_latex=fixed_code,
                error=None
            )
        else:
            return FixLatexResponse(
                success=False,
                fixed_latex=None,
                error=fix_result.get("error", "Failed to fix LaTeX")
            )
            
    except Exception as e:
        logger.error(f"Fix LaTeX error: {str(e)}")
        return FixLatexResponse(
            success=False,
            fixed_latex=None,
            error=f"Internal server error: {str(e)}"
        )
