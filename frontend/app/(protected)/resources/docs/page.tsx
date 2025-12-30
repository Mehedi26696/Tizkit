"use client";

import { motion } from "framer-motion";
import { BookOpen, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Static documentation resources
const documentationSections = [
  {
    title: "Getting Started",
    items: [
      {
        name: "Quick Start Guide",
        description: "Learn the basics of TizKit in 5 minutes.",
        href: "#quick-start",
      },
      {
        name: "Creating Your First Project",
        description: "Step-by-step guide to creating a project.",
        href: "#first-project",
      },
    ],
  },
  {
    title: "Editors",
    items: [
      {
        name: "Table Editor",
        description: "Master the premium table editing experience.",
        href: "#table-editor",
      },
      {
        name: "Diagram Editor",
        description: "Create TikZ diagrams with the visual canvas.",
        href: "#diagram-editor",
      },
      {
        name: "Image to LaTeX",
        description: "Convert images to LaTeX using AI Vision.",
        href: "#image-to-latex",
      },
    ],
  },
  {
    title: "LaTeX Reference",
    items: [
      {
        name: "Common Packages",
        description: "Essential LaTeX packages and their usage.",
        href: "#common-packages",
      },
      {
        name: "Math Symbols",
        description: "Comprehensive list of mathematical symbols.",
        href: "#math-symbols",
      },
      {
        name: "TikZ Basics",
        description: "Introduction to TikZ for diagrams.",
        href: "#tikz-basics",
      },
    ],
  },
];

const externalResources = [
  {
    name: "Overleaf Documentation",
    url: "https://www.overleaf.com/learn",
    description: "Comprehensive LaTeX tutorials and guides.",
  },
  {
    name: "LaTeX Wikibook",
    url: "https://en.wikibooks.org/wiki/LaTeX",
    description: "Community-maintained LaTeX reference.",
  },
  {
    name: "TikZ & PGF Manual",
    url: "https://tikz.dev/",
    description: "Official TikZ documentation.",
  },
  {
    name: "Detexify",
    url: "https://detexify.kirelabs.org/classify.html",
    description: "Draw a symbol to find its LaTeX command.",
  },
];

export default function DocumentationPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="text-gray-600 mt-2">
          Guides, references, and resources to help you master TizKit and LaTeX.
        </p>
      </motion.div>

      {/* Internal Docs */}
      {documentationSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-[#FA5F55]/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-1">
                  <BookOpen className="w-4 h-4 text-[#FA5F55]" />
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">{item.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* External Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          External Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalResources.map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-1">
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {resource.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 ml-7">{resource.description}</p>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
