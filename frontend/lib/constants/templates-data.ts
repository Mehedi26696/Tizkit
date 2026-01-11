// System-provided LaTeX templates (static data)
export const systemTemplates = [
  {
    id: "apa-paper",
    name: "APA Research Paper",
    description: "Standard APA 7th edition format for academic papers.",
    category: "Academic",
    preamble: `\\documentclass[12pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{times}
\\usepackage{setspace}
\\usepackage{apacite}
\\doublespacing

\\title{Your Title Here}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Your abstract goes here...
\\end{abstract}

\\section{Introduction}
Your content...

\\bibliographystyle{apacite}
\\bibliography{references}
\\end{document}`,
  },
  {
    id: "ieee-conference",
    name: "IEEE Conference Paper",
    description: "Two-column format for IEEE conference submissions.",
    category: "Academic",
    preamble: `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{cite}

\\begin{document}
\\title{Conference Paper Title}
\\author{\\IEEEauthorblockN{First Author}
\\IEEEauthorblockA{Affiliation\\\\
Email: first@example.com}}

\\maketitle
\\begin{abstract}
Abstract text...
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2
\\end{IEEEkeywords}

\\section{Introduction}
Content...

\\bibliographystyle{IEEEtran}
\\bibliography{references}
\\end{document}`,
  },
  {
    id: "beamer-presentation",
    name: "Beamer Presentation",
    description: "Professional slide deck template using Beamer.",
    category: "Presentation",
    preamble: `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{default}
\\usepackage{graphicx}

\\title{Presentation Title}
\\author{Your Name}
\\institute{Your Institution}
\\date{\\today}

\\begin{document}
\\frame{\\titlepage}

\\begin{frame}{Outline}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}{Introduction}
\\begin{itemize}
  \\item First point
  \\item Second point
\\end{itemize}
\\end{frame}

\\end{document}`,
  },
  {
    id: "tikz-flowchart",
    name: "TikZ Flowchart Starter",
    description: "A ready-to-use template for creating flowcharts with TikZ.",
    category: "Diagrams",
    preamble: `\\documentclass[tikz,border=10pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{shapes.geometric, arrows, positioning}

\\tikzstyle{startstop} = [rectangle, rounded corners, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=red!30]
\\tikzstyle{process} = [rectangle, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=orange!30]
\\tikzstyle{decision} = [diamond, minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=green!30]
\\tikzstyle{arrow} = [thick,->,>=stealth]

\\begin{document}
\\begin{tikzpicture}[node distance=2cm]
  \\node (start) [startstop] {Start};
  \\node (proc1) [process, below of=start] {Process 1};
  \\node (dec1) [decision, below of=proc1, yshift=-0.5cm] {Decision?};
  \\node (stop) [startstop, below of=dec1, yshift=-0.5cm] {Stop};

  \\draw [arrow] (start) -- (proc1);
  \\draw [arrow] (proc1) -- (dec1);
  \\draw [arrow] (dec1) -- node[anchor=east] {yes} (stop);
\\end{tikzpicture}
\\end{document}`,
  },
  {
    id: "math-homework",
    name: "Math Homework",
    description: "Clean template for math assignments with theorem environments.",
    category: "Academic",
    preamble: `\\documentclass[11pt]{article}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage[margin=1in]{geometry}

\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}{Lemma}
\\newtheorem{problem}{Problem}

\\title{Homework Assignment}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{problem}
State the problem here.
\\end{problem}

\\begin{proof}
Your solution...
\\end{proof}

\\end{document}`,
  },
  {
    id: "generic-image",
    name: "Image Add",
    description: "Code snippet to insert and center an image with a caption.",
    category: "Generics",
    preamble: `\\usepackage{graphicx}

% --- Copy this where you want the image ---
\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.8\\textwidth]{example-image}
  \\caption{Your caption here}
  \\label{fig:image1}
\\end{figure}`,
  },
  {
    id: "generic-table",
    name: "Table Add",
    description: "Standard table template with borders and a caption.",
    category: "Generics",
    preamble: `\\usepackage{booktabs}

% --- Copy this where you want the table ---
\\begin{table}[htbp]
  \\centering
  \\caption{Your Table Title}
  \\label{tab:table1}
  \\begin{tabular}{ccc}
    \\toprule
    Header 1 & Header 2 & Header 3 \\\\
    \\midrule
    Value 1 & Value 2 & Value 3 \\\\
    Value 4 & Value 5 & Value 6 \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}`,
  },
];
