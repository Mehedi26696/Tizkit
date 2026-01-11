"use client";

import { motion } from "framer-motion";
import { FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from '../../dashboard/components/Sidebar';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';

// System-provided LaTeX templates (static data)
const systemTemplates = [
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

export default function SystemTemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.full_name || user?.username || 'User';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [...new Set(systemTemplates.map((t) => t.category))];

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-64 p-8 pt-24">
        

        {/* Templates Section */}
        <motion.div 
          className="bg-linear-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                <FileText className="w-6 h-6 text-[#FA5F55]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#1f1e24]">System Templates</h2>
                <p className="text-sm text-[#1f1e24]/60 mt-1">
                  Ready-to-use LaTeX templates provided by TizKit • Copy any preamble to get started quickly
                </p>
              </div>
            </div>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-10 last:mb-0">
              <h3 className="text-lg font-semibold text-[#1f1e24] mb-4 pb-2 border-b-2 border-[#1f1e24]/10">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemTemplates
                  .filter((t) => t.category === category)
                  .map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border-2 border-[#1f1e24]/20 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#FA5F55]/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                            <FileText className="w-5 h-5 text-[#FA5F55]" />
                          </div>
                          <h4 className="font-semibold text-[#1f1e24]">{template.name}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-[#1f1e24]/60 mb-4">{template.description}</p>
                      
                      <div className="mb-4 bg-[#1e1e24] rounded-lg border-2 border-[#1f1e24]/20 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#f9f4eb]/80 border-b border-[#1f1e24]/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f1e24]/60">LaTeX Preview</span>
                        </div>
                        <div className="p-3 max-h-40 overflow-y-auto custom-scrollbar">
                          <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {template.preamble}
                          </pre>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => copyToClipboard(template.preamble, template.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FA5F55]/10 hover:bg-[#FA5F55]/20 text-[#FA5F55] rounded-lg transition-all text-sm font-medium border-2 border-[#FA5F55]/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
