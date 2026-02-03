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

class ImageToLatexCompiler:
	def __init__(self, temp_dir: Optional[str] = None, timeout: Optional[int] = None):
		self.temp_dir = temp_dir or tempfile.gettempdir()
		self.timeout = timeout or settings.LATEX_TIMEOUT

	def _create_complete_document(self, latex_code: str) -> str:
		# Optionally wrap code in a minimal LaTeX document
		return latex_code

	def compile_latex(self, latex_code: str, output_format: str = "pdf", assets: Optional[list] = None) -> Tuple[bool, Optional[bytes], Optional[str]]:
		"""
		Compile LaTeX code to PDF or PNG using Tectonic (preferred) or fallback methods
		Optimized for mathematical formulas and OCR-generated LaTeX
		
		Args:
			latex_code: The LaTeX source code
			output_format: Either "pdf" or "png"
			assets: Optional list of {"filename": str, "content": bytes} dicts for linked files
		"""
		try:
			print(f"ImageToLatexCompiler: Starting compilation to {output_format}")
			print(f"ImageToLatexCompiler: Temp dir: {self.temp_dir}")
			print(f"ImageToLatexCompiler: Timeout: {self.timeout}")
			print(f"ImageToLatexCompiler: Input LaTeX length: {len(latex_code)}")
			print(f"ImageToLatexCompiler: Assets count: {len(assets) if assets else 0}")
			if output_format not in ["pdf", "png"]:
				print("ImageToLatexCompiler: Invalid output format requested.")
				return False, None, "Invalid output format. Must be 'pdf' or 'png'"
			with tempfile.TemporaryDirectory(dir=self.temp_dir) as temp_dir:
				print(f"ImageToLatexCompiler: Using temp_dir: {temp_dir}")
				
				# Write asset files (linked images) to temp directory
				if assets:
					for asset in assets:
						asset_path = Path(temp_dir) / asset["filename"]
						with open(asset_path, 'wb') as f:
							f.write(asset["content"])
						print(f"ImageToLatexCompiler: Written asset file: {asset['filename']}")
				
				complete_latex = self._create_complete_document(latex_code)
				tex_file = Path(temp_dir) / "imagetolatex.tex"
				with open(tex_file, 'w', encoding='utf-8') as f:
					f.write(complete_latex)
				print(f"ImageToLatexCompiler: Written LaTeX to {tex_file}")
				print("ImageToLatexCompiler: Document written, compiling to PDF...")
				success, tectonic_error = self._compile_with_tectonic(tex_file)
				print(f"ImageToLatexCompiler: Tectonic compile result: success={success}")
				if tectonic_error:
					print(f"ImageToLatexCompiler: Tectonic error message (first 500 chars): {tectonic_error[:500]}")
				
				if not success:
					print(f"ImageToLatexCompiler: Tectonic compilation failed")
					return False, None, self._format_compilation_error(tectonic_error)
				
				pdf_file = tex_file.with_suffix('.pdf')
				print(f"ImageToLatexCompiler: PDF file path: {pdf_file}")
				# DEBUG: Copy PDF to persistent debug directory for inspection
				try:
					debug_dir = Path(settings.__dict__.get('DEBUG_PDF_DIR', 'd:/Software Projects Backup/Tizkit/backend/debug_pdfs'))
					debug_dir.mkdir(parents=True, exist_ok=True)
					debug_pdf_path = debug_dir / pdf_file.name
					shutil.copy2(pdf_file, debug_pdf_path)
					print(f"ImageToLatexCompiler: Copied PDF to {debug_pdf_path}")
				except Exception as e:
					print(f"ImageToLatexCompiler: Failed to copy PDF for debug: {str(e)}")

				if output_format == "pdf":
					print("ImageToLatexCompiler: Returning PDF content")
					try:
						with open(pdf_file, 'rb') as f:
							pdf_bytes = f.read()
						print(f"ImageToLatexCompiler: PDF read success, size={len(pdf_bytes)} bytes")
						return True, pdf_bytes, None
					except Exception as e:
						print(f"ImageToLatexCompiler: Failed to read PDF: {str(e)}")
						return False, None, f"Failed to read PDF: {str(e)}"
				else:
					print("ImageToLatexCompiler: Converting to PNG...")
					png_bytes, error_msg = self._pdf_to_png(pdf_file)
					print(f"ImageToLatexCompiler: PNG conversion result: bytes={len(png_bytes) if png_bytes else 'None'}, error_msg={error_msg}")
					if png_bytes is None:
						print("ImageToLatexCompiler: PNG conversion failed, creating mock PNG")
						png_bytes, error_msg = self._create_mock_png(pdf_file)
						print(f"ImageToLatexCompiler: Mock PNG result: bytes={len(png_bytes) if png_bytes else 'None'}, error_msg={error_msg}")
						if png_bytes is None:
							print(f"ImageToLatexCompiler: Failed to create mock PNG: {error_msg}")
							return False, None, error_msg
					return True, png_bytes, None
		except Exception as e:
			print(f"ImageToLatexCompiler: Exception occurred: {str(e)}")
			return False, None, f"Compilation failed: {str(e)}"

	def _compile_with_tectonic(self, tex_file: Path) -> Tuple[bool, Optional[str]]:
		try:
			tectonic_paths = settings.get_tectonic_paths()
			print(f"ImageToLatexCompiler: Searching for Tectonic in {len(tectonic_paths)} paths...")
			tectonic_cmd = None
			for path in tectonic_paths:
				print(f"ImageToLatexCompiler: Trying Tectonic path: {path}")
				try:
					result = subprocess.run([path, '--version'], capture_output=True, timeout=10)
					if result.returncode == 0:
						tectonic_cmd = str(Path(path).expanduser().resolve())
						print(f"ImageToLatexCompiler: Found working Tectonic at: {tectonic_cmd}")
						break
					else:
						print(f"ImageToLatexCompiler: Path {path} returned non-zero exit code")
				except FileNotFoundError:
					print(f"ImageToLatexCompiler: Path {path} not found")
				except subprocess.TimeoutExpired:
					print(f"ImageToLatexCompiler: Path {path} timed out")
				except Exception as e:
					print(f"ImageToLatexCompiler: Path {path} error: {str(e)}")
			
			if not tectonic_cmd:
				print("ImageToLatexCompiler: No working Tectonic found")
				return False, "Tectonic not found"
			
			print(f"ImageToLatexCompiler: Using Tectonic: {tectonic_cmd}")
			print(f"ImageToLatexCompiler: Compiling file: {tex_file}")
			original_dir = os.getcwd()
			os.chdir(tex_file.parent)
			print(f"ImageToLatexCompiler: Changed to directory: {tex_file.parent}")
			try:
				env = os.environ.copy()
				env['FONTCONFIG_FILE'] = ''
				env['FONTCONFIG_PATH'] = ''
				env['TECTONIC_MINIMAL_MODE'] = '1'
				print(f"ImageToLatexCompiler: Running Tectonic with minimal mode...")
				result = subprocess.run([tectonic_cmd, str(tex_file)], capture_output=True, env=env, timeout=self.timeout)
				os.chdir(original_dir)
				
				print(f"ImageToLatexCompiler: Tectonic exit code: {result.returncode}")
				if result.stdout:
					print(f"ImageToLatexCompiler: Tectonic stdout (first 300 chars): {result.stdout.decode('utf-8', errors='ignore')[:300]}")
				if result.stderr:
					print(f"ImageToLatexCompiler: Tectonic stderr (first 300 chars): {result.stderr.decode('utf-8', errors='ignore')[:300]}")
				
				if result.returncode == 0:
					print("ImageToLatexCompiler: Tectonic compilation successful!")
					return True, None
				else:
					error_msg = result.stderr.decode('utf-8')
					print(f"ImageToLatexCompiler: Tectonic compilation failed with error")
					return False, error_msg
			except Exception as e:
				os.chdir(original_dir)
				print(f"ImageToLatexCompiler: Exception during Tectonic compilation: {str(e)}")
				return False, str(e)
		except Exception as e:
			print(f"ImageToLatexCompiler: Exception in _compile_with_tectonic: {str(e)}")
			return False, str(e)

	def _format_compilation_error(self, error_msg: str) -> str:
		"""
		Format LaTeX compilation error for better readability
		Extract key information from Tectonic error messages
		"""
		if not error_msg:
			return "LaTeX compilation failed with unknown error"
		
		# Remove Fontconfig warnings (not actual errors)
		lines = error_msg.split('\n')
		filtered_lines = [
			line for line in lines 
			if not line.strip().startswith('Fontconfig warning:')
		]
		
		important_lines = []
		error_found = False
		
		for i, line in enumerate(filtered_lines):
			line_lower = line.lower()
			# Look for key error indicators
			if any(keyword in line_lower for keyword in ['error:', 'undefined', 'missing', 'emergency stop', 'halted']):
				error_found = True
				# Include context (previous line if it has useful info)
				if i > 0 and filtered_lines[i-1].strip() and not filtered_lines[i-1].strip().startswith('Fontconfig'):
					prev_line = filtered_lines[i-1].strip()
					if prev_line not in important_lines:
						important_lines.append(prev_line)
				
				important_lines.append(line.strip())
				
				# Include next line if it provides context (like "See the LaTeX manual...")
				if i < len(filtered_lines) - 1:
					next_line = filtered_lines[i+1].strip()
					if next_line and not next_line.startswith('Fontconfig') and 'See the LaTeX' not in next_line:
						important_lines.append(next_line)
		
		# If we found specific errors, format them nicely
		if important_lines:
			formatted = "LaTeX Compilation Error:\n\n" + "\n".join(important_lines[:10])  # Limit to first 10 relevant lines
			return formatted
		
		# If no specific errors found but we have filtered content
		if filtered_lines:
			relevant_content = '\n'.join(filtered_lines[:20])
			return f"LaTeX Compilation Error:\n\n{relevant_content}"
		
		# Otherwise return first 1000 chars of original error message
		return f"LaTeX Compilation Error:\n\n{error_msg[:1000]}"

	def _create_mock_pdf(self, tex_file: Path) -> Tuple[bool, Optional[str]]:
		"""Create a mock PDF for development when compilation fails"""
		try:
			# Read the LaTeX content
			with open(tex_file, 'r', encoding='utf-8') as f:
				latex_content = f.read()

			# Create a simple PDF with error message and LaTeX source info
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
(ImageToLatex - Compilation Error) Tj
0 -40 Td
/F1 14 Tf
(Your LaTeX code could not be compiled.) Tj
0 -30 Td
/F1 12 Tf
(This is a mock PDF generated for error handling.) Tj
0 -20 Td
(LaTeX source length: {len(latex_content)} characters) Tj
0 -15 Td
(Contains math: {'Yes' if any(t in latex_content.lower() for t in ['math', 'equation', 'align', 'frac', 'sum', 'int']) else 'No'}) Tj
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

			return True, None
		except Exception as e:
			return False, f"Failed to create mock PDF: {str(e)}"

	def _pdf_to_png(self, pdf_file: Path) -> Tuple[Optional[bytes], Optional[str]]:
		if not PDF2IMAGE_AVAILABLE:
			return None, "pdf2image not available"
		try:
			# Get Poppler paths from settings
			poppler_paths = settings.get_poppler_paths()
			poppler_path = None
			for path in poppler_paths:
				if os.path.exists(path) and os.path.exists(os.path.join(path, "pdftoppm.exe")):
					poppler_path = path
					break
			print(f"ImageToLatexCompiler: Using poppler_path for pdf2image: {poppler_path}")
			# Pass poppler_path if found
			kwargs = {"dpi": 200, "fmt": "png"}
			if poppler_path:
				kwargs["poppler_path"] = poppler_path
			images = convert_from_path(str(pdf_file), **kwargs)
			if not images:
				return None, "PDF to PNG conversion failed"
			img = images[0]
			with io.BytesIO() as output:
				img.save(output, format="PNG")
				return output.getvalue(), None
		except Exception as e:
			print(f"ImageToLatexCompiler: pdf2image conversion error: {str(e)}")
			return None, str(e)

	def _create_mock_png(self, pdf_file: Path) -> Tuple[Optional[bytes], Optional[str]]:
		"""Create a mock PNG for development when PDF to PNG conversion tools are not available"""
		try:
			# Create a simple PNG header and basic image data
			png_data = bytearray([
				0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
				0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
				0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,  # Width: 256, Height: 256
				0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,  # Bit depth, color type, etc.
			])

			# Add basic image data for mockup (white image)
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

			return bytes(png_data), None
		except Exception as e:
			return None, f"Failed to create mock PNG: {str(e)}"
