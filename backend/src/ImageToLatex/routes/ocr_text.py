from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
import logging
from ..services import ocr_service, gemini_service
from ..services.latex_reconstruct import wrap_latex
from ..schemas.imageTolatex_schemas import OCRResponse
from ...auth.middleware.credits_middleware import create_credit_checker
from ...auth.models.credits import ServiceType

from ...auth.routes import get_current_user, User
from ...utils.database import get_session

logger = logging.getLogger(__name__)

ocr_router = APIRouter()

@ocr_router.post("/ocr-text", response_model=OCRResponse)
async def ocr_text(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    credit_check: dict = Depends(create_credit_checker(ServiceType.OCR_TEXT_EXTRACTION))
):
    """
    Extract text from image using OCR.space API
    """
    try:
        # Extract credit service and user info from dependency
        credits_service = credit_check["credits_service"]
        user_id = credit_check["user_id"]
        
        image_content = await image.read()
        
        # Extract text using OCR
        ocr_result = await ocr_service.extract_text(
            image_content, image.filename, image.content_type
        )
        
        if not ocr_result["success"]:
            return OCRResponse(
                success=False,
                error=ocr_result["error"],
                data=None
            )
        
        original_text = ocr_result["text"]
        
        # Try to improve the text using Gemini
        improvement_result = await gemini_service.improve_text(original_text)
        
        if improvement_result["success"]:
            improved_text = improvement_result["data"]["content"].strip()
            latex_code = wrap_latex(improved_text)
            
            # Send the generated LaTeX code to Gemini for refinement
            refinement_result = await gemini_service.fix_latex(latex_code)
            
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
                        "refined": True
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
                        "refinement_error": refinement_result["error"]
                    }
                )
        else:
            latex_code = wrap_latex(original_text)
            
            # Even with original text, try to refine the LaTeX
            refinement_result = await gemini_service.fix_latex(latex_code)
            
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
                        "improvement_error": improvement_result["error"]
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
                        "refinement_error": refinement_result["error"]
                    }
                )
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        return OCRResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            data=None
        )
