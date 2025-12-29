import tempfile
import os
import shutil
import subprocess
import logging
import re
from typing import Tuple, Optional
from pdf2image import convert_from_path
from src.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class FlowchartCompiler:
    """Compiles LaTeX flowchart code to PDF and PNG formats"""
    
    def __init__(self):
        self.tectonic_paths = [
            "D:\\Software Projects Backup\\Tizkit\\backend\\tectonic\\tectonic.exe",
            "tectonic"  # System PATH
        ]
        self.poppler_path = "D:\\Software Projects Backup\\Tizkit\\backend\\poppler-23.01.0\\Library\\bin"
    
    def compile_latex(self, latex_code: str, output_format: str = "pdf") -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Compile LaTeX code to PDF or PNG format with enhanced error handling
        
        Args:
            latex_code: LaTeX source code
            output_format: 'pdf' or 'png'
            
        Returns:
            Tuple of (success, content_bytes, error_message)
        """
        logger.info(f"FlowchartCompiler: Starting compilation to {output_format}")
        
        temp_dir = None
        try:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp(prefix="flowchart_")
            logger.info(f"FlowchartCompiler: Using temp_dir: {temp_dir}")
            
            # Sanitize LaTeX code before compilation
            sanitized_latex = self._sanitize_latex_code(latex_code)
            
            # Write LaTeX to file
            tex_file = os.path.join(temp_dir, "flowchart.tex")
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(sanitized_latex)
            logger.info(f"FlowchartCompiler: Written sanitized LaTeX to {tex_file}")
            
            # Try compilation with multiple fallback strategies
            success, pdf_path, error_msg = self._compile_with_fallbacks(tex_file, temp_dir, sanitized_latex)
            if not success:
                return False, None, error_msg
            
            if output_format == "pdf":
                # Read and return PDF
                with open(pdf_path, 'rb') as f:
                    content = f.read()
                logger.info(f"FlowchartCompiler: PDF read success, size={len(content)} bytes")
                return True, content, None
            
            elif output_format == "png":
                # Convert PDF to PNG
                png_content = self._convert_pdf_to_png(pdf_path)
                if png_content:
                    logger.info(f"FlowchartCompiler: PNG conversion success, size={len(png_content)} bytes")
                    return True, png_content, None
                else:
                    return False, None, "Failed to convert PDF to PNG"
            
            else:
                return False, None, f"Unsupported output format: {output_format}"
                
        except Exception as e:
            error_msg = f"Compilation error: {str(e)}"
            logger.error(f"FlowchartCompiler: {error_msg}")
            return False, None, error_msg
            
        finally:
            # Clean up temporary directory
            if temp_dir and os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir)
                    logger.info(f"FlowchartCompiler: Cleaned up temp directory")
                except Exception as e:
                    logger.warning(f"FlowchartCompiler: Failed to clean up temp directory: {e}")
    
    def _find_tectonic(self) -> Optional[str]:
        """Find working Tectonic executable"""
        logger.info(f"FlowchartCompiler: Searching for Tectonic in {len(self.tectonic_paths)} paths...")
        
        for path in self.tectonic_paths:
            logger.info(f"FlowchartCompiler: Trying Tectonic path: {path}")
            try:
                result = subprocess.run([path, "--version"], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    logger.info(f"FlowchartCompiler: Found working Tectonic at: {path}")
                    return path
            except Exception as e:
                logger.debug(f"FlowchartCompiler: Tectonic not found at {path}: {e}")
        
        logger.error("FlowchartCompiler: No working Tectonic installation found")
        return None
    
    def _compile_with_fallbacks(self, tex_file: str, temp_dir: str, latex_code: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """Compile LaTeX with multiple fallback strategies for robustness"""
        
        tectonic_path = self._find_tectonic()
        if not tectonic_path:
            return False, None, "Tectonic not found. Please install Tectonic LaTeX engine."
        
        logger.info(f"FlowchartCompiler: Using Tectonic: {tectonic_path}")
        
        # Strategy 1: Try original sanitized code
        success, pdf_path, error_msg = self._try_compilation(tex_file, temp_dir, tectonic_path)
        
        if success:
            logger.info("FlowchartCompiler: Original compilation successful")
            return True, pdf_path, None
        
        # Check if it's a dimension error
        if error_msg and "dimension too large" in error_msg.lower():
            logger.info("FlowchartCompiler: Dimension error detected, trying simplified version...")
            
            # Strategy 2: Create simplified version with smaller coordinates
            simplified_latex = self._create_simplified_flowchart(latex_code)
            
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(simplified_latex)
            
            success, pdf_path, error_msg2 = self._try_compilation(tex_file, temp_dir, tectonic_path)
            
            if success:
                logger.info("FlowchartCompiler: Simplified compilation successful")
                return True, pdf_path, None
            
            logger.info("FlowchartCompiler: Simplified version failed, creating minimal fallback...")
            
            # Strategy 3: Create minimal safe flowchart
            minimal_latex = self._create_minimal_flowchart()
            
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(minimal_latex)
            
            success, pdf_path, error_msg3 = self._try_compilation(tex_file, temp_dir, tectonic_path)
            
            if success:
                logger.info("FlowchartCompiler: Minimal fallback compilation successful")
                return True, pdf_path, None
            
            # If all strategies failed, return comprehensive error
            combined_error = f"All compilation strategies failed:\n1. Original: {error_msg}\n2. Simplified: {error_msg2}\n3. Minimal: {error_msg3}"
            return False, None, combined_error
        
        # For non-dimension errors, return original error
        return False, None, error_msg
    
    def _try_compilation(self, tex_file: str, temp_dir: str, tectonic_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """Try a single compilation attempt"""
        
        try:
            # Change to temp directory for compilation
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            # Set up enhanced environment for Tectonic
            env = os.environ.copy()
            env['FONTCONFIG_FILE'] = ''
            env['FONTCONFIG_PATH'] = ''
            env['TECTONIC_MINIMAL_MODE'] = '1'
            # Increase memory limits for large diagrams
            env['main_memory'] = '12000000'
            env['extra_mem_top'] = '12000000'
            
            # Run Tectonic compilation
            cmd = [tectonic_path, '--print', '--keep-logs', '--outfmt=pdf', 'flowchart.tex']
            logger.info(f"FlowchartCompiler: Running Tectonic...")
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, env=env)
            
            # Log Tectonic output
            logger.info(f"FlowchartCompiler: Tectonic exit code: {result.returncode}")
            if result.stdout:
                logger.debug(f"FlowchartCompiler: Tectonic stdout: {result.stdout[:500]}")
            if result.stderr:
                logger.debug(f"FlowchartCompiler: Tectonic stderr: {result.stderr[:500]}")
            
            # Restore original directory
            os.chdir(original_cwd)
            
            if result.returncode == 0:
                pdf_path = os.path.join(temp_dir, "flowchart.pdf")
                if os.path.exists(pdf_path):
                    logger.info("FlowchartCompiler: Tectonic compilation successful!")
                    return True, pdf_path, None
                else:
                    return False, None, "PDF file was not generated"
            else:
                error_output = result.stderr or result.stdout or "Unknown compilation error"
                logger.info(f"FlowchartCompiler: Tectonic compilation failed: {error_output[:200]}...")
                return False, None, f"LaTeX compilation failed: {error_output}"
                
        except subprocess.TimeoutExpired:
            logger.error("FlowchartCompiler: Tectonic compilation timed out")
            return False, None, "Compilation timed out after 60 seconds"
        except Exception as e:
            logger.error(f"FlowchartCompiler: Compilation error: {str(e)}")
            return False, None, f"Compilation error: {str(e)}"
        finally:
            try:
                os.chdir(original_cwd)
            except:
                pass
    
    def _convert_pdf_to_png(self, pdf_path: str) -> Optional[bytes]:
        """Convert PDF to PNG using pdf2image"""
        try:
            logger.info("FlowchartCompiler: Converting to PNG...")
            logger.info(f"FlowchartCompiler: Using poppler_path for pdf2image: {self.poppler_path}")
            
            # Convert PDF to images
            images = convert_from_path(
                pdf_path,
                dpi=300,
                first_page=1,
                last_page=1,
                poppler_path=self.poppler_path
            )
            
            if not images:
                logger.error("FlowchartCompiler: No images generated from PDF")
                return None
            
            # Convert first page to PNG bytes
            import io
            img_bytes = io.BytesIO()
            images[0].save(img_bytes, format='PNG', dpi=(300, 300))
            img_bytes.seek(0)
            
            png_content = img_bytes.read()
            logger.info(f"FlowchartCompiler: PNG conversion result: bytes={len(png_content)}, error_msg=None")
            return png_content
            
        except Exception as e:
            logger.error(f"FlowchartCompiler: PNG conversion failed: {str(e)}")
            logger.info(f"FlowchartCompiler: PNG conversion result: bytes=0, error_msg={str(e)}")
            return None
    
    def _sanitize_latex_code(self, latex_code: str) -> str:
        """Sanitize LaTeX code to prevent dimension errors and common issues"""
        
        logger.info("FlowchartCompiler: Sanitizing LaTeX code for safer compilation...")
        
        # Apply coordinate sanitization
        sanitized = self._sanitize_tikz_coordinates(latex_code)
        
        # Fix common LaTeX issues
        sanitized = self._fix_common_latex_issues(sanitized)
        
        # Ensure proper document structure
        sanitized = self._ensure_safe_document_structure(sanitized)
        
        return sanitized
    
    def _sanitize_tikz_coordinates(self, content: str) -> str:
        """Scale down TikZ coordinates to prevent 'Dimension too large' errors"""
        
        # Pattern to match coordinates like (x,y) or at (x,y)
        coord_pattern = r'(\(|at\s*\()\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*(\))'
        
        def scale_coordinate(match):
            prefix = match.group(1)  # '(' or 'at ('
            x = float(match.group(2))
            y = float(match.group(3))
            suffix = match.group(4)  # ')'
            
            # LaTeX maximum safe coordinate (conservative limit)
            max_safe_coord = 50  # Very conservative for flowcharts
            
            scale_factor = 1.0
            max_coord = max(abs(x), abs(y))
            
            if max_coord > max_safe_coord:
                scale_factor = max_safe_coord / max_coord
                x *= scale_factor
                y *= scale_factor
                logger.info(f"FlowchartCompiler: Scaled coordinates ({match.group(2)}, {match.group(3)}) -> ({x:.2f}, {y:.2f})")
            
            return f"{prefix}{x:.2f},{y:.2f}{suffix}"
        
        # Apply coordinate scaling
        sanitized_content = re.sub(coord_pattern, scale_coordinate, content)
        
        # Also sanitize node distances and dimensions
        dimension_patterns = [
            (r'(node\s+distance\s*=\s*)([+-]?\d+\.?\d*)(cm|mm|pt|in)', 'node distance'),
            (r'(minimum\s+width\s*=\s*)([+-]?\d+\.?\d*)(cm|mm|pt|in)', 'minimum width'),
            (r'(minimum\s+height\s*=\s*)([+-]?\d+\.?\d*)(cm|mm|pt|in)', 'minimum height')
        ]
        
        for pattern, desc in dimension_patterns:
            def scale_dimension(match):
                prefix = match.group(1)
                value = float(match.group(2))
                unit = match.group(3)
                
                # Apply conservative limits based on unit
                if unit == 'cm' and value > 8:
                    value = min(value, 8)
                    logger.info(f"FlowchartCompiler: Limited {desc} to {value}cm")
                elif unit == 'mm' and value > 80:
                    value = min(value, 80)
                    logger.info(f"FlowchartCompiler: Limited {desc} to {value}mm")
                elif unit in ['pt', 'in'] and value > 200:
                    value = min(value, 200)
                    logger.info(f"FlowchartCompiler: Limited {desc} to {value}{unit}")
                
                return f"{prefix}{value}{unit}"
            
            sanitized_content = re.sub(pattern, scale_dimension, sanitized_content)
        
        return sanitized_content
    
    def _fix_common_latex_issues(self, latex_code: str) -> str:
        """Fix common LaTeX issues that cause compilation failures"""
        
        # Escape special characters in text content
        fixes = [
            # Fix underscore issues
            (r'(?<!\\)_', r'\_'),
            # Fix ampersand issues
            (r'(?<!\\)&', r'\&'),
            # Fix dollar sign issues
            (r'(?<!\\)\$', r'\$'),
            # Fix percent sign issues
            (r'(?<!\\)%', r'\%')
        ]
        
        result = latex_code
        for pattern, replacement in fixes:
            result = re.sub(pattern, replacement, result)
        
        return result
    
    def _ensure_safe_document_structure(self, latex_code: str) -> str:
        """Ensure the document has safe structure with proper limits"""
        
        if '\\documentclass' in latex_code:
            # Add dimension fixes to existing document
            geometry_fix = r'\usepackage[margin=0.5in,paperwidth=12in,paperheight=12in]{geometry}'
            dimension_fix = r'''% Increase LaTeX dimension limits
\maxdimen=100in
\hsize=10in
\vsize=10in'''
            
            # Insert after documentclass
            result = re.sub(r'(\\documentclass\[.*?\]\{.*?\})',
                          f'\\1\n{geometry_fix}\n{dimension_fix}',
                          latex_code)
            
            return result
        
        return latex_code
    
    def _create_simplified_flowchart(self, original_latex: str) -> str:
        """Create a simplified version of the flowchart with minimal coordinates"""
        
        logger.info("FlowchartCompiler: Creating simplified flowchart version...")
        
        # Extract text content from nodes if possible
        node_texts = re.findall(r'\\node.*?\{([^}]+)\}', original_latex)
        
        simplified = r'''\documentclass[12pt]{article}
\usepackage[utf8]{inputenc}
\usepackage{tikz}
\usepackage[margin=0.5in,paperwidth=8in,paperheight=8in]{geometry}
\usetikzlibrary{shapes.geometric,arrows,positioning}

% Safe dimension limits
\maxdimen=50in
\hsize=7in
\vsize=7in

\tikzstyle{startstop} = [ellipse, rounded corners, minimum width=2cm, minimum height=1cm, text centered, draw=black, fill=red!30]
\tikzstyle{process} = [rectangle, minimum width=2cm, minimum height=1cm, text centered, draw=black, fill=orange!30]
\tikzstyle{decision} = [diamond, minimum width=2cm, minimum height=1cm, text centered, draw=black, fill=green!30]
\tikzstyle{arrow} = [thick,->,>=stealth]

\begin{document}

\begin{center}
\begin{tikzpicture}[node distance=1.5cm]

'''
        
        # Add simplified nodes in a safe linear layout
        if node_texts:
            for i, text in enumerate(node_texts[:5]):  # Limit to 5 nodes
                clean_text = re.sub(r'[^\w\s]', '', text)[:20]  # Clean and limit text
                style = 'startstop' if i == 0 or i == len(node_texts)-1 else 'process'
                y_pos = -i * 1.5
                
                if i == 0:
                    simplified += f'\\node (node{i}) [{style}] at (0,{y_pos}) {{{clean_text}}};\n'
                else:
                    simplified += f'\\node (node{i}) [{style}] at (0,{y_pos}) {{{clean_text}}};\n'
                    simplified += f'\\draw [arrow] (node{i-1}) -- (node{i});\n'
        else:
            # Default minimal flowchart
            simplified += r'''\node (start) [startstop] at (0,0) {Start};
\node (process) [process] at (0,-2) {Process};
\node (end) [startstop] at (0,-4) {End};

\draw [arrow] (start) -- (process);
\draw [arrow] (process) -- (end);
'''
        
        simplified += r'''
\end{tikzpicture}
\end{center}

\textit{Note: Simplified version of the handwritten flowchart due to compilation constraints.}

\end{document}'''
        
        return simplified
    
    def _create_minimal_flowchart(self) -> str:
        """Create minimal safe flowchart as final fallback"""
        
        logger.info("FlowchartCompiler: Creating minimal safe flowchart...")
        
        return r'''\documentclass{article}
\usepackage{tikz}

\begin{document}

\begin{center}
\begin{tikzpicture}
\draw (0,0) rectangle (3,1);
\node at (1.5,0.5) {Flowchart};
\node at (1.5,-0.5) {Compilation Error};
\end{tikzpicture}
\end{center}

\textbf{Flowchart Compilation Error}

The handwritten flowchart could not be compiled due to LaTeX dimension constraints or syntax issues. This often occurs with:
\begin{itemize}
\item Large coordinate values in the diagram
\item Complex TikZ structures
\item Special characters in node text
\end{itemize}

Please try uploading a simpler flowchart or contact support.

\end{document}'''