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
import { systemTemplates } from "@/lib/constants/templates-data";

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
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24] selection:bg-[#FA5F55]/20 selection:text-[#FA5F55]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-72 pt-24 pb-12 px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FA5F55] shadow-[0_0_12px_rgba(250,95,85,0.5)]" />
                <span className="text-xs font-black text-[#FA5F55] uppercase tracking-[0.3em]">Resource Library</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-6xl font-[900] tracking-tight mb-4 leading-none">
                    System <span className="text-gradient">Templates</span>
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
                    Professional LaTeX preambles to kickstart your creation.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        

        {/* Templates Section */}
        <motion.div 
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.02] border border-[#f1f1f1] p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[#1f1e24] group-hover:text-white transition-all duration-500 shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-[900] text-[#1f1e24] tracking-tight">System Preambles</h2>
                  <p className="text-base text-gray-400 font-medium mt-1">
                    Ready-to-use LaTeX templates provided by TizKit Studio.
                  </p>
                </div>
              </div>
            </div>

            {categories.map((category) => (
              <div key={category} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                   <h3 className="text-[10px] font-black text-[#FA5F55] uppercase tracking-[0.4em] px-5 py-2.5 bg-[#FA5F55]/5 rounded-full w-fit">
                    {category}
                  </h3>
                  <div className="h-[1px] flex-1 bg-[#f1f1f1]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {systemTemplates
                    .filter((t) => t.category === category)
                    .map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white rounded-2xl border-2 border-[#e6dbd1] p-6 hover:border-[#FA5F55]/30 hover:shadow-xl hover:shadow-[#FA5F55]/5 transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#f9f4eb] rounded-xl text-[#FA5F55] group-hover:scale-105 transition-transform duration-300">
                              <FileText className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-[#1f1e24] text-lg tracking-tight group-hover:text-[#FA5F55] transition-colors">{template.name}</h4>
                          </div>
                        </div>
                        <p className="text-sm text-[#1f1e24]/60 font-medium mb-6 line-clamp-2 min-h-[40px]">{template.description}</p>
                        
                        <div className="flex-1 mb-6 bg-[#1e1e24] rounded-xl border border-[#e6dbd1]/20 overflow-hidden group/code">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a30] border-b border-[#e6dbd1]/10">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Architecture</span>
                          </div>
                          <div className="p-4 max-h-32 overflow-y-auto custom-scrollbar relative">
                            <pre className="text-[10px] font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                              {template.preamble}
                            </pre>
                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#1e1e24] to-transparent pointer-events-none" />
                          </div>
                        </div>

                        <motion.button
                          onClick={() => copyToClipboard(template.preamble, template.id)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest border-2",
                            copiedId === template.id
                              ? "bg-green-50, border-green-200 text-green-600"
                              : "bg-white border-[#e6dbd1] text-[#1f1e24]/70 hover:border-[#FA5F55] hover:text-[#FA5F55] hover:bg-[#FA5F55]/5"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Use Template</span>
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
