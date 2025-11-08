def wrap_latex(text: str) -> str:
    """
    Wrap plain text in a LaTeX document structure.
    """
    return f"""\\documentclass[12pt]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}
\\usepackage{{amssymb}}
\\usepackage{{graphicx}}

\\begin{{document}}

{text}

\\end{{document}}"""
