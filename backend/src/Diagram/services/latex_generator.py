import logging
import re
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

class DiagramLatexGenerator:
    """
    Generates professional LaTeX/TikZ code for diagrams, flowcharts, and networks.
    
    Features:
    - Automatic color handling: Converts hex codes to named colors or applies smart defaults
    - Type-specific defaults: Rectangles (lightblue), Circles (lightgreen), Diamonds (yellow)
    - Coordinate normalization: Safely scales and clamps coordinates to fit LaTeX dimensions
    - Global color definitions: All colors defined once to prevent LaTeX errors
    """

    # Built-in safe color palette
    COLOR_MAP = {
        "lightblue": "E3F2FD",
        "blue": "1976D2",
        "darkblue": "0D47A1",
        "lightgreen": "E8F5E8",
        "green": "388E3C",
        "darkgreen": "1B5E20",
        "lightgray": "F5F5F5",
        "gray": "757575",
        "darkgray": "424242",
        "mediumgray": "666666",
        "lightergray": "CCCCCC",
        "verylightgray": "EEEEEE",
        "darkergray": "333333",
        "yellow": "F57F17",
        "orange": "FF9800",
        "darkorange": "F57C00",
        "red": "F44336",
        "darkred": "B71C1C",
        "purple": "800080",
        "brown": "A52A2A",
        "pink": "FFC0CB",
        "magenta": "FF00FF",
        "cyan": "00FFFF",
    }

    SCALE_FACTOR = 50.0  # adjustable for coordinate normalization

    # ----------------------------------------------------------------------
    # Public API
    # ----------------------------------------------------------------------

    def generate_latex(self, project_type: str, data: Dict[str, Any]) -> str:
        """
        Entry point: generate LaTeX code based on project type.
        """
        if project_type == "diagram":
            body, used_colors = self._generate_diagram(data)
        elif project_type == "flowchart":
            body, used_colors = self._generate_flowchart(data)
        elif project_type == "network":
            body, used_colors = self._generate_network(data)
        else:
            logger.error(f"Unsupported project type: {project_type}")
            return self._create_empty_document()

        return self._create_complete_document(body, used_colors)

    def generate_diagram_latex(self, data: Dict[str, Any]) -> str:
        """
        Generates LaTeX code specifically for diagrams.
        """
        body, used_colors = self._generate_diagram(data)
        return self._create_complete_document(body, used_colors)

    # ----------------------------------------------------------------------
    # Helpers
    # ----------------------------------------------------------------------

    def _escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters in labels."""
        if not isinstance(text, str):
            return str(text)
        return (text.replace('&', '\\&')
                    .replace('%', '\\%')
                    .replace('_', '\\_')
                    .replace('$', '\\$')
                    .replace('#', '\\#')
                    .replace('{', '\\{')
                    .replace('}', '\\}'))

    def _normalize_colors(self, node: Dict[str, Any]) -> Tuple[str, str]:
        """Normalize fill/draw color field names across node data. Always return valid TikZ color names."""
        # Get color values from node, or use defaults
        fill = node.get("fillColor") or node.get("fill")
        draw = node.get("strokeColor") or node.get("draw")
        
        # Default colors if none provided
        DEFAULT_FILL = "lightblue"
        DEFAULT_DRAW = "darkblue"
        
        # Convert hex codes to named colors or use defaults
        if fill:
            if isinstance(fill, str) and (fill.startswith('#') or re.match(r"^[0-9A-Fa-f]{6}$", fill)):
                # Map common hex codes to named colors
                fill = self._hex_to_named_color(fill)
        else:
            fill = DEFAULT_FILL
            
        if draw:
            if isinstance(draw, str) and (draw.startswith('#') or re.match(r"^[0-9A-Fa-f]{6}$", draw)):
                draw = self._hex_to_named_color(draw)
        else:
            draw = DEFAULT_DRAW
            
        return fill, draw
    
    def _hex_to_named_color(self, hex_color: str) -> str:
        """Convert hex color to closest named color from COLOR_MAP."""
        # Remove # if present
        hex_color = hex_color.lstrip('#').upper()
        
        # Map common hex values to named colors (including frontend defaults)
        common_mappings = {
            "FFFFFF": "verylightgray",
            "F5F5F5": "lightgray",      # Frontend default fill
            "666666": "mediumgray",     # Frontend default stroke
            "000000": "darkgray",
            "E3F2FD": "lightblue",
            "1976D2": "blue",
            "0D47A1": "darkblue",
            "E8F5E8": "lightgreen",
            "388E3C": "green",
            "1B5E20": "darkgreen",
            "757575": "gray",
            "424242": "darkgray",
            "EEEEEE": "verylightgray",
            "CCCCCC": "lightergray",
            "333333": "darkergray",
            # Common user colors
            "FF0000": "red",
            "00FF00": "green",
            "0000FF": "blue",
            "FFFF00": "yellow",
            "FF9800": "orange",
            "F57C00": "darkorange",
            "F44336": "red",
            "B71C1C": "darkred",
            "800080": "purple",
            "A52A2A": "brown",
            "FFC0CB": "pink",
            "FF00FF": "magenta",
            "00FFFF": "cyan",
        }
        
        if hex_color in common_mappings:
            return common_mappings[hex_color]
        
        # For unmapped hex codes, try to find closest color
        # Convert hex to RGB for basic color detection
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            
            # Determine dominant color channel
            max_channel = max(r, g, b)
            min_channel = min(r, g, b)
            
            # Grayscale detection
            if max_channel - min_channel < 30:  # Low saturation = gray
                if max_channel > 220:
                    return "verylightgray"
                elif max_channel > 180:
                    return "lightgray"
                elif max_channel > 140:
                    return "gray"
                elif max_channel > 100:
                    return "mediumgray"
                else:
                    return "darkgray"
            
            # Color detection based on dominant channel
            if r > g and r > b:
                return "red" if r > 200 else "darkred"
            elif g > r and g > b:
                return "green" if g > 200 else "darkgreen"
            elif b > r and b > g:
                return "blue" if b > 200 else "darkblue"
            elif r > 150 and g > 150 and b < 100:
                return "yellow"
            elif r > 150 and g > 100 and b < 100:
                return "orange"
            
        except (ValueError, IndexError):
            pass
        
        # Ultimate fallback to a nice default color
        return "lightblue"

    def _draw_connection(self, src: str, dst: str, ctype: str = "arrow") -> str:
        """Return TikZ code for a connection between two nodes."""
        mapping = {
            "arrow": "\\draw[->] ({}) -- ({});",
            "line": "\\draw[-] ({}) -- ({});",
            "curved": "\\draw[->, bend left] ({}) to ({});",
            "double": "\\draw[<->] ({}) -- ({});",
        }
        template = mapping.get(ctype, mapping["arrow"])
        return template.format(src, dst)

    # ----------------------------------------------------------------------
    # Core LaTeX Document Assembly
    # ----------------------------------------------------------------------

    def _create_complete_document(self, tikz_body: str, used_colors: List[str]) -> str:
        """Wraps TikZ body in a complete LaTeX document with proper color definitions."""
        color_defs = self._get_color_definitions(used_colors)

        return f"""
\\documentclass[12pt]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{geometry}}
\\usepackage{{amsmath, amsfonts, amssymb}}
\\usepackage{{graphicx}}
\\usepackage[HTML]{{xcolor}}
\\usepackage{{tikz}}
\\usepackage{{float}}

% TikZ libraries
\\usetikzlibrary{{shapes.geometric, arrows, positioning, backgrounds, fit, calc, decorations.pathmorphing, decorations.markings, arrows.meta}}

\\geometry{{margin=0.5in}}

% Color definitions
{chr(10).join(color_defs)}

\\begin{{document}}
\\begin{{center}}
{tikz_body}
\\end{{center}}
\\end{{document}}
""".strip()

    def _create_empty_document(self) -> str:
        """Returns a minimal LaTeX document when nothing is generated."""
        return r"""
\documentclass{article}
\usepackage{tikz}
\begin{document}
\begin{center}
(No diagram generated)
\end{center}
\end{document}
""".strip()

    # ----------------------------------------------------------------------
    # Color Handling
    # ----------------------------------------------------------------------

    def _get_color_definitions(self, used_colors: List[str]) -> List[str]:
        """
        Build \definecolor lines for all used colors.
        Unknown or invalid color names are mapped to gray to prevent LaTeX errors.
        """
        definitions = []
        added_colors = set()
        fallback_gray_added = False
        for color in sorted(set(used_colors)):
            if not isinstance(color, str):
                continue
            if color.startswith('#'):
                if not fallback_gray_added:
                    definitions.append("\\definecolor{gray}{HTML}{757575} % fallback gray")
                    fallback_gray_added = True
                continue
            if color in self.COLOR_MAP and color not in added_colors:
                hex_code = self.COLOR_MAP[color]
                definitions.append(f"\\definecolor{{{color}}}{{HTML}}{{{hex_code}}}")
                added_colors.add(color)
            elif re.match(r"^[0-9A-Fa-f]{{6}}$", color) and f"custom{color}" not in added_colors:
                definitions.append(f"\\definecolor{{custom{color}}}{{HTML}}{{{color}}}")
                added_colors.add(f"custom{color}")
            elif color not in added_colors:
                if not fallback_gray_added:
                    definitions.append("\\definecolor{gray}{HTML}{757575} % fallback gray")
                    fallback_gray_added = True
                added_colors.add(color)
        return definitions

    # ----------------------------------------------------------------------
    # Diagram Types
    # ----------------------------------------------------------------------

    def _generate_diagram(self, data: Dict[str, Any]):
        nodes = data.get("nodes", [])
        connections = data.get("connections", [])
        tikz_lines = ["\\begin{tikzpicture}[node distance=2cm, auto, thick, every node/.style={align=center}, >={Stealth[length=3mm,width=2mm]}]"]

        used_colors = []

        # Center and scale all node positions to fit the page
        if nodes:
            xs = [node.get("x", 0) for node in nodes]
            ys = [node.get("y", 0) for node in nodes]
            min_x, max_x = min(xs), max(xs)
            min_y, max_y = min(ys), max(ys)
            
            # Target area: -5 to 5 in both axes
            target_min, target_max = -5, 5
            dx = max_x - min_x if max_x > min_x else 1
            dy = max_y - min_y if max_y > min_y else 1
            
            # Prevent extreme scaling
            scale_x = (target_max - target_min) / dx
            scale_y = (target_max - target_min) / dy
            scale = min(scale_x, scale_y, 1.0)  # Cap at 1.0 to prevent huge magnification
            
            # Calculate centering offsets
            offset_x = target_min - min_x * scale + ((target_max - target_min) - dx * scale) / 2
            offset_y = target_min - min_y * scale + ((target_max - target_min) - dy * scale) / 2
            
            logger.info(f"DiagramLatexGenerator: Coordinate scaling - scale={scale:.4f}, offset_x={offset_x:.2f}, offset_y={offset_y:.2f}")
            logger.info(f"DiagramLatexGenerator: Input range - x:[{min_x}, {max_x}], y:[{min_y}, {max_y}]")
        else:
            scale = 1
            offset_x = 0
            offset_y = 0

        for i, node in enumerate(nodes):
            node_id = node.get("id", f"node{i}")
            label = self._escape_latex(node.get("label", node.get("text", "Node")))
            raw_x = node.get("x", 0)
            raw_y = node.get("y", 0)
            x = raw_x * scale + offset_x
            y = -raw_y * scale + offset_y
            
            # Clamp coordinates to safe LaTeX dimensions (±15cm)
            x = max(-15, min(15, x))
            y = max(-15, min(15, y))
            
            node_type = node.get("type", "rectangle")
            fill, draw = self._normalize_colors(node)
            
            # Apply node type-specific default colors if generic defaults were used
            if not node.get("fillColor") and not node.get("fill"):
                if node_type == "circle":
                    fill = "lightgreen"
                    draw = "darkgreen"
                elif node_type == "diamond":
                    fill = "yellow"
                    draw = "darkorange"
                else:  # rectangle
                    fill = "lightblue"
                    draw = "darkblue"

            used_colors.extend([fill, draw])

            if node_type == "circle":
                raw_size = node.get('width', 2) * 0.5
                min_size = max(1, min(raw_size, 3))
                tikz_lines.append(
                    f"\\node ({node_id}) [circle, fill={fill}, draw={draw}, minimum size={min_size}cm] at ({x}, {y}) {{{label}}};"
                )
            elif node_type == "diamond":
                raw_size = min(node.get('width', 2), node.get('height', 2)) * 0.5
                min_size = max(1, min(raw_size, 3))
                tikz_lines.append(
                    f"\\node ({node_id}) [diamond, fill={fill}, draw={draw}, aspect=2, minimum size={min_size}cm] at ({x}, {y}) {{{label}}};"
                )
            else:
                tikz_lines.append(
                    f"\\node ({node_id}) [rectangle, fill={fill}, draw={draw}, text width=2cm, minimum height=1cm, text centered, rounded corners=2pt] at ({x}, {y}) {{{label}}};"
                )

        for conn in connections:
            src = conn.get("from")
            dst = conn.get("to")
            ctype = conn.get("type", "arrow")
            tikz_lines.append(self._draw_connection(src, dst, ctype))

        tikz_lines.append("\\end{tikzpicture}")
        return "\n".join(tikz_lines), used_colors

    def _generate_flowchart(self, data: Dict[str, Any]):
        nodes = data.get("nodes", [])
        connections = data.get("connections", [])
        tikz_lines = ["\\begin{tikzpicture}[node distance=2cm, auto, thick, >={Stealth[length=3mm,width=2mm]}]"]

        used_colors = []

        for i, node in enumerate(nodes):
            node_id = node.get("id", f"node{i}")
            label = self._escape_latex(node.get("label", "Step"))
            shape = node.get("shape", "rectangle")
            fill, draw = self._normalize_colors(node)
            position = node.get("position", "")

            used_colors.extend([fill, draw])
            tikz_lines.append(
                f"\\node ({node_id}) [{shape}, fill={fill}, draw={draw}, "
                f"text width=3cm, minimum height=1cm, text centered, rounded corners=2pt] "
                f"{position} {{{label}}};"
            )

        for conn in connections:
            src = conn.get("from")
            dst = conn.get("to")
            tikz_lines.append(self._draw_connection(src, dst, "arrow"))

        tikz_lines.append("\\end{tikzpicture}")
        return "\n".join(tikz_lines), used_colors

    def _generate_network(self, data: Dict[str, Any]):
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        tikz_lines = ["\\begin{tikzpicture}[node distance=2cm, auto, thick, >={Stealth[length=3mm,width=2mm]}]"]

        used_colors = []

        for i, node in enumerate(nodes):
            node_id = node.get("id", f"node{i}")
            label = self._escape_latex(node.get("label", "Device"))
            x = node.get("x", 0) / self.SCALE_FACTOR
            y = -node.get("y", 0) / self.SCALE_FACTOR
            
            # Clamp coordinates to safe LaTeX dimensions (±15cm)
            x = max(-15, min(15, x))
            y = max(-15, min(15, y))
            
            shape = node.get("shape", "circle")
            fill, draw = self._normalize_colors(node)

            used_colors.extend([fill, draw])
            tikz_lines.append(
                f"\\node ({node_id}) [{shape}, fill={fill}, draw={draw}, "
                f"text centered, minimum size=1cm] at ({x}, {y}) {{{label}}};"
            )

        for edge in edges:
            src = edge.get("from")
            dst = edge.get("to")
            etype = edge.get("type", "line")
            tikz_lines.append(self._draw_connection(src, dst, etype))

        tikz_lines.append("\\end{tikzpicture}")
        return "\n".join(tikz_lines), used_colors


diagram_latex_generator = DiagramLatexGenerator()
