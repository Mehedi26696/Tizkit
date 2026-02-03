"use client";

import { motion } from "framer-motion";
import { Star, Download, User, Tag, ArrowRight, Trash2 } from "lucide-react";
import { MarketplaceItem } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onClick: (id: string) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export default function MarketplaceItemCard({ item, onClick, onDelete }: MarketplaceItemCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-[2rem] border border-[#f1f1f1] overflow-hidden shadow-2xl shadow-black/[0.02] flex flex-col h-full group transition-all duration-300 hover:shadow-xl hover:shadow-[#FA5F55]/5"
      onClick={() => onClick(item.id)}
    >
      {/* Preview Section */}
      <div className="relative h-56 bg-[#fffaf5] border-b border-[#f1f1f1] overflow-hidden">
        {item.preview_image_url ? (
          <img 
            src={item.preview_image_url} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#FA5F55]/5 to-[#fffaf5] p-12">
             <div className="relative">
                <div className="absolute inset-0 bg-[#FA5F55]/20 blur-2xl rounded-full" />
                <Star className="relative w-16 h-16 text-[#FA5F55]/20 group-hover:rotate-12 transition-transform duration-500" />
             </div>
          </div>
        )}
        
        {/* Type Badge and Price/Free Badge */}
        <div className="absolute top-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 bg-[#1f1e24]/5 rounded-full border border-[#1f1e24]/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1e24]/40">Template</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-[1000] uppercase tracking-widest flex items-center gap-1.5",
                item.is_free 
                  ? "bg-green-50 text-green-600 border border-green-100" 
                  : "bg-[#FA5F55]/10 text-[#FA5F55] border border-[#FA5F55]/20"
              )}>
                {item.is_free ? (
                  <>Free</>
                ) : (
                  <>${item.price?.toFixed(2)}</>
                )}
              </div>
              
              {onDelete && (
                <button 
                  onClick={(e) => onDelete(item.id, e)}
                  className="p-1.5 bg-red-50 text-red-500 rounded-lg border border-red-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
           <div className="w-6 h-6 rounded-full bg-[#FA5F55]/10 flex items-center justify-center">
             <User className="w-3 h-3 text-[#FA5F55]" />
           </div>
           <span className="text-xs font-bold text-[#1f1e24]/40">@{item.username || 'Anonymous'}</span>
        </div>

        <h3 className="text-xl font-black text-[#1f1e24] mb-2 leading-tight group-hover:text-[#FA5F55] transition-colors line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-sm text-[#1f1e24]/50 font-medium mb-6 line-clamp-2">
          {item.description || "No description provided."}
        </p>

        <div className="mt-auto space-y-4">
           {/* Tags */}
           <div className="flex flex-wrap gap-2">
              {item.category_name && (
                <div className="px-3 py-1 bg-gray-50 rounded-lg flex items-center gap-1.5 border border-gray-100">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.category_name}</span>
                </div>
              )}
           </div>

           {/* Stats */}
           <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-black text-[#1f1e24]">{item.rating_avg.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-bold text-gray-400">{item.usage_count}</span>
                </div>
              </div>
              
              <motion.div 
                whileHover={{ x: 3 }}
                className="text-[#FA5F55] cursor-pointer"
              >
                 <ArrowRight className="w-4 h-4" />
              </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
