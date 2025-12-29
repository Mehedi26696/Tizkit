from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class FlowchartAnalysisRequest(BaseModel):
    """Request model for flowchart analysis"""
    pass

class FlowchartElement(BaseModel):
    """Individual flowchart element"""
    type: str  # 'start', 'process', 'decision', 'end', 'connector'
    text: str
    position: Dict[str, float]  # x, y coordinates
    id: str
    connections: List[str] = []  # IDs of connected elements

class FlowchartAnalysisResponse(BaseModel):
    """Response model for flowchart analysis"""
    success: bool
    error: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class FlowchartToLatexRequest(BaseModel):
    """Request model for converting flowchart to LaTeX"""
    elements: List[FlowchartElement]
    style: str = "default"  # Style options
    title: Optional[str] = None

class FlowchartToLatexResponse(BaseModel):
    """Response model for flowchart to LaTeX conversion"""
    success: bool
    latex_code: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CompileRequest(BaseModel):
    """Request for compiling LaTeX to PDF/PNG"""
    latex_code: str
    output_format: str  # 'pdf' or 'png'
