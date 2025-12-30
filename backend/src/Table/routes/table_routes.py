from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from sqlmodel import Session
from io import BytesIO
import logging

from ..schemas.table_schemas import TableGenerateRequest, TableGenerateResponse
from ..services.latex_generator import table_latex_generator
from ..services.compiler import TableLatexCompiler
from ...auth.routes import get_current_user, User
from ...auth.access import check_sub_project_access
from ...utils.database import get_session

logger = logging.getLogger(__name__)

table_router = APIRouter()
compiler = TableLatexCompiler()

class CompileRequest(BaseModel):
    latex_code: str
    output_format: str = "pdf"
    sub_project_id: Optional[UUID] = None

@table_router.post("/generate", response_model=TableGenerateResponse)
async def generate_table_latex(
    request: TableGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate LaTeX code for a table.
    Authenticated users only.
    """
    try:
        # Pydantic v2 use model_dump(), but existing code used dict() in one place and model_dump in another.
        # Assuming model_dump() is available.
        latex_code = table_latex_generator.generate_table_latex(request.data.model_dump())
        
        return TableGenerateResponse(
            success=True,
            latex_code=latex_code,
            message="Table LaTeX generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Table generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@table_router.post("/preview")
async def preview_table(
    request: TableGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a preview of the table (LaTeX code only).
    Authenticated users only.
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

@table_router.post("/compile")
async def compile_table_latex(
    request: CompileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Compile LaTeX code into the specified output format (PDF or PNG).
    Returns error details in JSON if compilation fails.
    """
    # Check access if sub_project_id is provided
    if request.sub_project_id:
        sub, project, is_valid = check_sub_project_access(session, request.sub_project_id, current_user.id)
        if not is_valid:
             raise HTTPException(status_code=403, detail="Not authorized to access this project")

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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Table compilation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")