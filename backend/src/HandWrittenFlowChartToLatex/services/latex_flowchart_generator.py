from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
import logging
import json
from jinja2 import Template

logger = logging.getLogger(__name__)

# --------- Enhanced TikZ Engine Data Models ---------
@dataclass
class Node:
    id: str
    type: str
    text: str
    x: Optional[float] = None
    y: Optional[float] = None
    shape: Optional[str] = None
    connections_to: List[str] = field(default_factory=list)

@dataclass
class Diagram:
    elements: List[Node]
    flow_direction: str = "top_to_bottom"
    title: Optional[str] = None
    description: Optional[str] = None

# --------- Enhanced TikZ Templates ---------
ENHANCED_LATEX_TEMPLATE = r"""
\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{tikz}
\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc, fit}

% Enhanced geometry for better visual space
\geometry{margin=0.5in, paperwidth=12in, paperheight=12in}

% Safe dimension limits
\maxdimen=200in
\hsize=10in
\vsize=10in

% Enhanced professional styles with improved spacing
\tikzstyle{startstop} = [ellipse, minimum width=3.5cm, minimum height=1.4cm, draw=black!80, fill=red!15, text centered, font=\small\bfseries, inner sep=5pt]
\tikzstyle{process} = [rectangle, rounded corners=2pt, minimum width=4.0cm, minimum height=1.4cm, draw=black!80, fill=blue!15, text centered, font=\small, inner sep=6pt]
\tikzstyle{decision} = [diamond, aspect=2, minimum width=3.5cm, minimum height=1.8cm, draw=black!80, fill=green!15, text centered, font=\small, inner sep=4pt]
\tikzstyle{arrow} = [thick,-{Stealth[length=3mm]}, draw=black!70]

\begin{document}

{% if title %}
\title{ {{- title -}} }
\author{Generated from Handwritten Flowchart - Tizkit}
\date{\today}
\maketitle
{% endif %}

\begin{center}
\begin{tikzpicture}[node distance=4.5cm and 5.0cm, auto, row sep=2.5cm, column sep=3.0cm]

{{ nodes_block }}

{{ edges_block }}

\end{tikzpicture}
\end{center}

\end{document}
"""

class LatexFlowchartGenerator:
    """Enhanced LaTeX/TikZ code generator with improved positioning and visuals"""
    
    def __init__(self):
        self.enhanced_styles = {
            'start': 'startstop',
            'end': 'startstop', 
            'process': 'process',
            'decision': 'decision',
        }
        # Legacy styles for backward compatibility
        self.tikz_styles = {
            "start": "ellipse, draw, fill=green!20",
            "end": "ellipse, draw, fill=red!20", 
            "process": "rectangle, draw, fill=blue!20",
            "decision": "diamond, draw, fill=yellow!20",
            "connector": "circle, draw, fill=gray!20"
        }
    
    def generate_tikz_from_analysis(self, analysis_data: Dict[str, Any], title: Optional[str] = None, style: str = "enhanced") -> Dict[str, Any]:
        """
        Generate TikZ LaTeX code from flowchart analysis with enhanced positioning
        """
        try:
            elements = analysis_data.get("elements", [])
            if not elements:
                return {
                    "success": False,
                    "error": "No flowchart elements found in analysis data",
                    "latex_code": None
                }
            
            # Use enhanced TikZ engine for better results
            if style == "enhanced":
                latex_code = self._generate_enhanced_tikz(elements, title)
            else:
                # Fallback to legacy method
                latex_code = self._build_latex_document(elements, title, style)
            
            return {
                "success": True,
                "latex_code": latex_code,
                "error": None,
                "metadata": {
                    "elements_count": len(elements),
                    "style": style,
                    "title": title,
                    "engine": "enhanced_tikz" if style == "enhanced" else "legacy"
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating TikZ code: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate TikZ code: {str(e)}",
                "latex_code": None
            }
    
    def _build_latex_document(self, elements: List[Dict], title: Optional[str], style: str) -> str:
        """Build complete LaTeX document with TikZ flowchart"""
        
        # Document header with dimension safety
        latex_code = r"""\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{tikz}

% Load TikZ libraries in correct order
\usetikzlibrary{shapes.geometric}
\usetikzlibrary{arrows}
\usetikzlibrary{positioning}
\usetikzlibrary{fit}
\usetikzlibrary{calc}

% Safe dimension limits to prevent compilation errors
\maxdimen=200in
\hsize=10in
\vsize=10in

\geometry{margin=0.75in, paperwidth=10in, paperheight=10in}

\tikzstyle{startstop} = [ellipse, rounded corners, minimum width=3cm, minimum height=1.2cm, text centered, draw=black, fill=red!30]
\tikzstyle{process} = [rectangle, minimum width=3.5cm, minimum height=1.2cm, text centered, draw=black, fill=orange!30]
\tikzstyle{decision} = [diamond, minimum width=3cm, minimum height=1.2cm, text centered, draw=black, fill=green!30]
\tikzstyle{arrow} = [thick,->,>=stealth]

\begin{document}
"""
        
        if title:
            latex_code += f"""
\\title{{{title}}}
\\author{{Generated from Handwritten Flowchart}}
\\date{{\\today}}
\\maketitle
"""
        
        latex_code += r"""
\begin{center}
\begin{tikzpicture}[node distance=3.5cm and 4.0cm, auto]
"""
        
        # Check if we need to generate automatic layout
        positions_valid = self._check_position_validity(elements)
        
        # Add nodes
        for i, element in enumerate(elements):
            node_id = element.get("id", f"node{i}")
            text = element.get("text", "").replace("_", "\\_").replace("&", "\\&").replace("%", "\\%")
            # Limit text length to prevent issues
            text = text[:50] if len(text) > 50 else text
            element_type = element.get("type", "process")
            
            # Determine TikZ style based on element type
            if element_type in ["start", "end"]:
                tikz_style = "startstop"
            elif element_type == "decision":
                tikz_style = "decision"
            else:
                tikz_style = "process"
            
            # Calculate position
            if positions_valid:
                # Use provided positions with safe scaling
                position = element.get("position", {"x": 0, "y": 0})
                x_raw = position.get("x", 0)
                y_raw = position.get("y", 0)
                
                # Scale and clamp to safe ranges
                max_coord = 10  # More conservative limit
                x_pos = max(-max_coord, min(max_coord, x_raw * 0.5))  # Gentler scaling
                y_pos = max(-max_coord, min(max_coord, -y_raw * 0.5))  # Gentler scaling
            else:
                # Generate automatic vertical layout when positions are invalid
                x_pos = 0
                y_pos = -i * 3.5  # Vertical spacing of 3.5 units for better readability
            
            latex_code += f"\\node ({node_id}) [{tikz_style}] at ({x_pos:.1f},{y_pos:.1f}) {{{text}}};\n"
        
        # Add arrows/connections
        latex_code += "\n% Arrows\n"
        for element in elements:
            element_id = element.get("id", "")
            connections = element.get("connections_to", [])
            for target_id in connections:
                latex_code += "\\draw [arrow] (" + element_id + ") -- (" + target_id + ");\n"
        
        latex_code += r"""
\end{tikzpicture}
\end{center}

\end{document}"""
        
        return latex_code
    
    def generate_simple_tikz(self, text_description: str, title: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate simple TikZ code from text description when image analysis fails
        """
        try:
            latex_code = r"""\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{tikz}

\usetikzlibrary{shapes.geometric}
\usetikzlibrary{arrows}
\usetikzlibrary{positioning}

\geometry{margin=1in}

\tikzstyle{startstop} = [ellipse, rounded corners, minimum width=2cm, minimum height=0.8cm, text centered, draw=black, fill=red!30]
\tikzstyle{process} = [rectangle, minimum width=2cm, minimum height=0.8cm, text centered, draw=black, fill=orange!30]
\tikzstyle{arrow} = [thick,->,>=stealth]

\begin{document}
"""
            
            if title:
                latex_code += """
\\title{""" + title + """}
\\maketitle
"""
            
            escaped_description = text_description.replace("_", "\\_").replace("&", "\\&")
            latex_code += """
\\section{Flowchart Description}
""" + escaped_description + """

\\begin{center}
\\begin{tikzpicture}[node distance=2cm]
\\node (start) [startstop] {Start};
\\node (process1) [process, below of=start] {Process Step};
\\node (end) [startstop, below of=process1] {End};

\\draw [arrow] (start) -- (process1);
\\draw [arrow] (process1) -- (end);
\\end{tikzpicture}
\\end{center}

\\textit{Note: This is a template flowchart. Please modify according to your handwritten diagram.}

\\end{document}"""
            
            return {
                "success": True,
                "latex_code": latex_code,
                "error": None,
                "metadata": {
                    "type": "simple_template",
                    "title": title
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating simple TikZ: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate simple TikZ: {str(e)}",
                "latex_code": None
            }
    
    def _generate_enhanced_tikz(self, elements: List[Dict], title: Optional[str]) -> str:
        """Generate LaTeX using the enhanced TikZ engine with better positioning"""
        
        logger.info("LatexFlowchartGenerator: Using enhanced TikZ engine")
        
        # Convert elements to enhanced Node format
        nodes = []
        for i, element in enumerate(elements):
            position = element.get("position", {"x": 0, "y": 0})
            node = Node(
                id=str(element.get("id", i)),
                type=element.get("type", "process"),
                text=self._sanitize_text(element.get("text", "")),
                x=position.get("x"),
                y=position.get("y"),
                shape=element.get("shape"),
                connections_to=element.get("connections_to", [])
            )
            nodes.append(node)
        
        # Create diagram object
        diagram = Diagram(
            elements=nodes,
            flow_direction="top_to_bottom",
            title=title,
            description="Generated from handwritten flowchart analysis"
        )
        
        # Apply intelligent positioning
        positioned_diagram = self._apply_intelligent_positioning(diagram)
        
        # Generate nodes and edges blocks
        nodes_block = self._generate_nodes_block(positioned_diagram)
        edges_block = self._generate_edges_block(positioned_diagram)
        
        # Render template
        template = Template(ENHANCED_LATEX_TEMPLATE)
        latex_code = template.render(
            nodes_block=nodes_block,
            edges_block=edges_block,
            title=title
        )
        
        return latex_code
    
    def _sanitize_text(self, text: str) -> str:
        """Sanitize text for LaTeX with better handling"""
        if not text:
            return ""
        
        # Limit length and escape characters
        text = text[:60] if len(text) > 60 else text
        
        # Enhanced escaping for LaTeX
        replacements = [
            ("\\", "\\textbackslash "),
            ("&", "\\&"),
            ("%", "\\%"),
            ("$", "\\$"),
            ("#", "\\#"),
            ("^", "\\textasciicircum "),
            ("_", "\\_"),
            ("{", "\\{"),
            ("}", "\\}"),
            ("~", "\\textasciitilde "),
            ('"', "``"),
            ("'", "`"),
        ]
        
        for old, new in replacements:
            text = text.replace(old, new)
        
        return text
    
    def _apply_intelligent_positioning(self, diagram: Diagram) -> Diagram:
        """Apply intelligent positioning algorithm for better layout"""
        
        nodes = diagram.elements
        
        # Check if positions are valid
        if not self._has_valid_positions(nodes):
            logger.info("LatexFlowchartGenerator: Applying automatic intelligent layout")
            nodes = self._generate_intelligent_layout(nodes)
        else:
            logger.info("LatexFlowchartGenerator: Using provided positions with optimization")
            nodes = self._optimize_provided_positions(nodes)
        
        return Diagram(
            elements=nodes,
            flow_direction=diagram.flow_direction,
            title=diagram.title,
            description=diagram.description
        )
    
    def _has_valid_positions(self, nodes: List[Node]) -> bool:
        """Check if nodes have valid, distinct positions with no overlaps"""
        
        if len(nodes) <= 1:
            return True
        
        positions = []
        for node in nodes:
            if node.x is None or node.y is None:
                return False
            positions.append((round(node.x, 2), round(node.y, 2)))
        
        # Check for distinct positions
        unique_positions = set(positions)
        if len(unique_positions) != len(positions):
            logger.info(f"LatexFlowchartGenerator: Overlapping positions detected: {len(positions)} nodes, {len(unique_positions)} unique positions")
            return False
        
        # Check minimum separation between nodes
        min_separation = 1.5  # Minimum distance between node centers
        for i, pos1 in enumerate(positions):
            for j, pos2 in enumerate(positions[i+1:], i+1):
                distance = ((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2) ** 0.5
                if distance < min_separation:
                    logger.info(f"LatexFlowchartGenerator: Nodes too close: distance {distance:.2f} < {min_separation}")
                    return False
        
        return True
    
    def _generate_intelligent_layout(self, nodes: List[Node]) -> List[Node]:
        """Generate intelligent automatic layout for flowchart nodes with collision prevention"""
        
        logger.info(f"LatexFlowchartGenerator: Generating intelligent layout for {len(nodes)} nodes")
        
        # Initialize collision detection system
        self._occupied_positions = set()
        self._min_separation = 3.5  # Enhanced minimum distance between node centers
        
        # Analyze flowchart structure
        start_nodes = [n for n in nodes if n.type in ['start']]
        decision_nodes = [n for n in nodes if n.type == 'decision']
        end_nodes = [n for n in nodes if n.type in ['end']]
        process_nodes = [n for n in nodes if n.type == 'process']
        
        positioned_nodes = []
        y_offset = 0
        
        # Layout start nodes at top
        for i, node in enumerate(start_nodes):
            node.x = i * 6.0  # Enhanced horizontal spread for start nodes
            node.y = y_offset
            positioned_nodes.append(node)
        
        y_offset -= 4.5  # Enhanced vertical spacing between levels
        
        # Layout process and decision nodes in sequence
        remaining_nodes = process_nodes + decision_nodes
        
        # Try to follow connection flow for better layout
        if start_nodes:
            current_level = start_nodes.copy()
            level = 0
            
            while current_level and remaining_nodes:
                next_level = []
                level_y = y_offset - (level * 4.5)  # Enhanced level spacing with more vertical space
                
                # Find nodes connected to current level
                for current_node in current_level:
                    for target_id in current_node.connections_to:
                        target_node = next((n for n in remaining_nodes if n.id == target_id), None)
                        if target_node and target_node not in next_level:
                            next_level.append(target_node)
                
                # Position nodes in this level with collision prevention
                if next_level:
                    # Check if current level has decision nodes for proper branching
                    has_decision_parent = any(parent.type == 'decision' for parent in current_level)
                    
                    for i, node in enumerate(next_level):
                        # Smart horizontal positioning with enhanced separation
                        if len(next_level) == 1:
                            proposed_x = 0
                        elif len(next_level) == 2 and has_decision_parent:
                            # Enhanced separation for decision branches (Yes/No paths)
                            proposed_x = -5.5 if i == 0 else 5.5  # 11.0 unit total separation
                        elif len(next_level) == 2:
                            # Regular two-node separation
                            proposed_x = -4.5 if i == 0 else 4.5
                        else:
                            # Enhanced spacing for multiple nodes
                            min_spacing = 5.0  # Enhanced visual spacing between nodes
                            total_width = (len(next_level) - 1) * min_spacing
                            proposed_x = -total_width/2 + (i * min_spacing)
                        
                        # Apply collision-free positioning
                        final_x, final_y = self._get_collision_free_position(proposed_x, level_y)
                        node.x = final_x
                        node.y = final_y
                        positioned_nodes.append(node)
                        
                        # Remove from remaining
                        if node in remaining_nodes:
                            remaining_nodes.remove(node)
                
                # Handle convergence - if multiple nodes connect to same target, center it
                if len(next_level) > 1:
                    self._handle_convergence(next_level, positioned_nodes)
                
                current_level = next_level
                level += 1
        
        # Position any remaining nodes with collision prevention
        for i, node in enumerate(remaining_nodes):
            proposed_x = i * 5.0 - (len(remaining_nodes) * 2.5)  # Enhanced spacing
            proposed_y = y_offset - (level * 4.5)  # Enhanced vertical spacing
            node.x, node.y = self._get_collision_free_position(proposed_x, proposed_y)
            positioned_nodes.append(node)
        
        # Layout end nodes at bottom with collision prevention
        end_y = y_offset - ((level + 1) * 4.5)  # Enhanced end node spacing
        for i, node in enumerate(end_nodes):
            proposed_x = i * 5.5  # Enhanced spread for end nodes
            node.x, node.y = self._get_collision_free_position(proposed_x, end_y)
            positioned_nodes.append(node)
        
        return positioned_nodes
    
    def _handle_convergence(self, level_nodes: List[Node], all_positioned: List[Node]) -> None:
        """Handle convergence points where multiple branches meet"""
        # Find nodes that multiple level nodes connect to
        convergence_targets = {}
        for node in level_nodes:
            for target_id in node.connections_to:
                if target_id not in convergence_targets:
                    convergence_targets[target_id] = []
                convergence_targets[target_id].append(node)
        
        # For convergence points, position the target centered between sources
        for target_id, source_nodes in convergence_targets.items():
            if len(source_nodes) > 1:
                # Calculate center position
                avg_x = sum(n.x for n in source_nodes) / len(source_nodes)
                # Update target position if it exists in positioned nodes
                for positioned_node in all_positioned:
                    if positioned_node.id == target_id:
                        positioned_node.x = avg_x
                        break
    
    def _get_collision_free_position(self, proposed_x: float, proposed_y: float) -> tuple[float, float]:
        """Find a collision-free position near the proposed coordinates"""
        
        # Round to reasonable precision
        x, y = round(proposed_x, 2), round(proposed_y, 2)
        
        # Check if position is already occupied
        if (x, y) not in self._occupied_positions and self._is_position_clear(x, y):
            self._occupied_positions.add((x, y))
            return x, y
        
        # Enhanced spiral search for better collision avoidance
        for offset in [1.0, 2.0, 3.0, 4.0, 5.0]:
            for dx in [-offset, 0, offset]:
                for dy in [-offset/3, 0, offset/3]:  # Conservative Y variations for better layout
                    test_x, test_y = round(x + dx, 2), round(y + dy, 2)
                    if (test_x, test_y) not in self._occupied_positions and self._is_position_clear(test_x, test_y):
                        self._occupied_positions.add((test_x, test_y))
                        return test_x, test_y
        
        # Fallback: force a position with warning
        logger.warning(f"Could not find collision-free position near ({x}, {y}), using fallback")
        fallback_x = x + len(self._occupied_positions) * 0.5
        self._occupied_positions.add((fallback_x, y))
        return fallback_x, y
    
    def _is_position_clear(self, x: float, y: float) -> bool:
        """Check if position is clear of other nodes with minimum separation"""
        
        for occupied_x, occupied_y in self._occupied_positions:
            distance = ((x - occupied_x) ** 2 + (y - occupied_y) ** 2) ** 0.5
            if distance < self._min_separation:
                return False
        return True
    
    def _optimize_provided_positions(self, nodes: List[Node]) -> List[Node]:
        """Optimize provided positions for better TikZ rendering with proper spacing"""
        
        if not nodes:
            return nodes
        
        # Find the bounding box of provided positions
        x_coords = [n.x for n in nodes if n.x is not None]
        y_coords = [n.y for n in nodes if n.y is not None]
        
        if not x_coords or not y_coords:
            return nodes
        
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        
        # Calculate center of bounding box
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        
        # Calculate scale factor to achieve good spacing (target ~4.5 units between adjacent nodes)
        # Typical Gemini positions: nodes are ~100-150px apart in pixel coordinates
        # We want them to be ~4.5 units apart in TikZ coordinates
        y_range = max_y - min_y if max_y != min_y else 1
        x_range = max_x - min_x if max_x != min_x else 1
        
        # Scale to fit comfortably with proper separation
        target_y_spacing = 4.5  # Units between nodes vertically
        num_y_levels = max(1, len(set(y_coords)) - 1)
        y_scale = (num_y_levels * target_y_spacing) / y_range if y_range > 0 else 1
        
        target_x_spacing = 5.0  # Units between nodes horizontally
        num_x_levels = max(1, len(set(x_coords)) - 1)
        x_scale = (num_x_levels * target_x_spacing) / x_range if x_range > 0 else 1
        
        for node in nodes:
            if node.x is not None and node.y is not None:
                # Center around origin and apply proper scaling
                node.x = (node.x - center_x) * x_scale
                node.y = -(node.y - center_y) * y_scale  # Invert Y axis
                
                # Clamp to safe ranges
                node.x = max(-15, min(15, node.x))
                node.y = max(-15, min(15, node.y))
        
        return nodes
    
    def _generate_nodes_block(self, diagram: Diagram) -> str:
        """Generate the nodes block for TikZ"""
        
        lines = []
        for node in diagram.elements:
            # Determine style
            style = self._get_enhanced_node_style(node)
            
            # Position string
            pos_str = ""
            if node.x is not None and node.y is not None:
                pos_str = f" at ({node.x:.2f}, {node.y:.2f})"
            
            # Safe node ID
            node_id = f"n{node.id}"
            
            # Generate node line
            line = f"\\node[{style}] ({node_id}){pos_str} {{{node.text}}};"
            lines.append(line)
        
        return '\n'.join(lines)
    
    def _generate_edges_block(self, diagram: Diagram) -> str:
        """Generate the edges block for TikZ with smart arrow placement and routing"""
        
        # Build a lookup for node positions and types
        node_lookup = {f"n{node.id}": node for node in diagram.elements}
        
        edges = []
        for node in diagram.elements:
            src_id = f"n{node.id}"
            src_node = node
            
            for idx, target_id in enumerate(node.connections_to):
                dst_id = f"n{target_id}"
                dst_node = node_lookup.get(dst_id)
                
                if not dst_node:
                    # Simple fallback if target not found
                    edges.append(f"\\draw[arrow] ({src_id}) -- ({dst_id});")
                    continue
                
                # Calculate relative positions for smart routing
                dx = (dst_node.x or 0) - (src_node.x or 0)
                dy = (dst_node.y or 0) - (src_node.y or 0)
                
                # Determine anchor points based on relative positions
                if abs(dy) > abs(dx):
                    # Primarily vertical connection
                    if dy < 0:
                        # Target is below source
                        src_anchor = "south"
                        dst_anchor = "north"
                    else:
                        # Target is above source
                        src_anchor = "north"
                        dst_anchor = "south"
                else:
                    # Primarily horizontal connection
                    if dx > 0:
                        # Target is to the right
                        src_anchor = "east"
                        dst_anchor = "west"
                    else:
                        # Target is to the left
                        src_anchor = "west"
                        dst_anchor = "east"
                
                # Handle decision nodes with branching
                if node.type == 'decision' and len(node.connections_to) > 1:
                    label = "Yes" if idx == 0 else "No"
                    
                    # For decision branches, use appropriate anchors
                    if len(node.connections_to) == 2:
                        if idx == 0:
                            # Yes branch - typically left or down-left
                            if dx < -1:
                                # Target is to the left
                                edge_line = f"\\draw[arrow] ({src_id}.west) -| node[near start, above] {{{label}}} ({dst_id}.north);"
                            elif dy < 0:
                                # Target is below
                                edge_line = f"\\draw[arrow] ({src_id}.south) -- node[midway, right] {{{label}}} ({dst_id}.north);"
                            else:
                                edge_line = f"\\draw[arrow] ({src_id}.west) -- node[midway, above] {{{label}}} ({dst_id}.east);"
                        else:
                            # No branch - typically right or down-right
                            if dx > 1:
                                # Target is to the right
                                edge_line = f"\\draw[arrow] ({src_id}.east) -| node[near start, above] {{{label}}} ({dst_id}.north);"
                            elif dy < 0:
                                # Target is below
                                edge_line = f"\\draw[arrow] ({src_id}.south) -- node[midway, left] {{{label}}} ({dst_id}.north);"
                            else:
                                edge_line = f"\\draw[arrow] ({src_id}.east) -- node[midway, above] {{{label}}} ({dst_id}.west);"
                    else:
                        # More than 2 branches
                        edge_line = f"\\draw[arrow] ({src_id}.{src_anchor}) -- node[midway, above] {{{label}}} ({dst_id}.{dst_anchor});"
                
                # Handle loop-back connections (target is above source)
                elif dy > 0:
                    # Looping back up - use curved path to avoid overlapping
                    if dx > 0:
                        edge_line = f"\\draw[arrow] ({src_id}.east) to[out=0, in=0, looseness=1.5] ({dst_id}.east);"
                    elif dx < 0:
                        edge_line = f"\\draw[arrow] ({src_id}.west) to[out=180, in=180, looseness=1.5] ({dst_id}.west);"
                    else:
                        # Same x, going up - curve around
                        edge_line = f"\\draw[arrow] ({src_id}.east) to[out=0, in=0, looseness=1.2] ({dst_id}.east);"
                
                # Handle horizontal connections
                elif abs(dx) > 2 and abs(dy) < 1:
                    # Horizontal connection - use direct east/west anchors
                    if dx > 0:
                        edge_line = f"\\draw[arrow] ({src_id}.east) -- ({dst_id}.west);"
                    else:
                        edge_line = f"\\draw[arrow] ({src_id}.west) -- ({dst_id}.east);"
                
                # Handle diagonal connections with orthogonal routing
                elif abs(dx) > 1 and abs(dy) > 1:
                    # Diagonal - use orthogonal path for cleaner look
                    if dy < 0:
                        # Going down
                        if dx > 0:
                            edge_line = f"\\draw[arrow] ({src_id}.south) |- ({dst_id}.west);"
                        else:
                            edge_line = f"\\draw[arrow] ({src_id}.south) |- ({dst_id}.east);"
                    else:
                        # Going up - curve around
                        edge_line = f"\\draw[arrow] ({src_id}.{src_anchor}) to[bend right=20] ({dst_id}.{dst_anchor});"
                
                # Standard vertical connection
                else:
                    edge_line = f"\\draw[arrow] ({src_id}.{src_anchor}) -- ({dst_id}.{dst_anchor});"
                
                edges.append(edge_line)
        
        return '\n'.join(edges)
    
    def _get_enhanced_node_style(self, node: Node) -> str:
        """Get enhanced style for node based on type and shape"""
        
        if node.type in ['start', 'end'] or node.shape == 'oval':
            return self.enhanced_styles['start']
        elif node.type == 'decision' or node.shape == 'diamond':
            return self.enhanced_styles['decision']
        else:
            return self.enhanced_styles['process']
    
    def _check_position_validity(self, elements: List[Dict]) -> bool:
        """Check if provided positions are valid and distinct"""
        
        if len(elements) <= 1:
            return True
        
        positions = []
        for element in elements:
            position = element.get("position", {"x": 0, "y": 0})
            x = position.get("x", 0)
            y = position.get("y", 0)
            positions.append((x, y))
        
        # Check if all positions are the same (invalid)
        unique_positions = set(positions)
        if len(unique_positions) == 1:
            logger.info("LatexFlowchartGenerator: All positions identical, using automatic layout")
            return False
        
        # Check if positions are reasonable (not too large)
        for x, y in positions:
            if abs(x) > 100 or abs(y) > 100:
                logger.info("LatexFlowchartGenerator: Positions too large, using automatic layout")
                return False
        
        return True