from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import StreamingResponse, JSONResponse
from sqlmodel import Session
from typing import Optional
from uuid import UUID
import logging
import io

from ..services import gemini_flowchart_service, latex_flowchart_generator, flowchart_compiler
from ..schemas.handwritten_flowchart_schemas import (
    FlowchartAnalysisResponse,
    FlowchartToLatexResponse,
    CompileRequest
)
from ...auth.routes import get_current_user, User
from ...auth.access import check_project_access, check_sub_project_access
from ...auth.middleware.credits_middleware import require_credits
from ...auth.models.credits import ServiceType
from ...utils.database import get_session

logger = logging.getLogger(__name__)

handwritten_flowchart_router = APIRouter()

@handwritten_flowchart_router.post("/analyze", response_model=FlowchartAnalysisResponse)
@require_credits(ServiceType.FLOWCHART_GENERATION)
async def analyze_handwritten_flowchart(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Analyze handwritten flowchart image using Gemini Flash 2.0
    Authenticated users only.
    """
    try:
        # Validate file type
        if not image.content_type or not image.content_type.startswith('image/'):
            return FlowchartAnalysisResponse(
                success=False,
                error="Invalid file type. Please upload an image file.",
                data=None
            )
        
        # Read image content
        image_content = await image.read()
        
        # Analyze using Gemini Flash 2.0
        analysis_result = await gemini_flowchart_service.analyze_handwritten_flowchart(
            image_content, 
            image.filename or "flowchart.png"
        )
        
        if not analysis_result["success"]:
            return FlowchartAnalysisResponse(
                success=False,
                error=analysis_result["error"],
                data=None
            )
        
        # Try to improve the analysis
        improvement_result = await gemini_flowchart_service.improve_flowchart_structure(
            analysis_result["data"]["analysis"]
        )
        
        response_data = {
            "original_analysis": analysis_result["data"]["analysis"],
            "raw_response": analysis_result["data"]["raw_response"]
        }
        
        if improvement_result["success"]:
            response_data["improved_analysis"] = improvement_result["data"]["improved_analysis"]
        
        return FlowchartAnalysisResponse(
            success=True,
            error=None,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Flowchart analysis error: {str(e)}")
        return FlowchartAnalysisResponse(
            success=False,
            error=f"Internal server error: {str(e)}",
            data=None
        )

@handwritten_flowchart_router.post("/generate-latex", response_model=FlowchartToLatexResponse)
@require_credits(ServiceType.FLOWCHART_GENERATION)
async def generate_latex_from_analysis(
    request: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Generate LaTeX/TikZ code from flowchart analysis data
    Authenticated users only.
    """
    try:
        analysis_data = request.get("analysis_data")
        title = request.get("title")
        style = request.get("style", "enhanced")
        
        if not analysis_data:
            return FlowchartToLatexResponse(
                success=False,
                latex_code=None,
                error="Analysis data is required",
                metadata=None
            )
        
        # Generate LaTeX code
        latex_result = latex_flowchart_generator.generate_tikz_from_analysis(
            analysis_data, title, style
        )
        
        if not latex_result["success"]:
            # Fallback: generate simple template
            fallback_result = latex_flowchart_generator.generate_simple_tikz(
                "Handwritten flowchart analysis failed. Please modify this template.",
                title
            )
            return FlowchartToLatexResponse(
                success=True,
                latex_code=fallback_result["latex_code"],
                error="Used fallback template due to analysis parsing issues",
                metadata=fallback_result["metadata"]
            )
        
        return FlowchartToLatexResponse(
            success=True,
            latex_code=latex_result["latex_code"],
            error=None,
            metadata=latex_result["metadata"]
        )
        
    except Exception as e:
        logger.error(f"LaTeX generation error: {str(e)}")
        return FlowchartToLatexResponse(
            success=False,
            latex_code=None,
            error=f"Internal server error: {str(e)}",
            metadata=None
        )

@handwritten_flowchart_router.post("/compile")
@require_credits(ServiceType.LATEX_COMPILATION)
async def compile_flowchart_latex(
    request: CompileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Compile LaTeX flowchart code to PDF or PNG
    Authenticated users only. Checks access if sub_project_id provided.
    """
    # Check access if sub_project_id is provided
    if request.sub_project_id:
        sub, project, is_owner = check_sub_project_access(session, request.sub_project_id, current_user.id)
        if not project:
             raise HTTPException(status_code=403, detail="Not authorized to access this project")

    try:
        success, content, error = flowchart_compiler.compile_latex(
            request.latex_code, 
            request.output_format
        )
        
        if not success:
            return JSONResponse(
                status_code=400,
                content={
                    "detail": error,
                    "error_type": "compilation_error",
                    "latex_code": request.latex_code[:500] + "..." if len(request.latex_code) > 500 else request.latex_code
                }
            )
        
        media_type = "application/pdf" if request.output_format == "pdf" else "image/png"
        return StreamingResponse(io.BytesIO(content), media_type=media_type)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flowchart compile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@handwritten_flowchart_router.post("/process-complete")
@require_credits(ServiceType.FLOWCHART_GENERATION)
async def process_complete_flowchart(
    image: UploadFile = File(...), 
    title: str = Form(None), 
    style: str = Form("enhanced"),
    sub_project_id: Optional[UUID] = Form(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Complete pipeline: analyze handwritten flowchart and return LaTeX code
    Authenticated users only. Checks access if sub_project_id provided.
    """
    # Check access if sub_project_id is provided
    if sub_project_id:
        sub, project, is_owner = check_sub_project_access(session, sub_project_id, current_user.id)
        if not project:
             raise HTTPException(status_code=403, detail="Not authorized to access this project")

    try:
        # Step 1: Analyze image
        image_content = await image.read()
        analysis_result = await gemini_flowchart_service.analyze_handwritten_flowchart(
            image_content, 
            image.filename or "flowchart.png"
        )
        
        if not analysis_result["success"]:
            # Fallback to simple template
            fallback_result = latex_flowchart_generator.generate_simple_tikz(
                f"Failed to analyze handwritten flowchart: {analysis_result['error']}",
                title
            )
            return {
                "success": True,
                "latex_code": fallback_result["latex_code"],
                "analysis_data": None,
                "error": f"Analysis failed, returned template: {analysis_result['error']}",
                "used_fallback": True
            }
        
        # Step 2: Generate LaTeX
        analysis_data = analysis_result["data"]["analysis"]
        latex_result = latex_flowchart_generator.generate_tikz_from_analysis(
            analysis_data, title, style
        )
        
        if not latex_result["success"]:
            # Fallback to simple template  
            fallback_result = latex_flowchart_generator.generate_simple_tikz(
                "Handwritten flowchart detected but structure analysis failed.",
                title
            )
            return {
                "success": True,
                "latex_code": fallback_result["latex_code"],
                "analysis_data": analysis_data,
                "error": f"LaTeX generation failed, returned template: {latex_result['error']}",
                "used_fallback": True
            }
        
        return {
            "success": True,
            "latex_code": latex_result["latex_code"],
            "analysis_data": analysis_data,
            "error": None,
            "used_fallback": False,
            "metadata": latex_result["metadata"]
        }
        
    except Exception as e:
        logger.error(f"Complete process error: {str(e)}")
        # Final fallback
        fallback_result = latex_flowchart_generator.generate_simple_tikz(
            f"Error processing handwritten flowchart: {str(e)}",
            title
        )
        return {
            "success": True,
            "latex_code": fallback_result["latex_code"],
            "analysis_data": None,
            "error": f"Processing failed, returned template: {str(e)}",
            "used_fallback": True
        }