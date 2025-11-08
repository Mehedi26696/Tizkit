from typing import Dict, Any, List
import logging
from .latex_generator import diagram_latex_generator

logger = logging.getLogger(__name__)

class DiagramService:
    """Service for handling diagram-specific operations"""
    
    def __init__(self):
        self.generator = diagram_latex_generator
    
    def validate_diagram_data(self, diagram_data: Dict[str, Any]) -> bool:
        """Validate diagram data structure"""
        try:
            if not diagram_data or 'nodes' not in diagram_data:
                return False
            
            nodes = diagram_data['nodes']
            connections = diagram_data.get('connections', [])
            
            if not isinstance(nodes, list) or not isinstance(connections, list):
                return False
            
            # Validate nodes have required fields
            node_ids = set()
            for node in nodes:
                if not isinstance(node, dict) or 'id' not in node:
                    return False
                node_ids.add(node['id'])
            
            # Validate connections reference existing nodes
            for conn in connections:
                if not isinstance(conn, dict):
                    return False
                from_node = conn.get('from')
                to_node = conn.get('to')
                if from_node not in node_ids or to_node not in node_ids:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Diagram validation error: {str(e)}")
            return False
    
    def generate_latex(self, diagram_data: Dict[str, Any]) -> str:
        """Generate LaTeX code for diagram"""
        if not self.validate_diagram_data(diagram_data):
            raise ValueError("Invalid diagram data structure")
        
        return self.generator.generate_diagram_latex(diagram_data)
    
    def get_diagram_stats(self, diagram_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get statistics about the diagram"""
        try:
            if not diagram_data or 'nodes' not in diagram_data:
                return {"nodes": 0, "connections": 0}
            
            nodes = diagram_data['nodes']
            connections = diagram_data.get('connections', [])
            
            # Count node types
            node_types = {}
            for node in nodes:
                node_type = node.get('type', 'rectangle')
                node_types[node_type] = node_types.get(node_type, 0) + 1
            
            # Count connection types
            connection_types = {}
            for conn in connections:
                conn_type = conn.get('type', 'arrow')
                connection_types[conn_type] = connection_types.get(conn_type, 0) + 1
            
            return {
                "nodes": len(nodes),
                "connections": len(connections),
                "node_types": node_types,
                "connection_types": connection_types
            }
            
        except Exception as e:
            logger.error(f"Diagram stats error: {str(e)}")
            return {"error": str(e)}
    
    def optimize_layout(self, diagram_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize diagram layout (basic implementation)"""
        try:
            # This is a basic implementation - in a real app you might use 
            # graph layout algorithms like force-directed or hierarchical layouts
            
            if not diagram_data or 'nodes' not in diagram_data:
                return diagram_data
            
            nodes = diagram_data['nodes'].copy()
            
            # Simple grid layout for demonstration
            nodes_per_row = max(1, int(len(nodes) ** 0.5))
            for i, node in enumerate(nodes):
                row = i // nodes_per_row
                col = i % nodes_per_row
                node['x'] = col * 150  # Spacing between nodes
                node['y'] = row * 100
            
            optimized_data = diagram_data.copy()
            optimized_data['nodes'] = nodes
            
            return optimized_data
            
        except Exception as e:
            logger.error(f"Layout optimization error: {str(e)}")
            return diagram_data

# Global service instance
diagram_service = DiagramService()