from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Table-specific schemas
class TableCell(BaseModel):
    content: str = ""
    backgroundColor: Optional[str] = "#ffffff"
    textColor: Optional[str] = "#000000"
    bold: bool = False
    italic: bool = False

class TableData(BaseModel):
    rows: int
    cols: int
    cells: List[List[TableCell]]

class TableProjectData(BaseModel):
    cells: List[List[Dict[str, Any]]]  # More flexible cell structure

class TableGenerateRequest(BaseModel):
    data: TableProjectData

class TableGenerateResponse(BaseModel):
    success: bool
    latex_code: str
    message: Optional[str] = None