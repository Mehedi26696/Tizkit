from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..schemas.diagram_schemas import DiagramGenerateRequest, DiagramGenerateResponse
from ..services.latex_generator import  diagram_latex_generator
from ..services.compiler import DiagramLatexCompiler
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

diagram_router = APIRouter()
compiler = DiagramLatexCompiler()

# CompileRequest model for diagram compilation
class CompileRequest(BaseModel):
    latex_code: str
    output_format: str = "pdf"

from fastapi.responses import JSONResponse

@diagram_router.post("/compile")
async def compile_diagram_latex(request: CompileRequest):
    """
    Compile LaTeX code for a diagram into the specified output format (PDF or PNG).
    Returns error details in JSON if compilation fails.
    """
    try:
        success, output, error_msg = compiler.compile_latex(request.latex_code, request.output_format)
        if not success:
            # Return detailed compilation error as JSON
            return JSONResponse(
                status_code=400,
                content={
                    "detail": error_msg,
                    "error_type": "compilation_error",
                    "latex_code": request.latex_code[:500] + "..." if len(request.latex_code) > 500 else request.latex_code
                }
            )
        return StreamingResponse(BytesIO(output), media_type="application/pdf" if request.output_format == "pdf" else "image/png")
    except Exception as e:
        logger.error(f"Diagram compilation error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Internal server error: {str(e)}",
                "error_type": "server_error"
            }
        )

@diagram_router.post("/generate", response_model=DiagramGenerateResponse)
async def generate_diagram_latex(request: DiagramGenerateRequest):
    """
    Generate LaTeX code for a TikZ diagram
    """
    try:
        latex_code = diagram_latex_generator.generate_diagram_latex(request.data.model_dump())
        
        return DiagramGenerateResponse(
            success=True,
            latex_code=latex_code,
            message="Diagram LaTeX generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Diagram generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@diagram_router.post("/preview")
async def preview_diagram(request: DiagramGenerateRequest):
    """
    Generate a preview of the diagram (LaTeX code only)
    """
    try:
        latex_code = diagram_latex_generator.generate_diagram_latex(request.data.model_dump())
        
        return {
            "success": True,
            "latex_code": latex_code,
            "preview": "Diagram preview generated"
        }
        
    except Exception as e:
        logger.error(f"Diagram preview error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
