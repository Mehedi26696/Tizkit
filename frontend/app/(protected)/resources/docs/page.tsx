"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from '../../dashboard/components/Sidebar';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';
import { fullDocs, documentationSections, externalResources } from "@/lib/constants/docs-data";

export default function DocumentationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>("quick-start");

  const displayName = user?.full_name || user?.username || 'User';
  const activeDoc = activeId ? (fullDocs as any)[activeId] : null;

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50 font-[Helvetica]">
      <Sidebar />
      <DashboardHeader />
      
      <div className="ml-64 pt-24 flex">
        {/* Left Sidebar: Navigation Grid */}
        <div className="w-[480px] p-8 border-r border-gray-200 overflow-y-auto bg-white/10 h-[calc(100vh-6rem)] sticky top-24">
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
                        : "bg-white/60 border-gray-200 hover:border-[#FA5F55]/20 hover:shadow-sm hover:bg-white"
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

          <div className="pt-8 border-t border-gray-200 mt-8">
            <h2 className="text-xs font-semibold text-[#1f1e24]/50 uppercase tracking-wider mb-5">External Resources</h2>
            <div className="space-y-2">
              {externalResources.map(res => (
                <motion.a 
                  key={res.name} 
                  href={res.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white/60 rounded-xl hover:bg-white transition-all flex items-center justify-between group border border-gray-200 hover:border-[#FA5F55]/20 hover:shadow-sm block"
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
