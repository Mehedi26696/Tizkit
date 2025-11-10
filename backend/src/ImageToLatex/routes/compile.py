from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import io
import logging
from ..services.compiler import ImageToLatexCompiler

logger = logging.getLogger(__name__)

class CompileRequest(BaseModel):
    latex_code: str
    output_format: str  # 'pdf' or 'png'

compile_router = APIRouter()

@compile_router.post("/compile")
async def compile_latex_endpoint(request: CompileRequest):
    """
    Compile LaTeX code to PDF or PNG
    Returns the compiled content on success, or error details on failure
    """
    try:
        compiler = ImageToLatexCompiler()
        success, content, error = compiler.compile_latex(request.latex_code, request.output_format)
        if not success:
            # Return detailed compilation error as JSON instead of generic HTTPException
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
        logger.error(f"LaTeX compile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
