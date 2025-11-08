from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
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
    """
    try:
        compiler = ImageToLatexCompiler()
        success, content, error = compiler.compile_latex(request.latex_code, request.output_format)
        if not success:
            raise HTTPException(status_code=400, detail=error)
        media_type = "application/pdf" if request.output_format == "pdf" else "image/png"
        return StreamingResponse(io.BytesIO(content), media_type=media_type)
    except Exception as e:
        logger.error(f"LaTeX compile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
