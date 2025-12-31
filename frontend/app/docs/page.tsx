"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ChevronRight, Info, Lightbulb, AlertTriangle, Code, Layout, Image as ImageIcon, Table as TableIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

// Detailed documentation content structure
const fullDocs = {
  "quick-start": {
    title: "Quick Start Guide",
    icon: Lightbulb,
    content: (
      <div className="space-y-4">
        <p>TizKit is designed to workflow the process of creating professional LaTeX documents. Here is the 5-minute path to success:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Create a Project</strong>: Start by creating a project in your dashboard. This serves as your main folder.</li>
          <li><strong>Add Sub-Projects</strong>: Create "Sub-Projects" for specific parts of your document (e.g., "Introduction", "Chapter 1", or "Main Diagram").</li>
          <li><strong>Use Specialized Editors</strong>: Use the TikZ or Table tools to generate code quickly.</li>
          <li><strong>Compile & Download</strong>: Use the compiler to see your results in PDF or PNG instantly.</li>
        </ol>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">All your files are automatically stored in Supabase with secure access control.</p>
        </div>
      </div>
    )
  },
  "table-editor": {
    title: "Table Engineer",
    icon: TableIcon,
    content: (
      <div className="space-y-4">
        <p>The Table Engineer helps you avoid the headache of LaTeX table syntax:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>CSV Support</strong>: Upload an existing CSV file to instantly see it as a LaTeX table.</li>
          <li><strong>Visual Styling</strong>: Toggle borders, bold headers, and alignment settings without touching code.</li>
          <li><strong>Real-time Preview</strong>: See the PDF output side-by-side as you modify your table.</li>
        </ul>
        <div className="bg-gray-100 p-3 rounded-md font-mono text-[11px] text-gray-700">
          Tip: Use the <code className="text-indigo-600 font-bold">\usepackage{"{booktabs}"}</code> package for professional results.
        </div>
      </div>
    )
  },
  "diagram-editor": {
    title: "TikZ Studio",
    icon: Layout,
    content: (
      <div className="space-y-4">
        <p>TikZ Studio transforms visual descriptions into complex TikZ code:</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-100 rounded-lg">
            <h4 className="font-bold text-xs mb-1">Step 1: AI Prompt</h4>
            <p className="text-[11px] text-gray-500">"Draw a neural network with 3 hidden layers..."</p>
          </div>
          <div className="p-3 border border-gray-100 rounded-lg">
            <h4 className="font-bold text-xs mb-1">Step 2: refine</h4>
            <p className="text-[11px] text-gray-500">Manually adjust node colors, arrows, or spacing.</p>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">Complex diagrams consume more credits but save hours of manual TikZ coding.</p>
        </div>
      </div>
    )
  },
  "image-to-latex": {
    title: "AI Image Vision",
    icon: ImageIcon,
    content: (
      <div className="space-y-4">
        <p>Turn screenshots or handwriting into LaTeX code instantly:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Upload</strong>: Drag and drop a clear image of a formula, table, or flowchart.</li>
          <li><strong>Convert</strong>: Our AI analyzes the structure and reconstructs it in LaTeX.</li>
          <li><strong>Fixer</strong>: If the code has errors, the 'AI Fixer' plugin will automatically debug the syntax.</li>
        </ul>
      </div>
    )
  },
  "common-packages": {
    title: "Common Packages",
    icon: Code,
    content: (
      <div className="space-y-4">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2">Package</th>
              <th className="p-2">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-mono text-indigo-600">amsmath</td><td className="p-2">Advanced mathematics symbols and formulas</td></tr>
            <tr><td className="p-2 font-mono text-indigo-600">graphicx</td><td className="p-2">Inserting and managing figures/images</td></tr>
            <tr><td className="p-2 font-mono text-indigo-600">geometry</td><td className="p-2">Defining margins and paper size</td></tr>
            <tr><td className="p-2 font-mono text-indigo-600">tikz</td><td className="p-2">Creating vector diagrams and graphics</td></tr>
            <tr><td className="p-2 font-mono text-indigo-600">hyperref</td><td className="p-2">Interactive links and bookmarks in PDF</td></tr>
          </tbody>
        </table>
      </div>
    )
  },
  "handbook": {
    title: "User Handbook",
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p>Managing your research on TizKit is straightforward. Here are the core organizational units:</p>
        <div className="space-y-3">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center shrink-0">1</div>
            <div>
              <h4 className="font-bold text-sm">Projects</h4>
              <p className="text-xs text-gray-500">The top-level container (e.g., "PhD Thesis"). Owners can invite collaborators via email.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center shrink-0">2</div>
            <div>
              <h4 className="font-bold text-sm">Sub-Projects</h4>
              <p className="text-xs text-gray-500">Specific LaTeX modules. Each sub-project has its own preamble and body code.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center shrink-0">3</div>
            <div>
              <h4 className="font-bold text-sm">File Linking</h4>
              <p className="text-xs text-gray-500">Upload images to your project, then "link" them to specific sub-projects for use in \includegraphics.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "math-symbols": {
    title: "Math Symbols Reference",
    icon: Code,
    content: (
      <div className="space-y-4">
        <p>Common mathematical symbols and their LaTeX commands:</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {["\\alpha (α)", "\\beta (β)", "\\gamma (γ)", "\\pi (π)", "\\theta (θ)", "\\sigma (σ)"].map(s => (
            <div key={s} className="flex justify-between border-b pb-1 text-xs">
              <span className="font-mono text-indigo-600">{s.split(' ')[0]}</span>
              <span className="text-gray-400">{s.split(' ')[1]}</span>
            </div>
          ))}
          {["\\sum (∑)", "\\int (∫)", "\\neq (≠)", "\\approx (≈)", "\\infty (∞)", "\\nabla (∇)"].map(s => (
            <div key={s} className="flex justify-between border-b pb-1 text-xs">
              <span className="font-mono text-indigo-600">{s.split(' ')[0]}</span>
              <span className="text-gray-400">{s.split(' ')[1]}</span>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 p-3 rounded text-[11px] text-amber-700 mt-4">
          Remember: Math commands must be inside dollars like <code className="font-bold">$ ... $</code> or <code className="font-bold">\[ ... \]</code>.
        </div>
      </div>
    )
  }
};

const documentationSections = [
  {
    title: "Core Concepts",
    items: [
      { id: "quick-start", name: "Quick Start Guide", description: "Learn the basics of TizKit in 5 minutes." },
      { id: "handbook", name: "User Handbook", description: "Navigating projects and sub-projects." },
    ],
  },
  {
    title: "Specialized Editors",
    items: [
      { id: "table-editor", name: "Table Engineer", description: "Master the visual table builder." },
      { id: "diagram-editor", name: "TikZ Studio", description: "Create TikZ diagrams with AI assistance." },
      { id: "image-to-latex", name: "Image Vision", description: "Convert images to LaTeX code." },
    ],
  },
  {
    title: "Technical Reference",
    items: [
      { id: "common-packages", name: "Standard Packages", description: "Essential LaTeX libraries." },
      { id: "math-symbols", name: "Math Symbols", description: "Commonly used mathematical commands." },
    ],
  },
];

const externalResources = [
  {
    name: "Overleaf Documentation",
    url: "https://www.overleaf.com/learn",
    description: "The gold standard for LaTeX tutorials.",
  },
  {
    name: "TikZ & PGF Manual",
    url: "https://tikz.dev/",
    description: "Deep dive into vector graphics.",
  },
];

export default function DocumentationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>("quick-start");

  const displayName = user?.full_name || user?.username || 'User';
  const activeDoc = activeId ? (fullDocs as any)[activeId] : null;

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50 font-[Helvetica]">
      <Navbar />

      <div className="pt-24 flex">
        {/* Left Sidebar: Navigation Grid */}
        <div className="w-[480px] p-8 border-r border-[#1f1e24]/10 overflow-y-auto bg-white/50 h-[calc(100vh-6rem)] sticky top-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10"
          >
            <h1 className="text-4xl font-bold text-[#1f1e24] mb-3">Knowledge Base</h1>
            <p className="text-[#1f1e24]/60 text-base leading-relaxed">
              Everything you need to build professional academic documents with AI and LaTeX.
            </p>
          </motion.div>

          {documentationSections.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="text-xs font-semibold text-[#1f1e24]/50 uppercase tracking-wider mb-5">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group",
                      activeId === item.id
                        ? "bg-white border-[#FA5F55]/30 shadow-sm"
                        : "bg-white/80 border-[#1f1e24]/10 hover:border-[#FA5F55]/20 hover:shadow-sm hover:bg-white"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold text-base mb-1",
                        activeId === item.id ? "text-[#1f1e24]" : "text-[#1f1e24]"
                      )}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-[#1f1e24]/60">{item.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform ml-3 flex-shrink-0",
                      activeId === item.id ? "rotate-90 text-[#FA5F55]" : "text-[#1f1e24]/30 group-hover:text-[#FA5F55]/50"
                    )} />
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-8 border-t border-[#1f1e24]/10 mt-8">
            <h2 className="text-xs font-semibold text-[#1f1e24]/50 uppercase tracking-wider mb-5">External Resources</h2>
            <div className="space-y-2">
              {externalResources.map(res => (
                <motion.a 
                  key={res.name} 
                  href={res.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white/80 rounded-xl hover:bg-white transition-all flex items-center justify-between group border border-[#1f1e24]/10 hover:border-[#FA5F55]/20 hover:shadow-sm block"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-sm font-medium text-[#1f1e24]">{res.name}</span>
                  <ExternalLink className="w-4 h-4 text-[#1f1e24]/40 group-hover:text-[#FA5F55]" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Expanded Detail View */}
        <div className="flex-1 p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl"
              >
                <div className="mb-8">
                  <h2 className="text-5xl font-bold text-[#1f1e24] mb-4">{activeDoc.title}</h2>
                  <p className="text-lg text-[#1f1e24]/60">Learn about {activeDoc.title.toLowerCase()} in TizKit.</p>
                </div>

                <div className="prose prose-lg max-w-none text-[#1f1e24] leading-relaxed">
                  {activeDoc.content}
                </div>

                <div className="mt-16 pt-8 border-t border-[#1f1e24]/10">
                  <h4 className="font-semibold text-lg text-[#1f1e24] mb-6">Related Topics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {documentationSections.flatMap(s => s.items).filter(i => i.id !== activeId).slice(0, 2).map(item => (
                      <motion.button 
                        key={item.id}
                        onClick={() => setActiveId(item.id)}
                        className="p-4 text-left bg-white/80 border border-[#1f1e24]/10 rounded-xl hover:border-[#FA5F55]/30 hover:shadow-sm transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-sm font-medium text-[#FA5F55] hover:text-[#FA5F55]/80">{item.name}</span>
                        <p className="text-xs text-[#1f1e24]/60 mt-1">{item.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center select-none"
              >
                <BookOpen className="w-32 h-32 text-[#1f1e24]/10 mb-6" />
                <h3 className="text-3xl font-semibold text-[#1f1e24]/40 mb-3">Select a topic from the sidebar</h3>
                <p className="text-lg text-[#1f1e24]/30">Choose any guide to read the full details here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-medium ${className}`}>
      {children}
    </span>
  )
}
