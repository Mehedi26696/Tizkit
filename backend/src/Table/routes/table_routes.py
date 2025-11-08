from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ..schemas.table_schemas import TableGenerateRequest, TableGenerateResponse
from ..services.latex_generator import table_latex_generator
from ..services.compiler import TableLatexCompiler
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

table_router = APIRouter()
compiler = TableLatexCompiler()

@table_router.post("/generate", response_model=TableGenerateResponse)
async def generate_table_latex(request: TableGenerateRequest):
    """
    Generate LaTeX code for a table
    """
    try:
        latex_code = table_latex_generator.generate_table_latex(request.data.dict())
        
        return TableGenerateResponse(
            success=True,
            latex_code=latex_code,
            message="Table LaTeX generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Table generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@table_router.post("/preview")
async def preview_table(request: TableGenerateRequest):
    """
    Generate a preview of the table (LaTeX code only)
    """
    try:
        latex_code = table_latex_generator.generate_table_latex(request.data.model_dump())
        return {
            "success": True,
            "latex_code": latex_code,
            "preview": "Table preview generated"
        }
    except Exception as e:
        logger.error(f"Table preview error: {str(e)}")
        if hasattr(e, 'errors'):
            logger.error(f"Validation errors: {e.errors()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class CompileRequest(BaseModel):
    latex_code: str
    output_format: str = "pdf"

@table_router.post("/compile")
async def compile_table_latex(request: CompileRequest):
    """
    Compile LaTeX code into the specified output format (PDF or PNG).
    """
    try:
        success, output, error_msg = compiler.compile_latex(request.latex_code, request.output_format)
        if not success:
            raise HTTPException(status_code=500, detail=f"Compilation failed: {error_msg}")

        return StreamingResponse(BytesIO(output), media_type="application/pdf" if request.output_format == "pdf" else "image/png")
    except Exception as e:
        logger.error(f"Compilation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")