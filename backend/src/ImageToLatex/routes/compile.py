from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List
import io
import logging
from ..services.compiler import ImageToLatexCompiler
from ...auth.middleware.credits_middleware import create_credit_checker
from ...auth.models.credits import ServiceType
from ...auth.models.sub_project import SubProjectFileLink
from ...auth.models.project import ProjectFile, FileType

from ...auth.routes import get_current_user, User
from ...utils.database import get_session
from ...utils.supabase_storage import storage_service

logger = logging.getLogger(__name__)

class CompileRequest(BaseModel):
    latex_code: str
    output_format: str  # 'pdf' or 'png'
    sub_project_id: Optional[str] = None

compile_router = APIRouter()

@compile_router.post("/compile")
async def compile_latex_endpoint(
    request: CompileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    credit_check: dict = Depends(create_credit_checker(ServiceType.LATEX_COMPILATION))
):
    """
    Compile LaTeX code to PDF or PNG
    Returns the compiled content on success, or error details on failure
    """
    try:
        # Extract credit service and user info from dependency
        credits_service = credit_check["credits_service"]
        user_id = credit_check["user_id"]
        
        # Fetch linked files if sub_project_id is provided
        assets: List[dict] = []
        if request.sub_project_id:
            try:
                from uuid import UUID
                sub_project_uuid = UUID(request.sub_project_id)
                
                # Query linked files
                links = session.exec(
                    select(SubProjectFileLink)
                    .where(SubProjectFileLink.sub_project_id == sub_project_uuid)
                ).all()
                
                for link in links:
                    # Get the project file
                    project_file = session.exec(
                        select(ProjectFile)
                        .where(ProjectFile.id == link.project_file_id)
                    ).first()
                    
                    if project_file and project_file.file_type == FileType.IMAGE and project_file.file_url:
                        # Download file content from Supabase
                        file_content = await storage_service.download_file(project_file.file_url)
                        if file_content:
                            assets.append({
                                "filename": project_file.filename,
                                "content": file_content
                            })
                            logger.info(f"Loaded linked file: {project_file.filename}")
            except Exception as e:
                logger.warning(f"Failed to fetch linked files: {str(e)}")
        
        compiler = ImageToLatexCompiler()
        success, content, error = compiler.compile_latex(request.latex_code, request.output_format, assets=assets)
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
        
        # Consume credits for successful compilation
        await credits_service.consume_credits(
            user_id,
            ServiceType.LATEX_COMPILATION,
            {"output_format": request.output_format, "latex_length": len(request.latex_code)}
        )
        
        media_type = "application/pdf" if request.output_format == "pdf" else "image/png"
        return StreamingResponse(io.BytesIO(content), media_type=media_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LaTeX compile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
