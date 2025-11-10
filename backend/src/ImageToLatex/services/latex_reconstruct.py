import re


def is_code_like(content):
    if not content or not content.strip():
        return False
    code_indicators = [
        r'^\s*[\{\[]',
        r'def\s+\w+\s*\(',
        r'class\s+\w+',
        r'import\s+\w+',
        r'function\s+\w+',
        r'void\s+\w+\s*\(',
        r'public\s+(?:class|void|static)',
        r'#include\s*<',
        r'(?:const|let|var)\s+\w+\s*=',
        r'\w+\s*:\s*[\"\'\d\{]',
    ]
    lines = content.split('\n')
    code_line_count = 0
    for line in lines:
        if not line.strip():
            continue
        for pattern in code_indicators:
            if re.search(pattern, line):
                code_line_count += 1
                break
    non_empty_lines = len([l for l in lines if l.strip()])
    if non_empty_lines > 0 and (code_line_count / non_empty_lines) > 0.3:
        return True
    special_char_count = sum(1 for c in content if c in '{}[]();=<>')
    if len(content) > 0 and (special_char_count / len(content)) > 0.05:
        return True
    return False


def escape_latex(s):
    replacements = [
        ("\\", r"\textbackslash{}"),
        ("_", r"\_"),
        ("^", r"\^{}"),
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("~", r"\textasciitilde{}"),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    return s


def wrap_latex(text):
    if is_code_like(text):
        # Use verbatim instead of listings for better compatibility
        return f'''\\documentclass[12pt]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{fancyvrb}}
\\usepackage{{xcolor}}

\\begin{{document}}

\\section*{{Code/Data}}

\\begin{{Verbatim}}[frame=single,numbers=left,numbersep=5pt,fontsize=\\small]
{text}
\\end{{Verbatim}}

\\end{{document}}'''
    else:
        safe_text = escape_latex(text)
        return f'''\\documentclass[12pt]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{amsmath}}
\\usepackage{{graphicx}}

\\begin{{document}}

{safe_text}

\\end{{document}}'''
