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
