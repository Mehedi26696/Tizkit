"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardHeader from "../../components/DashboardHeader";
import Sidebar from "../../components/Sidebar";
import { 
  ArrowLeft, 
  Star, 
  Download, 
  User, 
  Calendar, 
  Tag, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Copy,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  ShieldCheck,
  TrendingUp,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getMarketplaceItem, submitMarketplaceReview, installMarketplaceItem, deleteMarketplaceItem } from "@/lib/api/marketplace";
import { useAuth } from "@/lib/context/AuthContext";
import type { MarketplaceItem, MarketplaceReview } from "@/types/marketplace";

export default function MarketplaceItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const itemId = params.id as string;

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      const data = await getMarketplaceItem(itemId);
      setItem(data);
    } catch (error) {
      console.error('Failed to fetch item:', error);
      toast.error('Failed to load item detail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!item) return;
    try {
      setIsInstalling(true);
      
      const result = await installMarketplaceItem(item.id);
      
      if (result.type === 'project') {
        toast.success('Successfully added to your professional projects!');
        router.push(`/projects/${result.id}`);
      } else {
        toast.success('Successfully added to your personal templates!');
        router.push('/templates');
      }
    } catch (error) {
      console.error('Failed to install template:', error);
      toast.error('Failed to add template to workspace');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm("Are you sure you want to remove this asset from the ecosystem? This action cannot be undone.")) return;
    
    try {
      await deleteMarketplaceItem(item.id);
      toast.success("Asset removed successfully");
      router.push("/dashboard/marketplace");
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to remove asset');
    }
  };

  const handleSubmitReview = async () => {
    if (!item) return;
    if (!userComment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await submitMarketplaceReview({
        item_id: item.id,
        rating: userRating,
        comment: userComment
      });
      toast.success("Review submitted! Thank you.");
      setUserComment("");
      fetchItem(); // Refresh ratings
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex flex-col items-center justify-center gap-6">
        <Sidebar />
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#FA5F55] rounded-full animate-spin" />
        <p className="text-gray-400 font-black text-sm uppercase tracking-[0.3em]">Syncing item protocols...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-72 pt-24 pb-20 px-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Back Button */}
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-gray-400 hover:text-[#FA5F55] transition-colors font-bold text-sm uppercase tracking-widest"
          >
             <div className="bg-white p-2 rounded-xl border border-[#f1f1f1] group-hover:border-[#FA5F55]/20 group-hover:bg-[#FA5F55]/5 transition-all">
                <ArrowLeft className="w-4 h-4" />
             </div>
             Back to Marketplace
          </button>

          {/* Item Header / Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Left: Preview/Thumbnail */}
             <div className="lg:col-span-2 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative aspect-video bg-white rounded-[3rem] border border-[#f1f1f1] overflow-hidden shadow-2xl shadow-black/[0.02]"
                >
                   {item.preview_image_url ? (
                     <img src={item.preview_image_url} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#FA5F55]/5 to-[#fffaf5] p-24">
                        <Star className="w-32 h-32 text-[#FA5F55]/5" />
                     </div>
                   )}
                   
                   <div className="absolute top-8 left-8">
                      <div className="bg-[#1f1e24] text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl">
                         {item.item_type}
                      </div>
                   </div>
                </motion.div>

                {/* Description & Features */}
                <div className="bg-white rounded-[3rem] p-12 border border-[#f1f1f1] shadow-2xl shadow-black/[0.01] space-y-8">
                   <div>
                      <h2 className="text-[10px] font-black text-[#FA5F55] uppercase tracking-[0.3em] mb-4">Engineering Manifesto</h2>
                      <p className="text-xl font-medium text-[#1f1e24]/70 leading-relaxed whitespace-pre-wrap">
                        {item.description || "The creator has not provided a detailed description for this engineering asset."}
                      </p>
                   </div>
                   
                   {/* Preamble Architecture */}
                   {item.preamble && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-sm font-black text-[#1f1e24] uppercase tracking-widest text-[#FA5F55]">Structural Preamble</h3>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(item.preamble || "");
                               toast.success("Preamble copied to clipboard");
                             }}
                             className="text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-[#FA5F55] transition-colors"
                           >
                              <Copy className="w-3.5 h-3.5" /> Copy Preamble
                           </button>
                        </div>
                        <div className="bg-[#f9f4eb] rounded-2xl p-8 border border-[#f1f1f1] overflow-hidden relative">
                           <pre className="text-sm font-mono text-[#1f1e24]/70 leading-relaxed overflow-x-auto selection:bg-[#FA5F55]/20 no-scrollbar">
                              <code>{item.preamble}</code>
                           </pre>
                        </div>
                     </div>
                   )}
                   
                   {/* Code Snippet Preview (Placeholder) */}
                   {item.latex_content && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-sm font-black text-[#1f1e24] uppercase tracking-widest">Code Intelligence</h3>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(item.latex_content || "");
                               toast.success("Content copied to clipboard");
                             }}
                             className="text-xs font-bold text-[#FA5F55] flex items-center gap-2 hover:underline"
                           >
                              <Copy className="w-3.5 h-3.5" /> Copy Snippet
                           </button>
                        </div>
                        <div className="bg-[#1f1e24] rounded-2xl p-8 overflow-hidden relative">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Zap className="w-24 h-24 text-white" />
                           </div>
                           <pre className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto selection:bg-[#FA5F55]/40 no-scrollbar">
                              <code>{item.latex_content.slice(0, 1000)}...</code>
                           </pre>
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Right: Sidebar Info & Actions */}
             <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-[3rem] p-10 border border-[#f1f1f1] shadow-2xl shadow-black/[0.02] sticky top-32"
                >
                   <h1 className="text-3xl font-[1000] tracking-tight text-[#1f1e24] mb-2 leading-tight">
                      {item.title}
                   </h1>
                   
                   <div className="flex items-center gap-4 mb-10">
                      <div className="flex items-center gap-1.5">
                         <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                         <span className="text-lg font-black">{item.rating_avg.toFixed(1)}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="text-sm font-bold text-gray-400">{item.review_count} Reviews</span>
                   </div>

                   <div className="space-y-6 mb-10 pb-10 border-b border-gray-50">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator</span>
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#1f1e24]">@{item.username || 'Anonymous'}</span>
                            <div className="w-6 h-6 rounded-full bg-[#FA5F55]/10 flex items-center justify-center">
                               <ShieldCheck className="w-3 h-3 text-[#FA5F55]" />
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</span>
                         <div className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-[#1f1e24]/60 tracking-wider">
                             {item.category_name || 'General'}
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Type</span>
                          <div className={cn(
                             "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                             item.is_free ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                          )}>
                             {item.is_free ? 'Standard Free' : 'Professional Premium'}
                          </div>
                       </div>
                       <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Price</span>
                          <span className="text-2xl font-[1000] text-[#1f1e24]">
                             {item.is_free ? 'FREE' : `$${item.price?.toFixed(2)}`}
                          </span>
                       </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Added</span>
                         <span className="text-sm font-black text-[#1f1e24]">
                           {new Date(item.created_at).toLocaleDateString()}
                         </span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployments</span>
                         <div className="flex items-center gap-2 text-green-500">
                            <span className="text-sm font-black">{item.usage_count}</span>
                            <TrendingUp className="w-3.5 h-3.5" />
                         </div>
                      </div>
                   </div>

                    <button 
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className={cn(
                        "w-full py-6 text-white rounded-[2rem] font-[1000] text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50",
                        item.is_free ? "bg-[#FA5F55] shadow-[#FA5F55]/30 hover:scale-[1.02] active:scale-95" : "bg-[#1f1e24] shadow-black/20 hover:bg-[#FA5F55]"
                      )}
                    >
                       {isInstalling ? (
                         <Loader2 className="w-5 h-5 animate-spin" />
                       ) : (
                         <>
                           {item.is_free ? 'Implement Template' : `Acquire & Deploy ($${item.price?.toFixed(2)})`}
                           <Zap className="w-5 h-5 fill-white" />
                         </>
                       )}
                    </button>

                    {item.user_id === user?.id && (
                      <button 
                        onClick={handleDelete}
                        className="w-full mt-4 py-4 text-red-500 hover:text-white border border-red-500/20 hover:bg-red-500 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                         Remove from Ecosystem
                      </button>
                    )}
                   
                   <p className="text-center mt-6 text-[10px] font-extrabold text-[#1f1e24]/30 uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Compatible with TizKit Studio 4.0+
                   </p>
                </motion.div>
             </div>
          </div>

          {/* Reviews Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
             <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-[1000] tracking-tight">Community Feedback</h2>
                   <div className="px-6 py-2 bg-white rounded-full border border-[#f1f1f1] text-[10px] font-black uppercase tracking-widest text-[#1f1e24]/40">
                      {item.review_count} Combined reviews
                   </div>
                </div>

                {/* Add Review */}
                <div className="bg-white rounded-[3rem] p-10 border border-[#f1f1f1] shadow-2xl shadow-black/[0.01] space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button 
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="transition-transform hover:scale-125 focus:outline-none"
                           >
                              <Star className={cn(
                                "w-6 h-6",
                                star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-100 fill-gray-100"
                              )} />
                           </button>
                        ))}
                      </div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest pl-2">Tap to Rate</span>
                   </div>
                   
                   <div className="relative">
                      <textarea 
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Add your thoughts on this template..."
                        className="w-full bg-[#fffaf5] border border-[#f1f1f1] rounded-3xl p-8 text-base font-medium outline-none focus:border-[#FA5F55]/20 focus:ring-[12px] focus:ring-[#FA5F55]/5 transition-all resize-none min-h-[150px]"
                      />
                      <button 
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="absolute bottom-6 right-6 p-4 bg-[#1f1e24] text-white rounded-2xl shadow-xl hover:bg-[#FA5F55] transition-all disabled:opacity-50"
                      >
                         {isSubmittingReview ? (
                           <Loader2 className="w-5 h-5 animate-spin" />
                         ) : (
                           <Send className="w-5 h-5" />
                         )}
                      </button>
                   </div>
                </div>

                {/* Review List Placeholder */}
                <div className="space-y-4">
                   <div className="bg-white/50 border border-dashed border-gray-200 rounded-[2.5rem] py-20 px-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Connect with other architects soon.</p>
                   </div>
                </div>
             </div>
             
             {/* Stats/Quick Tips */}
             <div className="space-y-8">
                <div className="bg-[#1f1e24] rounded-[3rem] p-10 text-white shadow-2xl shadow-black/10">
                   <ShieldCheck className="w-10 h-10 text-[#FA5F55] mb-6" />
                   <h3 className="text-xl font-black mb-4">TizKit Trust Score</h3>
                   <p className="text-gray-400 font-medium leading-relaxed mb-8">
                     This asset has been auto-scanned by our compilers. It is guaranteed to be clean and production-ready.
                   </p>
                   <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest">Verified Infrastructure</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
