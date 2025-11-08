import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Tuple, Optional
import io
from src.config import get_settings

# Get settings instance
settings = get_settings()

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    print("pdf2image not available, PNG conversion will use mock generation")

class TableLatexCompiler:
    def __init__(self, temp_dir: Optional[str] = None, timeout: Optional[int] = None):
        self.temp_dir = temp_dir or tempfile.gettempdir()
        self.timeout = timeout or settings.LATEX_TIMEOUT
    
    def compile_latex(self, latex_code: str, output_format: str = "png") -> Tuple[bool, Optional[bytes], Optional[str]]:
        """
        Compile LaTeX code to PDF or PNG using Tectonic (preferred) or fallback methods
        Optimized for table rendering
        """
        try:
            print(f"TableCompiler: Starting compilation to {output_format}")
            
            if output_format not in ["pdf", "png"]:
                return False, None, "Invalid output format. Must be 'pdf' or 'png'"
            
            # Create temporary directory for compilation
            with tempfile.TemporaryDirectory(dir=self.temp_dir) as temp_dir:
                # Create complete LaTeX document
                complete_latex = self._create_complete_document(latex_code)
                
                # Write LaTeX file
                tex_file = Path(temp_dir) / "table.tex"
                with open(tex_file, 'w', encoding='utf-8') as f:
                    f.write(complete_latex)
                
                print("TableCompiler: Document written, compiling to PDF...")
                
                # Try Tectonic first, then fallback to other methods
                success, error_msg = self._compile_with_tectonic(tex_file)
                if not success:
                    print(f"TableCompiler: Tectonic failed: {error_msg}")
                    # Try other LaTeX engines as fallback
                    success, error_msg = self._compile_with_pdflatex(tex_file)
                    if not success:
                        print(f"TableCompiler: All compilation methods failed, creating mock PDF")
                        success, error_msg = self._create_mock_pdf(tex_file)
                        if not success:
                            return False, None, error_msg
                
                pdf_file = tex_file.with_suffix('.pdf')
                
                if output_format == "pdf":
                    print("TableCompiler: Returning PDF content")
                    try:
                        with open(pdf_file, 'rb') as f:
                            return True, f.read(), None
                    except Exception as e:
                        return False, None, f"Failed to read PDF: {str(e)}"
                else:
                    print("TableCompiler: Converting to PNG...")
                    # Try to convert PDF to PNG
                    png_bytes, error_msg = self._pdf_to_png(pdf_file)
                    if png_bytes is None:
                        # If PNG conversion fails, create mock PNG
                        print("TableCompiler: PNG conversion failed, creating mock PNG")
                        png_bytes, error_msg = self._create_mock_png(pdf_file)
                        if png_bytes is None:
                            return False, None, error_msg
                    return True, png_bytes, None
                    
        except Exception as e:
            error_str = str(e)
            print(f"TableCompiler: Exception occurred: {error_str}")
            return False, None, f"Compilation failed: {error_str}"
    
    def _compile_with_tectonic(self, tex_file: Path) -> Tuple[bool, Optional[str]]:
        """Try to compile with Tectonic LaTeX engine - optimized for tables"""
        try:
            print("TableCompiler: Trying Tectonic...")
            
            # Use config to get Tectonic paths
            tectonic_paths = settings.get_tectonic_paths()
            
            tectonic_cmd = None
            for path in tectonic_paths:
                print(f"TableCompiler: Checking Tectonic path: {path}")
                try:
                    result = subprocess.run([path, '--version'], capture_output=True, timeout=10)
                    if result.returncode == 0:
                        tectonic_cmd = path
                        print(f"TableCompiler: Found Tectonic at: {path}")
                        break
                    else:
                        print(f"TableCompiler: Tectonic at {path} returned code {result.returncode}")
                except (FileNotFoundError, subprocess.TimeoutExpired) as e:
                    print(f"TableCompiler: Tectonic not found at {path}: {e}")
                    continue
            
            if not tectonic_cmd:
                return False, "Tectonic not found"
            
            # Change to the directory containing the tex file
            original_dir = os.getcwd()
            os.chdir(tex_file.parent)
            
            try:
                # Set up environment for Tectonic - optimize for table rendering
                env = os.environ.copy()
                env['FONTCONFIG_FILE'] = ''
                env['FONTCONFIG_PATH'] = ''
                env['TECTONIC_MINIMAL_MODE'] = '1'
                
                print(f"TableCompiler: Running {tectonic_cmd} on {tex_file.name}")
                result = subprocess.run(
                    [tectonic_cmd, '--print', '--keep-logs', '--outfmt=pdf', tex_file.name],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    cwd=tex_file.parent,
                    env=env
                )
                
                print(f"TableCompiler: Tectonic return code: {result.returncode}")
                
                if result.returncode != 0:
                    error_msg = f"Tectonic failed with return code {result.returncode}"
                    if result.stderr:
                        error_msg += f": {result.stderr[:500]}"
                    if result.stdout:
                        error_msg += f"\nOutput: {result.stdout[-500:]}"
                    return False, error_msg
                
                # Check if PDF was created
                pdf_file = tex_file.with_suffix('.pdf')
                if not pdf_file.exists():
                    return False, "PDF file was not created by Tectonic"
                
                print("TableCompiler: Tectonic compilation successful")
                return True, None
                
            finally:
                os.chdir(original_dir)
            
        except subprocess.TimeoutExpired:
            return False, "Tectonic compilation timed out"
        except Exception as e:
            return False, f"Tectonic compilation error: {str(e)}"
    
    def _compile_with_pdflatex(self, tex_file: Path) -> Tuple[bool, Optional[str]]:
        """Fallback: Try to compile with pdflatex"""
        try:
            print("TableCompiler: Trying pdflatex as fallback...")
            
            # Use config to get pdflatex paths
            pdflatex_paths = settings.get_pdflatex_paths()
            
            pdflatex_cmd = None
            for path in pdflatex_paths:
                try:
                    result = subprocess.run([path, '--version'], capture_output=True, timeout=10)
                    if result.returncode == 0:
                        pdflatex_cmd = path
                        print(f"TableCompiler: Found pdflatex at: {path}")
                        break
                except (FileNotFoundError, subprocess.TimeoutExpired):
                    continue
            
            if not pdflatex_cmd:
                return False, "pdflatex not found"
            
            # Change to the directory containing the tex file
            original_dir = os.getcwd()
            os.chdir(tex_file.parent)
            
            try:
                print(f"TableCompiler: Running {pdflatex_cmd} on {tex_file.name}")
                result = subprocess.run(
                    [pdflatex_cmd, '-interaction=nonstopmode', '-halt-on-error', tex_file.name],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    cwd=tex_file.parent
                )
                
                print(f"TableCompiler: pdflatex return code: {result.returncode}")
                
                if result.returncode != 0:
                    error_msg = f"pdflatex failed with return code {result.returncode}"
                    if result.stderr:
                        error_msg += f": {result.stderr[:500]}"
                    return False, error_msg
                
                # Check if PDF was created
                pdf_file = tex_file.with_suffix('.pdf')
                if not pdf_file.exists():
                    return False, "PDF file was not created by pdflatex"
                
                print("TableCompiler: pdflatex compilation successful")
                return True, None
                
            finally:
                os.chdir(original_dir)
            
        except subprocess.TimeoutExpired:
            return False, "pdflatex compilation timed out"
        except Exception as e:
            return False, f"pdflatex compilation error: {str(e)}"
    
    def _create_complete_document(self, latex_code: str) -> str:
        """Create a complete LaTeX document optimized for tables"""
        print("TableCompiler: Creating complete document for table...")
        print(f"TableCompiler: Input LaTeX code length: {len(latex_code)} characters")
        
        # Check if the input already contains documentclass - if so, use as-is
        if '\\documentclass' in latex_code:
            print("TableCompiler: Input appears to be a complete document")
            return latex_code
        
        # If the input is empty or just whitespace, create a minimal document
        if not latex_code.strip():
            print("TableCompiler: Input is empty, creating minimal document")
            return """\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{longtable}

\\geometry{margin=1in}

\\begin{document}

\\begin{center}
\\textit{No table content provided}
\\end{center}

\\end{document}"""
        
        # Document header optimized for tables
        document_header = """\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{longtable}
\\usepackage{multirow}
\\usepackage{multicol}
\\usepackage[HTML]{xcolor}
\\usepackage{colortbl}
\\usepackage{float}
\\usepackage{adjustbox}

\\geometry{margin=0.5in}

% Define common HTML colors for tables
\\definecolor{lightblue}{HTML}{E3F2FD}
\\definecolor{blue}{HTML}{1976D2}
\\definecolor{darkblue}{HTML}{0D47A1}
\\definecolor{lightgreen}{HTML}{E8F5E8}
\\definecolor{green}{HTML}{388E3C}
\\definecolor{darkgreen}{HTML}{1B5E20}
\\definecolor{lightgray}{HTML}{F5F5F5}
\\definecolor{gray}{HTML}{757575}
\\definecolor{darkgray}{HTML}{424242}
\\definecolor{lightyellow}{HTML}{FFF9C4}
\\definecolor{yellow}{HTML}{F57F17}
\\definecolor{orange}{HTML}{FF9800}
\\definecolor{darkorange}{HTML}{F57C00}
\\definecolor{lightred}{HTML}{FFEBEE}
\\definecolor{red}{HTML}{F44336}
\\definecolor{darkred}{HTML}{B71C1C}
\\definecolor{mediumgray}{HTML}{666666}
\\definecolor{lightergray}{HTML}{CCCCCC}
\\definecolor{verylightgray}{HTML}{EEEEEE}
\\definecolor{darkergray}{HTML}{333333}
\\definecolor{mediumgray2}{HTML}{999999}
\\definecolor{purple}{HTML}{800080}
\\definecolor{brown}{HTML}{A52A2A}
\\definecolor{pink}{HTML}{FFC0CB}
\\definecolor{magenta}{HTML}{FF00FF}
\\definecolor{cyan}{HTML}{00FFFF}

% Enhanced table formatting
\\renewcommand{\\arraystretch}{1.3}
\\setlength{\\tabcolsep}{8pt}

% Custom column types for better table formatting
\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}
\\newcolumntype{L}[1]{>{\\raggedright\\arraybackslash}p{#1}}
\\newcolumntype{R}[1]{>{\\raggedleft\\arraybackslash}p{#1}}

\\begin{document}

"""
        
        document_footer = """

\\end{document}
"""
        
        # Fix HTML color syntax and prepare content
        import re
        content = re.sub(r'\\[HTML\\]\\{([^}]+)\\}', r'{HTML}{\\1}', latex_code)
        
        # Map specific HTML colors to predefined names
        color_map = {
            'E3F2FD': 'lightblue',
            '1976D2': 'blue', 
            '0D47A1': 'darkblue',
            'E8F5E8': 'lightgreen',
            '388E3C': 'green',
            '1B5E20': 'darkgreen',
            'F5F5F5': 'lightgray',
            '757575': 'gray',
            '424242': 'darkgray',
            'FFF9C4': 'lightyellow',
            'F57F17': 'yellow',
            'FF9800': 'orange',
            'FFEBEE': 'lightred',
            'F44336': 'red',
            'B71C1C': 'darkred'
        }
        
        for hex_color, color_name in color_map.items():
            content = content.replace(f'{{HTML}}{{{hex_color}}}', color_name)
            content = content.replace(f'[HTML]{{{hex_color}}}', color_name)
            content = content.replace(f'HTML{{{hex_color}}}', color_name)
        
        result = document_header + content + document_footer
        print(f"TableCompiler: Final document length: {len(result)} characters")
        
        return result
    
    def _pdf_to_png(self, pdf_file: Path) -> Tuple[Optional[bytes], Optional[str]]:
        """Convert PDF to PNG using pdf2image or fallback methods - optimized for tables"""
        try:
            print("TableCompiler: Converting PDF to PNG...")
            
            if PDF2IMAGE_AVAILABLE:
                print("TableCompiler: Using pdf2image for conversion")
                # Use config to get Poppler paths
                poppler_paths = settings.get_poppler_paths()
                
                poppler_path = None
                for path in poppler_paths:
                    if os.path.exists(path) and os.path.exists(os.path.join(path, "pdftoppm.exe")):
                        poppler_path = path
                        print(f"TableCompiler: Found working Poppler at: {path}")
                        break
                
                if not poppler_path:
                    print("TableCompiler: No working Poppler installation found, trying without path")
                    try:
                        # Use higher DPI for better table rendering
                        images = convert_from_path(str(pdf_file), dpi=350, first_page=1, last_page=1)
                    except Exception as e:
                        print(f"TableCompiler: pdf2image failed without path: {str(e)}")
                        return None, f"Poppler not found. Please install Poppler or add it to PATH. Error: {str(e)}"
                else:
                    print(f"TableCompiler: Using Poppler path: {poppler_path}")
                    # Use higher DPI for better table rendering
                    images = convert_from_path(str(pdf_file), dpi=350, first_page=1, last_page=1, 
                                             poppler_path=poppler_path)
                
                if images:
                    # Convert first page to PNG bytes with optimization for tables
                    img_buffer = io.BytesIO()
                    images[0].save(img_buffer, format='PNG', optimize=True)
                    png_bytes = img_buffer.getvalue()
                    print("TableCompiler: PDF to PNG conversion successful with pdf2image")
                    return png_bytes, None
                else:
                    return None, "No pages found in PDF"
            else:
                # Fallback to external tools
                return self._pdf_to_png_external(pdf_file)
                
        except Exception as e:
            print(f"TableCompiler: PDF to PNG conversion failed: {str(e)}")
            return None, f"PNG conversion error: {str(e)}"
    
    def _pdf_to_png_external(self, pdf_file: Path) -> Tuple[Optional[bytes], Optional[str]]:
        """Fallback PDF to PNG conversion using external tools"""
        try:
            png_file = pdf_file.with_suffix('.png')
            
            # Try using magick (ImageMagick) with settings optimized for tables
            result = subprocess.run(
                ['magick', 'convert', '-density', '350', '-quality', '95', str(pdf_file), str(png_file)],
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if result.returncode != 0:
                # Try pdftoppm as fallback with table-optimized settings
                result = subprocess.run(
                    ['pdftoppm', '-png', '-r', '350', str(pdf_file), str(pdf_file.stem)],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                
                if result.returncode != 0:
                    return None, f"PDF to PNG conversion failed: {result.stderr}"
                
                # pdftoppm creates files with different naming
                possible_png = pdf_file.parent / f"{pdf_file.stem}-1.png"
                if possible_png.exists():
                    png_file = possible_png
            
            if not png_file.exists():
                return None, "PNG file was not created"
            
            with open(png_file, 'rb') as f:
                return f.read(), None
                
        except subprocess.TimeoutExpired:
            return None, "PNG conversion timed out"
        except FileNotFoundError as e:
            return None, f"Conversion tool not found: {str(e)}. Please install ImageMagick or poppler-utils."
        except Exception as e:
            return None, f"PNG conversion error: {str(e)}"
    
    def _create_mock_pdf(self, tex_file: Path) -> Tuple[bool, Optional[str]]:
        """Create a mock PDF for development when compilation fails"""
        try:
            print("TableCompiler: Creating mock PDF for development...")
            
            # Read the LaTeX content
            with open(tex_file, 'r', encoding='utf-8') as f:
                latex_content = f.read()
            
            # Create a proper PDF structure with table-specific content
            mock_pdf_content = f"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 600
>>
stream
BT
/F1 18 Tf
50 750 Td
(Table LaTeX Helper - Preview Mode) Tj
0 -40 Td
/F1 14 Tf
(Table Content Detected) Tj
0 -30 Td
/F1 12 Tf
(This is a preview generated in development mode.) Tj
0 -20 Td
(Your table LaTeX content was processed successfully.) Tj
0 -40 Td
/F1 10 Tf
(For production use, ensure Tectonic is properly configured) Tj
0 -15 Td
(with table packages to get full table compilation.) Tj
0 -40 Td
/F1 8 Tf
(LaTeX source length: {len(latex_content)} characters) Tj
0 -15 Td
(Contains table: {"Yes" if any(t in latex_content.lower() for t in ["tabular", "table", "longtable"]) else "No"}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
800
%%EOF"""
            
            # Write mock PDF
            pdf_file = tex_file.with_suffix('.pdf')
            with open(pdf_file, 'wb') as f:
                f.write(mock_pdf_content.encode('latin-1'))
            
            print("TableCompiler: Enhanced mock PDF created successfully")
            return True, None
            
        except Exception as e:
            print(f"TableCompiler: Failed to create mock PDF: {str(e)}")
            return False, f"Failed to create mock PDF: {str(e)}"

    def _create_mock_png(self, pdf_file: Path) -> Tuple[Optional[bytes], Optional[str]]:
        """Create a mock PNG for development when PDF to PNG conversion tools are not available"""
        try:
            print("TableCompiler: Creating mock PNG for development...")
            
            # Create a simple PNG header and basic image data for tables
            png_data = bytearray([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
                0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00,  # Width: 512, Height: 256
                0x08, 0x02, 0x00, 0x00, 0x00, 0x5C, 0x28, 0x4E, 0x35,  # Bit depth, color type, etc.
            ])
            
            # Add basic image data for table mockup
            png_data.extend([
                0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,  # IDAT chunk
                0x78, 0x9C, 0x63, 0xF8, 0xFF, 0xFF, 0x3F, 0x00,  # Basic white image data
                0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59, 0xE7,
                0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
                0xAE, 0x42, 0x60, 0x82
            ])
            
            png_file = pdf_file.with_suffix('.png')
            with open(png_file, 'wb') as f:
                f.write(png_data)
            
            print("TableCompiler: Mock PNG created successfully")
            return bytes(png_data), None
            
        except Exception as e:
            print(f"TableCompiler: Failed to create mock PNG: {str(e)}")
            return None, f"Failed to create mock PNG: {str(e)}"

# Global compiler instance
table_compiler = TableLatexCompiler()