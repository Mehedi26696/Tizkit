import json
from typing import Dict, Any

class TableLatexGenerator:
    """Service for generating LaTeX code specifically for tables"""
    
    def _create_complete_document(self, content: str, title: str = "Generated Table") -> str:
        """Create a complete LaTeX document optimized for tables"""
        return f"""\\documentclass[12pt]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{geometry}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}
\\usepackage{{amssymb}}
\\usepackage{{graphicx}}
\\usepackage{{booktabs}}
\\usepackage{{array}}
\\usepackage{{longtable}}
\\usepackage{{multirow}}
\\usepackage{{multicol}}
\\usepackage[HTML]{{xcolor}}
\\usepackage{{colortbl}}
\\usepackage{{float}}
\\usepackage{{adjustbox}}
\\usepackage{{tabularx}}
\\usepackage{{ltxtable}}

\\geometry{{margin=0.5in}}

% Define common HTML colors for tables
\\definecolor{{lightblue}}{{HTML}}{{E3F2FD}}
\\definecolor{{blue}}{{HTML}}{{1976D2}}
\\definecolor{{darkblue}}{{HTML}}{{0D47A1}}
\\definecolor{{lightgreen}}{{HTML}}{{E8F5E8}}
\\definecolor{{green}}{{HTML}}{{388E3C}}
\\definecolor{{darkgreen}}{{HTML}}{{1B5E20}}
\\definecolor{{lightgray}}{{HTML}}{{F5F5F5}}
\\definecolor{{gray}}{{HTML}}{{757575}}
\\definecolor{{darkgray}}{{HTML}}{{424242}}
\\definecolor{{lightyellow}}{{HTML}}{{FFF9C4}}
\\definecolor{{yellow}}{{HTML}}{{F57F17}}
\\definecolor{{orange}}{{HTML}}{{FF9800}}
\\definecolor{{darkorange}}{{HTML}}{{F57C00}}
\\definecolor{{lightred}}{{HTML}}{{FFEBEE}}
\\definecolor{{red}}{{HTML}}{{F44336}}
\\definecolor{{darkred}}{{HTML}}{{B71C1C}}
\\definecolor{{mediumgray}}{{HTML}}{{666666}}
\\definecolor{{lightergray}}{{HTML}}{{CCCCCC}}
\\definecolor{{verylightgray}}{{HTML}}{{EEEEEE}}
\\definecolor{{darkergray}}{{HTML}}{{333333}}
\\definecolor{{mediumgray2}}{{HTML}}{{999999}}
\\definecolor{{purple}}{{HTML}}{{800080}}
\\definecolor{{brown}}{{HTML}}{{A52A2A}}
\\definecolor{{pink}}{{HTML}}{{FFC0CB}}
\\definecolor{{magenta}}{{HTML}}{{FF00FF}}
\\definecolor{{cyan}}{{HTML}}{{00FFFF}}

% Enhanced table formatting
\\renewcommand{{\\arraystretch}}{{1.3}}
\\setlength{{\\tabcolsep}}{{8pt}}

% Custom column types for better table formatting
\\newcolumntype{{C}}[1]{{>{{\\centering\\arraybackslash}}p{{#1}}}}
\\newcolumntype{{L}}[1]{{>{{\\raggedright\\arraybackslash}}p{{#1}}}}
\\newcolumntype{{R}}[1]{{>{{\\raggedleft\\arraybackslash}}p{{#1}}}}

\\title{{{title}}}
\\author{{LaTeX Helper - Table}}
\\date{{\\today}}

\\begin{{document}}

\\maketitle

\\section{{Generated Table}}

{content}

\\end{{document}}"""

    def _create_empty_document(self, message: str) -> str:
        """Create a basic document when no table data is provided"""
        return self._create_complete_document(
            f"\\begin{{center}}\\textit{{{message}}}\\end{{center}}", 
            "Empty Table"
        )
    
    def generate_table_latex(self, table_data: Dict[str, Any]) -> str:
        """Generate complete LaTeX document for a table that can be compiled in Overleaf"""
        if not table_data or 'cells' not in table_data:
            return self._create_empty_document("No table data provided")
        
        cells = table_data['cells']
        if not cells or not cells[0]:
            return self._create_empty_document("Empty table")
        
        num_cols = len(cells[0])
        table_style = table_data.get('style', 'standard')
        
        # Generate table content based on style
        if table_style == 'booktabs':
            table_content = self._generate_booktabs_table(cells, table_data)
        elif table_style == 'longtable':
            table_content = self._generate_longtable(cells, table_data)
        elif table_style == 'tabularx':
            table_content = self._generate_tabularx_table(cells, table_data)
        else:
            table_content = self._generate_standard_table(cells, table_data)
        
        # Create complete document
        return self._create_complete_document(table_content, "Table Document")
    
    def _generate_standard_table(self, cells: list, table_data: Dict[str, Any]) -> str:
        """Generate a standard tabular table"""
        num_cols = len(cells[0])
        
        # Create column specification with proper alignment and spacing
        col_spec = self._build_column_specification(cells, table_data)
        
        # Build table content with enhanced formatting
        table_content = [
            "\\begin{table}[H]",
            "\\centering",
            "\\renewcommand{\\arraystretch}{1.2}",
            f"\\begin{{tabular}}{{{col_spec}}}",
            "\\hline"
        ]
        
        # Process rows
        for row_index, row in enumerate(cells):
            row_content = self._process_table_row(row, row_index == 0)
            table_content.append(row_content + ' \\\\')
            
            # Add horizontal lines
            if row_index == 0:
                table_content.append("\\hline\\hline")  # Double line after header
            else:
                table_content.append("\\hline")
        
        table_content.extend([
            "\\end{tabular}",
            "\\caption{Generated Table}",
            "\\label{tab:generated}",
            "\\end{table}"
        ])
        
        return '\n'.join(table_content)
    
    def _generate_booktabs_table(self, cells: list, table_data: Dict[str, Any]) -> str:
        """Generate a professional-looking table using booktabs package"""
        num_cols = len(cells[0])
        
        # Create column specification
        col_spec = self._build_column_specification(cells, table_data, style='booktabs')
        
        # Build table content
        table_content = [
            "\\begin{table}[H]",
            "\\centering",
            "\\renewcommand{\\arraystretch}{1.2}",
            f"\\begin{{tabular}}{{{col_spec}}}",
            "\\toprule"
        ]
        
        # Process rows with booktabs styling
        for row_index, row in enumerate(cells):
            row_content = self._process_table_row(row, row_index == 0)
            table_content.append(row_content + ' \\\\')
            
            if row_index == 0:
                table_content.append("\\midrule")  # Professional middle rule after header
        
        table_content.extend([
            "\\bottomrule",
            "\\end{tabular}",
            "\\caption{Generated Table}",
            "\\label{tab:generated}",
            "\\end{table}"
        ])
        
        return '\n'.join(table_content)
    
    def _generate_longtable(self, cells: list, table_data: Dict[str, Any]) -> str:
        """Generate a table that can span multiple pages using longtable"""
        num_cols = len(cells[0])
        
        # Create column specification
        col_spec = self._build_column_specification(cells, table_data)
        
        # Build longtable content
        table_content = [
            f"\\begin{{longtable}}{{{col_spec}}}",
            "\\caption{Generated Long Table} \\label{tab:generated} \\\\",
            "\\hline"
        ]
        
        # Add header
        if cells:
            header_row = self._process_table_row(cells[0], True)
            table_content.extend([
                header_row + ' \\\\',
                "\\hline",
                "\\endfirsthead",
                "",
                "\\multicolumn{" + str(num_cols) + "}{c}%",
                "{\\bfseries \\tablename\\ \\thetable{} -- continued from previous page} \\\\",
                "\\hline",
                header_row + ' \\\\',
                "\\hline",
                "\\endhead",
                "",
                "\\hline \\multicolumn{" + str(num_cols) + "}{|r|}{{Continued on next page}} \\\\ \\hline",
                "\\endfoot",
                "",
                "\\hline",
                "\\endlastfoot",
                ""
            ])
            
            # Add data rows
            for row in cells[1:]:
                row_content = self._process_table_row(row, False)
                table_content.append(row_content + ' \\\\')
                table_content.append("\\hline")
        
        table_content.append("\\end{longtable}")
        
        return '\n'.join(table_content)
    
    def _generate_tabularx_table(self, cells: list, table_data: Dict[str, Any]) -> str:
        """Generate a table with automatic column width adjustment using tabularx"""
        num_cols = len(cells[0])
        
        # Create column specification for tabularx
        col_spec = '|' + 'X|' * num_cols  # X columns auto-adjust width
        
        # Build table content
        table_content = [
            "\\begin{table}[H]",
            "\\centering",
            "\\renewcommand{\\arraystretch}{1.2}",
            f"\\begin{{tabularx}}{{\\textwidth}}{{{col_spec}}}",
            "\\hline"
        ]
        
        # Process rows
        for row_index, row in enumerate(cells):
            row_content = self._process_table_row(row, row_index == 0)
            table_content.append(row_content + ' \\\\')
            
            if row_index == 0:
                table_content.append("\\hline\\hline")
            else:
                table_content.append("\\hline")
        
        table_content.extend([
            "\\end{tabularx}",
            "\\caption{Generated Table}",
            "\\label{tab:generated}",
            "\\end{table}"
        ])
        
        return '\n'.join(table_content)
    
    def _build_column_specification(self, cells: list, table_data: Dict[str, Any], style: str = 'standard') -> str:
        """Build column specification based on table data and style"""
        num_cols = len(cells[0])
        
        # Check if specific column alignments are provided
        column_alignments = table_data.get('columnAlignments', ['c'] * num_cols)
        
        if style == 'booktabs':
            # Booktabs style doesn't use vertical lines
            return ''.join(column_alignments)
        else:
            # Standard style with vertical lines
            col_spec = '|'.join(column_alignments)
            return f"|{col_spec}|"
    
    def _process_table_row(self, row: list, is_header: bool = False) -> str:
        """Process a table row with proper formatting"""
        row_content = []
        
        for cell in row:
            content = cell.get('content', '').strip()
            
            # Handle empty cells
            if not content:
                content = "\\phantom{.}"  # Invisible placeholder for empty cells
            
            # Apply background color
            if cell.get('backgroundColor') and cell['backgroundColor'] != '#ffffff':
                hex_color = cell['backgroundColor'].lstrip('#').upper()
                color_name = self._get_color_name(hex_color)
                if color_name.startswith('['):
                    content = f"\\cellcolor{color_name}{content}"
                else:
                    content = f"\\cellcolor{{{color_name}}}{content}"
            
            # Apply text color
            if cell.get('textColor') and cell['textColor'] != '#000000':
                hex_color = cell['textColor'].lstrip('#').upper()
                color_name = self._get_color_name(hex_color)
                if color_name.startswith('['):
                    content = f"\\textcolor{color_name}{{{content}}}"
                else:
                    content = f"\\textcolor{{{color_name}}}{{{content}}}"
            
            # Apply formatting
            if cell.get('bold') or is_header:
                content = f"\\textbf{{{content}}}"
            
            if cell.get('italic'):
                content = f"\\textit{{{content}}}"
            
            if cell.get('underline'):
                content = f"\\underline{{{content}}}"
            
            row_content.append(content)
        
        return ' & '.join(row_content)
    
    def _get_color_name(self, hex_color: str) -> str:
        """Map hex color to predefined color name or return HTML format"""
        color_map = {
            'E3F2FD': 'lightblue', '1976D2': 'blue', '0D47A1': 'darkblue',
            'E8F5E8': 'lightgreen', '388E3C': 'green', '1B5E20': 'darkgreen',
            'F5F5F5': 'lightgray', '757575': 'gray', '424242': 'darkgray',
            'FFF9C4': 'lightyellow', 'F57F17': 'yellow', 'FF9800': 'orange',
            'FFEBEE': 'lightred', 'F44336': 'red', 'B71C1C': 'darkred',
            'FFFFFF': 'white', '000000': 'black'
        }
        
        return color_map.get(hex_color, f"[HTML]{{{hex_color}}}")
    
    def generate_csv_table_latex(self, csv_data: str, table_options: Dict[str, Any] = None) -> str:
        """Generate LaTeX table from CSV data"""
        if not csv_data or not csv_data.strip():
            return self._create_empty_document("No CSV data provided")
        
        # Parse CSV data
        import csv
        import io
        
        try:
            csv_reader = csv.reader(io.StringIO(csv_data))
            rows = list(csv_reader)
            
            if not rows:
                return self._create_empty_document("Empty CSV data")
            
            # Convert CSV rows to table cell format
            cells = []
            for row in rows:
                cell_row = []
                for cell_content in row:
                    cell_row.append({
                        'content': cell_content.strip(),
                        'backgroundColor': '#ffffff',
                        'textColor': '#000000',
                        'bold': False,
                        'italic': False
                    })
                cells.append(cell_row)
            
            # Create table data structure
            table_data = {
                'cells': cells,
                'style': table_options.get('style', 'standard') if table_options else 'standard'
            }
            
            return self.generate_table_latex(table_data)
            
        except Exception as e:
            return self._create_empty_document(f"Error parsing CSV data: {str(e)}")
    
    def generate_comparison_table_latex(self, comparison_data: Dict[str, Any]) -> str:
        """Generate a comparison table with enhanced styling"""
        if not comparison_data or 'items' not in comparison_data:
            return self._create_empty_document("No comparison data provided")
        
        items = comparison_data['items']
        criteria = comparison_data.get('criteria', [])
        
        if not items or not criteria:
            return self._create_empty_document("Insufficient comparison data")
        
        # Build comparison table
        cells = []
        
        # Header row
        header_row = [{'content': 'Item', 'bold': True, 'backgroundColor': '#E3F2FD'}]
        for criterion in criteria:
            header_row.append({
                'content': criterion, 
                'bold': True, 
                'backgroundColor': '#E3F2FD'
            })
        cells.append(header_row)
        
        # Data rows
        for item in items:
            row = [{'content': item.get('name', ''), 'bold': True}]
            for criterion in criteria:
                value = item.get(criterion, '')
                row.append({'content': str(value)})
            cells.append(row)
        
        # Create table data
        table_data = {
            'cells': cells,
            'style': 'booktabs'
        }
        
        return self.generate_table_latex(table_data)
    
    def generate_latex(self, project_type: str, data: Dict[str, Any]) -> str:
        """Generate LaTeX code based on project type and data"""
        if project_type == 'table':
            return self.generate_table_latex(data)
        elif project_type == 'csv':
            csv_data = data.get('csv_data', '')
            options = data.get('options', {})
            return self.generate_csv_table_latex(csv_data, options)
        elif project_type == 'comparison':
            return self.generate_comparison_table_latex(data)
        else:
            return self.generate_table_latex(data)

# Global generator instance
table_latex_generator = TableLatexGenerator()

# Backward compatibility functions
def generate_table_latex(table_data: Dict[str, Any]) -> str:
    return table_latex_generator.generate_table_latex(table_data)