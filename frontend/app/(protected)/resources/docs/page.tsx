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
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24] selection:bg-[#FA5F55]/20 selection:text-[#FA5F55]">
      <Sidebar />
      <DashboardHeader />
      
      <div className="ml-72 pt-24 flex min-h-screen">
        {/* Left Sidebar: Navigation Grid */}
        <div className="w-[400px] p-8 border-r border-[#e6dbd1] overflow-y-auto bg-[#fffaf5] h-[calc(100vh-6rem)] sticky top-24 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FA5F55]" />
              <span className="text-xs font-black text-[#FA5F55] uppercase tracking-widest">Documentation</span>
            </div>
            <h1 className="text-3xl font-[900] text-[#1f1e24] tracking-tight mb-3">Knowledge Base</h1>
            <p className="text-[#1f1e24]/60 text-sm font-medium leading-relaxed">
              Everything you need to build professional academic documents with AI and LaTeX.
            </p>
          </motion.div>

          {documentationSections.map((section) => (
            <div key={section.title} className="mb-10">
              <h2 className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.2em] mb-4 pl-1">
                {section.title}
              </h2>
              <div className="space-y-2.5">
                {section.items.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group relative overflow-hidden",
                      activeId === item.id
                        ? "bg-white border-[#FA5F55]/20 text-[#FA5F55] shadow-lg shadow-[#FA5F55]/5"
                        : "bg-white border-[#e6dbd1]/60 hover:border-[#FA5F55]/30 hover:shadow-md hover:shadow-[#FA5F55]/5 text-[#1f1e24]/80"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                     {/* Active Indicator */}
                     {activeId === item.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FA5F55]" />
                     )}
                    <div className="flex-1 pl-2">
                      <h3 className="font-bold text-sm mb-0.5">
                        {item.name}
                      </h3>
                      <p className={cn("text-xs font-medium line-clamp-1", activeId === item.id ? "opacity-80" : "opacity-50")}>{item.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform ml-2 flex-shrink-0",
                      activeId === item.id ? "rotate-90 opacity-100" : "opacity-20 group-hover:opacity-100"
                    )} />
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-8 border-t border-[#e6dbd1] mt-4">
            <h2 className="text-[10px] font-bold text-[#1f1e24]/40 uppercase tracking-[0.2em] mb-4 pl-1">External Resources</h2>
            <div className="space-y-2">
              {externalResources.map(res => (
                <motion.a 
                  key={res.name} 
                  href={res.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white rounded-xl border-2 border-[#e6dbd1]/60 hover:border-[#FA5F55]/30 hover:shadow-md hover:shadow-[#FA5F55]/5 flex items-center justify-between group transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-sm font-bold text-[#1f1e24] group-hover:text-[#FA5F55] transition-colors">{res.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1f1e24]/30 group-hover:text-[#FA5F55] transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Expanded Detail View */}
        <div className="flex-1 p-16 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar bg-[#fffaf5]">
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-10 pb-10 border-b border-[#e6dbd1]">
                  <div className="flex items-center gap-3 mb-6">
                     <span className="px-3 py-1 rounded-full bg-[#FA5F55]/10 text-[#FA5F55] text-[10px] font-black uppercase tracking-widest border border-[#FA5F55]/20">
                        Guide
                     </span>
                  </div>
                  <h2 className="text-5xl font-[900] text-[#1f1e24] mb-6 tracking-tight">{activeDoc.title}</h2>
                  <p className="text-xl text-[#1f1e24]/60 font-medium leading-relaxed">Measurements, configurations, and best practices for {activeDoc.title.toLowerCase()}.</p>
                </div>

                <div className="prose prose-lg max-w-none text-[#1f1e24]/80 leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#FA5F55] prose-strong:text-[#1f1e24]">
                  {activeDoc.content}
                </div>

                <div className="mt-20 pt-10 border-t border-[#e6dbd1]">
                  <h4 className="font-bold text-lg text-[#1f1e24] mb-6 flex items-center gap-2">
                     <BookOpen className="w-5 h-5 text-[#FA5F55]" />
                     Related Topics
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {documentationSections.flatMap(s => s.items).filter(i => i.id !== activeId).slice(0, 2).map(item => (
                      <motion.button 
                        key={item.id}
                        onClick={() => setActiveId(item.id)}
                        className="p-6 text-left bg-white rounded-2xl border-2 border-[#e6dbd1] hover:border-[#FA5F55]/30 hover:shadow-xl hover:shadow-[#FA5F55]/5 transition-all group"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="text-base font-bold text-[#1f1e24] group-hover:text-[#FA5F55] transition-colors block mb-2">{item.name}</span>
                        <p className="text-sm text-[#1f1e24]/50 font-medium">{item.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center select-none opacity-50"
              >
                <div className="w-24 h-24 bg-[#e6dbd1]/30 rounded-3xl flex items-center justify-center mb-6 text-[#FA5F55]">
                   <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1f1e24] mb-2">Knowledge Base</h3>
                <p className="text-lg text-[#1f1e24]/60 font-medium max-w-md">Select a topic from the sidebar to view its documentation.</p>
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
