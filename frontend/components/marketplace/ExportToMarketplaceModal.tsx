"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Store, 
  Loader2, 
  Sparkles, 
  ChevronRight, 
  Info,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getMarketplaceCategories, exportToMarketplace } from "@/lib/api/marketplace";
import type { MarketplaceCategory, MarketplaceItemType } from "@/types/marketplace";
import type { Project } from "@/types/project";
import MarketplaceItemCard from "../../app/(protected)/dashboard/marketplace/components/MarketplaceItemCard";
import { useAuth } from "@/lib/context/AuthContext";

interface ExportToMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: {
    title: string;
    description?: string | null;
    latex_content?: string | null;
    preamble?: string | null;
    preview_image_url?: string | null;
  };
}

export default function ExportToMarketplaceModal({ isOpen, onClose, source }: ExportToMarketplaceModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [formData, setFormData] = useState({
    title: source.title,
    description: source.description || "",
    item_type: "template" as MarketplaceItemType,
    is_free: true,
    price: 0,
    tags: "",
    preamble: source.preamble || ""
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: source.title,
        description: source.description || "",
        item_type: "template" as MarketplaceItemType,
        is_free: true,
        price: 0,
        tags: "",
        preamble: source.preamble || ""
      });
    }
  }, [isOpen, source]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToMarketplace({
        title: formData.title,
        description: formData.description,
        item_type: formData.item_type,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
        latex_content: source.latex_content ?? undefined,
        preamble: formData.preamble || undefined,
        tags: formData.tags
      });
      
      toast.success("Successfully exported to Marketplace!");
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export to marketplace");
    } finally {
      setIsExporting(false);
    }
  };

  // Mock item for preview
  const previewItem = {
    id: "preview",
    title: formData.title || "Untitled Masterpiece",
    description: formData.description || "Start typing your engineering manifesto to see it reflected here in real-time.",
    category_name: "General",
    item_type: formData.item_type,
    is_free: formData.is_free,
    price: formData.price,
    username: user?.username || "Creator",
   rating_avg: 0.0,
    review_count: 0,
    usage_count: 0,
    created_at: new Date().toISOString(),
    preview_image_url: source.preview_image_url
  } as any;

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl bg-[#fffaf5] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[700px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Form */}
            <div className="flex-1 p-12 lg:p-16 space-y-10 bg-white overflow-y-auto max-h-[90vh]">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="bg-[#FA5F55] p-3 rounded-2xl">
                        <Store className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-[1000] tracking-tight">Creator Portal</h2>
                        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mt-1">Publish to Ecosystem</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="lg:hidden p-3 hover:bg-gray-100 rounded-full transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="space-y-8">
                  {/* Asset Type: Templates only */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest pl-1">Engineering Classification</label>
                     <div className="px-6 py-4 bg-gray-50 border border-[#f1f1f1] rounded-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1e24]">Template</span>
                     </div>
                  </div>
                  {/* Monetization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-3xl border border-[#f1f1f1]">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest pl-1">Access Type</label>
                        <div className="flex p-1 bg-white border border-[#f1f1f1] rounded-2xl">
                           <button 
                              onClick={() => setFormData(prev => ({ ...prev, is_free: true }))}
                              className={cn(
                                 "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all",
                                 formData.is_free ? "bg-[#1f1e24] text-white shadow-lg" : "text-gray-400 hover:text-[#1f1e24]"
                              )}
                           >
                              Free
                           </button>
                           <button 
                              onClick={() => setFormData(prev => ({ ...prev, is_free: false }))}
                              className={cn(
                                 "flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all",
                                 !formData.is_free ? "bg-[#FA5F55] text-white shadow-lg" : "text-gray-400 hover:text-[#FA5F55]"
                              )}
                           >
                              Professional
                           </button>
                        </div>
                     </div>

                     {!formData.is_free && (
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest pl-1">Execution Price ($)</label>
                           <div className="relative">
                              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FA5F55]" />
                              <input 
                                 type="number"
                                 value={formData.price}
                                 onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                 className="w-full pl-14 pr-8 py-5 bg-white border border-[#f1f1f1] rounded-2xl focus:border-[#FA5F55]/20 focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none font-bold text-sm"
                                 placeholder="0.00"
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest pl-1">Asset Manifesto (Description)</label>
                     <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-8 py-6 bg-gray-50 border border-[#f1f1f1] rounded-3xl focus:border-[#FA5F55]/20 focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none font-medium text-sm min-h-[120px] resize-none"
                        placeholder="Detail the technical logic..."
                     />
                  </div>

                  {/* Preamble Architecture */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest">Structural Preamble (Dependencies & Config)</label>
                        <span className="text-[9px] font-bold text-[#FA5F55] uppercase tracking-tighter">Crucial for Templates</span>
                     </div>
                     <textarea 
                        value={formData.preamble}
                        onChange={(e) => setFormData(prev => ({ ...prev, preamble: e.target.value }))}
                        className="w-full px-8 py-6 bg-[#1f1e24] text-gray-300 border border-[#f1f1f1] rounded-3xl focus:border-[#FA5F55]/40 transition-all outline-none font-mono text-xs min-h-[120px] resize-none selection:bg-[#FA5F55]/40"
                        placeholder="\documentclass{...} \usepackage{...}"
                     />
                  </div>

                  {/* Code Body Preview */}
                  {source.latex_content && (
                     <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                           <label className="text-[10px] font-black text-[#1f1e24]/40 uppercase tracking-widest">Body Code (Read-Only Preview)</label>
                           <span className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Included in Export</span>
                        </div>
                        <div className="w-full px-8 py-6 bg-[#1f1e24] text-gray-400 border border-[#f1f1f1] rounded-3xl font-mono text-xs min-h-[100px] max-h-[150px] overflow-y-auto">
                           <pre className="whitespace-pre-wrap">{source.latex_content}</pre>
                        </div>
                     </div>
                  )}

               </div>

               <div className="pt-6">
                  <button 
                     onClick={handleExport}
                     disabled={isExporting || isLoading}
                     className="w-full py-7 bg-[#1f1e24] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/10 hover:bg-[#FA5F55] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                     {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalize Contribution <ChevronRight className="w-5 h-5" /></>}
                  </button>
               </div>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden lg:flex w-[450px] bg-[#fffaf5] p-16 flex-col items-center justify-center relative">
               <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center w-full">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Live Ecosystem Preview</h3>
                  <div className="h-px w-12 bg-gray-200 mx-auto" />
               </div>

               <div className="relative z-10 w-full animate-float">
                  <div className="absolute -inset-4 bg-[#FA5F55]/5 blur-3xl rounded-full opacity-50" />
                  <MarketplaceItemCard 
                     item={previewItem}
                     onClick={() => {}}
                  />
               </div>

               <div className="mt-16 bg-white/50 backdrop-blur-sm border border-white p-8 rounded-3xl w-full">
                  <div className="flex items-center gap-4 mb-4">
                     <Info className="w-5 h-5 text-[#FA5F55]" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-[#1f1e24]">Architect Note</h4>
                  </div>
                  <p className="text-[11px] font-medium text-[#1f1e24]/50 leading-relaxed">
                     This is exactly how your contribution will appear in the global marketplace. Ensure your title and description capture the essence of your creation.
                  </p>
               </div>

               <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-black/5 rounded-full transition-colors text-gray-400">
                  <X className="w-6 h-6" />
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
