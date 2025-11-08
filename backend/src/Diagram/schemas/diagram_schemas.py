from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Diagram-specific schemas
class DiagramNode(BaseModel):
    id: str
    x: float
    y: float
    text: str
    type: str = "rectangle"  # rectangle, circle, diamond
    fillColor: str = "#ffffff"
    strokeColor: str = "#000000"
    textColor: str = "#000000"
    strokeWidth: int = 2

class DiagramConnection(BaseModel):
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    type: str = "arrow"  # arrow, line
    color: str = "#000000"
    strokeWidth: int = 2

class DiagramData(BaseModel):
    nodes: List[DiagramNode]
    connections: List[DiagramConnection]

class DiagramProjectData(BaseModel):
    nodes: List[Dict[str, Any]]  # More flexible node structure
    connections: List[Dict[str, Any]]  # More flexible connection structure

class DiagramGenerateRequest(BaseModel):
    data: DiagramProjectData

class DiagramGenerateResponse(BaseModel):
    success: bool
    latex_code: str
    message: Optional[str] = None