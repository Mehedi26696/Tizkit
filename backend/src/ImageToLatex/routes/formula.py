from fastapi import APIRouter, HTTPException, UploadFile, File

from fastapi import APIRouter, HTTPException, UploadFile, File
import logging
from ..services.imageTolatex_services import pix2tex_service, gemini_service
from ..schemas.imageTolatex_schemas import Pix2TexResponse

logger = logging.getLogger(__name__)

formula_router = APIRouter() 

@formula_router.post("/pix2tex-formula", response_model=Pix2TexResponse)
async def pix2tex_formula(image: UploadFile = File(...)):
    """
    Extract LaTeX code from formula image using Pix2Tex
    """
    try:
        image_content = await image.read()
        result = await pix2tex_service.extract_latex(image_content)
        if result["success"]:
            # Use Gemini to fix and wrap LaTeX code for compilation
            gemini_result = await gemini_service.fix_latex(result["latex_code"])
            if gemini_result["success"] and gemini_result["data"] and gemini_result["data"].get("content"):
                return Pix2TexResponse(
                    success=True,
                    error=None,
                    data={
                        "latex_code": gemini_result["data"]["content"],
                        "original_text": result["latex_code"]
                    }
                )
            else:
                return Pix2TexResponse(
                    success=False,
                    error=gemini_result["error"] or "Gemini failed to return compilable LaTeX.",
                    data={
                        "original_text": result["latex_code"]
                    }
                )
        else:
            return Pix2TexResponse(
                success=False,
                error=result["error"],
                data={
                    "original_text": result.get("latex_code")
                }
            )
        
    except Exception as e:
        logger.error(f"Pix2Tex error: {str(e)}")
        return Pix2TexResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            data=None
        )

@formula_router.post("/gemini-extract")
async def gemini_extract(image: UploadFile = File(...)):
    """
    Extract content (text, math, summary) from image using Gemini vision model
    """
    try:
        image_content = await image.read()
        result = await gemini_service.extract_image_content(image_content, filename=image.filename)
        if result["success"]:
            return {
                "success": True,
                "error": None,
                "data": result["data"]
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "data": None
            }
    except Exception as e:
        logger.error(f"Gemini extract error: {str(e)}")
        return {
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": None
        }
