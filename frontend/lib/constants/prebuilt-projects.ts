import type { LucideIcon } from "lucide-react";
import { FileText, GraduationCap, User, Presentation } from "lucide-react";

export interface PrebuiltProject {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  color: string;
  latex_content: string;
}

export const PREBUILT_PROJECTS: PrebuiltProject[] = [
  {
    id: "resume-modern",
    title: "Modern Resume",
    description:
      "A professional, clean CV template perfect for software engineers and professionals.",
    category: "Professional",
    icon: User,
    color: "bg-blue-500",
    latex_content: `\\documentclass[11pt,a4paper,sans]{moderncv}

\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.75]{geometry}

\\name{John}{Doe}
\\title{Software Engineer}
\\address{123 Main Street}{City, State}{Country}
\\phone[mobile]{+1~(234)~567~890}
\\email{john@doe.com}
\\social[linkedin]{johndoe}
\\social[github]{johndoe}

\\begin{document}
\\makecvtitle

\\section{Summary}
Experienced software engineer with a passion for building scalable web applications and cloud infrastructure.

\\section{Experience}
\\cventry{2020--Present}{Senior Developer}{Tech Corp}{San Francisco}{}{Lead developer for the core platform team. Include your achievements here.}
\\cventry{2018--2020}{Junior Developer}{Startup Inc}{New York}{}{Implemented key features for the MVP. Collaborated with designers and product managers.}

\\section{Education}
\\cventry{2014--2018}{B.S. Computer Science}{University of Technology}{City}{}{GPA: 3.8/4.0}

\\section{Skills}
\\cvitem{Languages}{JavaScript, TypeScript, Python, Java}
\\cvitem{Technologies}{React, Node.js, AWS, Docker, Kubernetes}

\\end{document}`,
  },
  {
    id: "academic-paper",
    title: "Academic Paper",
    description: "Standard IEEE-style conference paper template with two columns.",
    category: "Academic",
    icon: GraduationCap,
    color: "bg-orange-500",
    latex_content: `\\documentclass[conference]{IEEEtran}
\\IEEEoverridecommandlockouts

\\begin{document}

\\title{Conference Paper Title goes Here}

\\author{\\IEEEauthorblockN{1\\textsuperscript{st} Given Name Surname}
\\IEEEauthorblockA{\\textit{dept. name of organization (of Aff.)} \\\\
\\textit{name of organization (of Aff.)}\\\\
City, Country \\\\
email address}
\\and
\\IEEEauthorblockN{2\\textsuperscript{nd} Given Name Surname}
\\IEEEauthorblockA{\\textit{dept. name of organization (of Aff.)} \\\\
\\textit{name of organization (of Aff.)}\\\\
City, Country \\\\
email address}
}

\\maketitle

\\begin{abstract}
This document is a model and instructions for \\LaTeX.
\\end{abstract}

\\begin{IEEEkeywords}
component, formatting, style, styling, insert
\\end{IEEEkeywords}

\\section{Introduction}
This demo file is intended to serve as a \`\`starter file'' for IEEE conference papers produced under \\LaTeX\\ using IEEEtran.cls version 1.8b and later.

\\section{Proposed Method}
Explain your proposed method here. You can include equations:

\\begin{equation}
E = mc^2
\\end{equation}

\\section{Results}
Present your experimental results here.

\\section{Conclusion}
The conclusion goes here.

\\begin{thebibliography}{00}
\\bibitem{b1} G. Eason, B. Noble, and I. N. Sneddon, \`\`On certain integrals of Lipschitz-Hankel type involving products of Bessel functions,'' Phil. Trans. Roy. Soc. London, vol. A247, pp. 529--551, April 1955.
\\end{thebibliography}

\\end{document}`,
  },
  {
    id: "presentation",
    title: "Presentation Slides",
    description: "Modern Beamer presentation template for lectures or project demos.",
    category: "Presentation",
    icon: Presentation,
    color: "bg-purple-500",
    latex_content: `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{default}

\\title{Presentation Title}
\\subtitle{A Subtitle}
\\author{Author Name}
\\institute{Institution}
\\date{\\today}

\\begin{document}

\\begin{frame}
\\titlepage
\\end{frame}

\\begin{frame}{Table of Contents}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}{Introduction}
\\begin{itemize}
\\item Point A
\\item Point B
\\item Point C
\\end{itemize}
\\end{frame}

\\section{Main Content}
\\begin{frame}{Main Slide}
This is the main part of the presentation.
\\begin{block}{Key Concept}
Important definition or concept goes here.
\\end{block}
\\end{frame}

\\section{Conclusion}
\\begin{frame}{Conclusion}
\\centering \\Large
Thank You!
\\end{frame}

\\end{document}`,
  },
  {
    id: "homework",
    title: "Homework Assignment",
    description: "Clean template for submitting math or science problem sets.",
    category: "Academic",
    icon: FileText,
    color: "bg-green-500",
    latex_content: `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Homework Assignment 1}
\\author{Student Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section*{Problem 1}
Solve the quadratic equation $ax^2 + bx + c = 0$.

\\subsection*{Solution}
The roots are given by the quadratic formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

\\section*{Problem 2}
Prove that the sum of two even integers is even.

\\subsection*{Solution}
Let $m$ and $n$ be two even integers.
Then usually $m = 2k$ and $n = 2j$ for some integers $k, j$.
$$m + n = 2k + 2j = 2(k + j)$$
Since $k+j$ is an integer, $2(k+j)$ is even.

\\end{document}`,
  },
];
