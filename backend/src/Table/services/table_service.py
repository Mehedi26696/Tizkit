from typing import Dict, Any, List
import logging
from .latex_generator import table_latex_generator

logger = logging.getLogger(__name__)


class TableService:
    """Service for handling table-specific operations"""
    
    def __init__(self):
        self.generator = table_latex_generator
    
    def validate_table_data(self, table_data: Dict[str, Any]) -> bool:
        """Validate table data structure"""
        try:
            if not table_data or 'cells' not in table_data:
                return False
            
            cells = table_data['cells']
            if not cells or not isinstance(cells, list):
                return False
            
            # Check if all rows have the same number of columns
            if len(cells) > 0:
                expected_cols = len(cells[0])
                for row in cells:
                    if len(row) != expected_cols:
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Table validation error: {str(e)}")
            return False
    
    def generate_latex(self, table_data: Dict[str, Any]) -> str:
        """Generate LaTeX code for table"""
        if not self.validate_table_data(table_data):
            raise ValueError("Invalid table data structure")
        
        return self.generator.generate_table_latex(table_data)
    
    def get_table_stats(self, table_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get statistics about the table"""
        try:
            if not table_data or 'cells' not in table_data:
                return {"rows": 0, "cols": 0, "total_cells": 0}
            
            cells = table_data['cells']
            rows = len(cells)
            cols = len(cells[0]) if cells else 0
            
            # Count non-empty cells
            non_empty_cells = 0
            for row in cells:
                for cell in row:
                    if cell.get('content', '').strip():
                        non_empty_cells += 1
            
            return {
                "rows": rows,
                "cols": cols,
                "total_cells": rows * cols,
                "non_empty_cells": non_empty_cells,
                "fill_percentage": (non_empty_cells / (rows * cols) * 100) if rows * cols > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Table stats error: {str(e)}")
            return {"error": str(e)}

# Global service instance
table_service = TableService()