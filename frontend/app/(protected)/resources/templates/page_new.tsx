"use client";

import { motion } from "framer-motion";
import { FileText, Copy, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import Sidebar from '../../dashboard/components/Sidebar';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';

const systemTemplates = [
  {
    id: "apa",
    category: "Academic Papers",
    name: "APA Format",
    description: "Standard APA format for academic papers",
    preamble: `\\documentclass[12pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{setspace}
\\usepackage{natbib}
\\doublespacing

\\title{Your Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
Your content here...

\\bibliographystyle{apalike}
\\bibliography{references}
\\end{document}`,
  },
  {
    id: "ieee",
    category: "Academic Papers",
    name: "IEEE Format",
    description: "IEEE conference/journal paper format",
    preamble: `\\documentclass[conference]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}

\\begin{document}

\\title{Your Paper Title}

\\author{
\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{
\\textit{Department Name} \\\\
\\textit{University Name}\\\\
City, Country \\\\
email@domain.com}
}

\\maketitle

\\begin{abstract}
Your abstract here...
\\end{abstract}

\\section{Introduction}
Your content here...

\\bibliographystyle{IEEEtran}
\\bibliography{references}
\\end{document}`,
  },
  {
    id: "beamer",
    category: "Presentations",
    name: "Beamer Presentation",
    description: "Professional presentation template",
    preamble: `\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{default}

\\title{Presentation Title}
\\author{Your Name}
\\institute{Your Institution}
\\date{\\today}

\\begin{document}

\\frame{\\titlepage}

\\begin{frame}
\\frametitle{Table of Contents}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}{Introduction}
Your content here...
\\end{frame}

\\end{document}`,
  },
  {
    id: "letter",
    category: "Documents",
    name: "Formal Letter",
    description: "Professional letter template",
    preamble: `\\documentclass{letter}
\\usepackage[margin=1in]{geometry}
\\signature{Your Name}
\\address{Your Address \\\\ City, State ZIP}

\\begin{document}

\\begin{letter}{Recipient Name \\\\ 
Recipient Address \\\\
City, State ZIP}

\\opening{Dear Sir/Madam,}

Your letter content here...

\\closing{Sincerely,}

\\end{letter}
\\end{document}`,
  },
  {
    id: "report",
    category: "Documents",
    name: "Technical Report",
    description: "Structured technical report template",
    preamble: `\\documentclass[12pt]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Report Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents

\\chapter{Introduction}
Your content here...

\\chapter{Methodology}
Your content here...

\\chapter{Results}
Your content here...

\\chapter{Conclusion}
Your content here...

\\end{document}`,
  },
  {
    id: "cv",
    category: "Documents",
    name: "Professional CV",
    description: "Clean and professional curriculum vitae template",
    preamble: `\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}

\\name{John}{Doe}
\\title{Curriculum Vitae}
\\address{Street}{City}{Country}
\\phone[mobile]{+1~(234)~567~890}
\\email{john@doe.com}

\\begin{document}
\\makecvtitle

\\section{Education}
\\cventry{year--year}{Degree}{Institution}{City}{\\textit{Grade}}{Description}

\\section{Experience}
\\cventry{year--year}{Job title}{Employer}{City}{}{Description}

\\end{document}`,
  },
  {
    id: "thesis",
    category: "Academic Papers",
    name: "Thesis Template",
    description: "Comprehensive thesis/dissertation template",
    preamble: `\\documentclass[12pt,a4paper]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{setspace}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{hyperref}
\\doublespacing

\\title{Thesis Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\begin{titlepage}
\\centering
\\vspace*{1cm}
{\\Huge\\bfseries Thesis Title\\par}
\\vspace{1cm}
{\\Large Your Name\\par}
\\vfill
A thesis submitted in partial fulfillment\\\\
of the requirements for the degree of\\\\
Doctor of Philosophy
\\vfill
{\\large Department Name\\\\
University Name\\\\
\\today}
\\end{titlepage}

\\tableofcontents
\\listoffigures
\\listoftables

\\chapter{Introduction}
Your content here...

\\end{document}`,
  },
  {
    id: "poster",
    category: "Presentations",
    name: "Academic Poster",
    description: "Conference poster template",
    preamble: `\\documentclass[a0paper,portrait]{baposter}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{multicol}

\\begin{document}

\\begin{poster}{
  columns=3,
  headerheight=0.1\\textheight,
  background=plain,
  bgColorOne=white
}
{}
{Poster Title}
{Author Names}
{}

\\headerbox{Introduction}{name=intro,column=0,row=0}{
Your content here...
}

\\headerbox{Methods}{name=methods,column=1,row=0}{
Your content here...
}

\\headerbox{Results}{name=results,column=2,row=0}{
Your content here...
}

\\end{poster}
\\end{document}`,
  },
  {
    id: "book",
    category: "Documents",
    name: "Book Template",
    description: "Complete book structure with chapters",
    preamble: `\\documentclass[11pt]{book}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Book Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\frontmatter
\\maketitle
\\tableofcontents

\\mainmatter
\\chapter{First Chapter}
Your content here...

\\chapter{Second Chapter}
Your content here...

\\backmatter
\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`,
  },
  {
    id: "article",
    category: "Academic Papers",
    name: "Journal Article",
    description: "Standard article format for journals",
    preamble: `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{abstract}

\\title{Article Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract here...
\\end{abstract}

\\section{Introduction}
Your content here...

\\section{Methodology}
Your content here...

\\section{Results}
Your content here...

\\section{Discussion}
Your content here...

\\section{Conclusion}
Your content here...

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`,
  },
  {
    id: "table-example",
    category: "Examples",
    name: "LaTeX Table Example",
    description: "Comprehensive table creation guide with examples",
    preamble: `% Basic Table
\\begin{table}[h]
  \\centering
  \\caption{Basic Table Example}
  \\begin{tabular}{|c|c|c|}
    \\hline
    Header 1 & Header 2 & Header 3 \\\\
    \\hline
    Data 1 & Data 2 & Data 3 \\\\
    Data 4 & Data 5 & Data 6 \\\\
    \\hline
  \\end{tabular}
\\end{table}`,
  },
];

export default function SystemTemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.full_name || user?.username || 'User';

  const fadeInAnimationVariants = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * index,
      },
    }),
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50 font-[Helvetica]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-64 p-8 pt-24">
        {/* Decorative Gradients */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.4, 0.6, 0.4], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-96 h-96 bg-[#FA5F55]/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 0.8, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#1f1e24]/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-4xl mx-auto relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-[#1f1e24] mb-4">
              System Templates
            </h1>
            <p className="text-xl text-[#1f1e24]/70 max-w-2xl mx-auto">
              Ready-to-use LaTeX templates provided by TizKit. Copy any preamble to get started quickly.
            </p>
          </motion.div>

          {/* Templates Accordion */}
          <AccordionPrimitive.Root type="single" collapsible className="space-y-4">
            {systemTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                custom={index}
                variants={fadeInAnimationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <AccordionPrimitive.Item
                  value={template.id}
                  className="group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#FA5F55]/40 transition-all duration-300"
                >
                  <AccordionPrimitive.Header>
                    <AccordionPrimitive.Trigger className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#FA5F55]/10 rounded-lg group-hover:bg-[#FA5F55]/20 transition-colors">
                          <FileText className="w-6 h-6 text-[#FA5F55]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-[#1f1e24]">
                            {template.name}
                          </h3>
                          <p className="text-sm text-[#1f1e24]/60 mt-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <Plus className="h-6 w-6 text-[#1f1e24] shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-45" />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="p-6 pt-0 space-y-4">
                      {/* LaTeX Preview */}
                      <div className="bg-[#1e1e24] rounded-lg border-2 border-[#1f1e24]/20 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#f9f4eb]/80 border-b border-[#1f1e24]/10">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1f1e24]/60">
                            LaTeX Preamble
                          </span>
                        </div>
                        <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {template.preamble}
                          </pre>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <motion.button
                        onClick={() => copyToClipboard(template.preamble, template.id)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FA5F55]/10 hover:bg-[#FA5F55]/20 text-[#FA5F55] rounded-lg transition-all font-medium border-2 border-[#FA5F55]/20 hover:border-[#FA5F55]/40"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy Preamble
                          </>
                        )}
                      </motion.button>
                    </div>
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              </motion.div>
            ))}
          </AccordionPrimitive.Root>
        </div>
      </main>
    </div>
  );
}
