from fastapi import APIRouter, UploadFile, File
import logging
from ..services import ocr_service, gemini_service
from ..services.latex_reconstruct import wrap_latex
from ..schemas.imageTolatex_schemas import OCRResponse

logger = logging.getLogger(__name__)

ocr_router = APIRouter()

@ocr_router.post("/ocr-text", response_model=OCRResponse)
async def ocr_text(image: UploadFile = File(...)):
    """
    Extract text from image using OCR.space API
    """
    try:
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
