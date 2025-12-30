"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ArrowLeft, ChevronRight, Info, Lightbulb, AlertTriangle, Code, Layout, Image as ImageIcon, Table as TableIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDoc = activeId ? (fullDocs as any)[activeId] : null;

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      {/* Left Sidebar: Navigation Grid */}
      <div className="w-[450px] p-8 border-r border-gray-200 overflow-y-auto bg-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Resources</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Everything you need to build professional academic documents with AI and LaTeX.
          </p>
        </motion.div>

        {documentationSections.map((section) => (
          <div key={section.title} className="mb-10">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    activeId === item.id
                      ? "bg-indigo-50 border-indigo-200 shadow-sm"
                      : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-xs"
                  }`}
                >
                  <div>
                    <h3 className={`font-semibold text-sm ${activeId === item.id ? "text-indigo-700" : "text-gray-900"}`}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    activeId === item.id ? "rotate-90 text-indigo-500" : "text-gray-300 group-hover:text-indigo-300"
                  }`} />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-gray-100">
           <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Extra Help</h2>
           <div className="grid grid-cols-2 gap-3">
             {externalResources.map(res => (
               <a 
                key={res.name} 
                href={res.url} 
                target="_blank" 
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
               >
                 <span className="text-[10px] font-semibold text-gray-600">{res.name}</span>
                 <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
               </a>
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
              className="max-w-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <activeDoc.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-gray-900">{activeDoc.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">Verified Guide</Badge>
                  </div>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed text-lg">
                {activeDoc.content}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Related Topics</h4>
                <div className="flex gap-4">
                   {documentationSections.flatMap(s => s.items).filter(i => i.id !== activeId).slice(0, 2).map(item => (
                     <button 
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4"
                     >
                       {item.name}
                     </button>
                   ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none"
            >
              <BookOpen className="w-24 h-24 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-500">Select a topic from the sidebar</h3>
              <p className="text-gray-400 mt-2">Choose any guide to read the full details here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
