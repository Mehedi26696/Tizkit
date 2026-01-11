"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/Sidebar";
import MarketplaceItemCard from "./components/MarketplaceItemCard";
import { 
  Search, 
  Store, 
  Filter, 
  ChevronDown, 
  Sparkles, 
  LayoutGrid, 
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Box,
  Library,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMarketplaceCategories, listMarketplaceItems, deleteMarketplaceItem } from "@/lib/api/marketplace";
import { getProject, getProjects } from "@/lib/api/projects";
import type { MarketplaceCategory, MarketplaceItem, MarketplaceItemType } from "@/types/marketplace";
import ProjectPickerModal from "@/components/marketplace/ProjectPickerModal";
import ExportToMarketplaceModal from "@/components/marketplace/ExportToMarketplaceModal";
import type { Project, ProjectListItem } from "@/types/project";
import { useAuth } from "@/lib/context/AuthContext";

export default function MarketplacePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'top_rated'>('newest');
  const [itemType, setItemType] = useState<MarketplaceItemType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'explore' | 'creator'>('explore');
  const { user } = useAuth();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedProjectForExport, setSelectedProjectForExport] = useState<Project | null>(null);
  const [isFetchingProject, setIsFetchingProject] = useState(false);
  const [userProjects, setUserProjects] = useState<ProjectListItem[]>([]);
  const [creatorSubTab, setCreatorSubTab] = useState<'published' | 'drafts'>('published');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, itemType, activeTab, creatorSubTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
       const [catsData, itemsData, projectsData] = await Promise.all([
        getMarketplaceCategories(),
        listMarketplaceItems({
          category_id: selectedCategory || undefined,
          item_type: itemType === 'all' ? undefined : itemType,
          sort_by: sortBy,
          user_id: activeTab === 'creator' && creatorSubTab === 'published' ? user?.id : undefined
        }),
        activeTab === 'creator' && creatorSubTab === 'drafts' ? getProjects() : Promise.resolve([])
      ]);
      setCategories(catsData);
      setItems(itemsData.items);
      setUserProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleProjectSelect = async (projectItem: ProjectListItem) => {
    try {
      setIsFetchingProject(true);
      const fullProject = await getProject(projectItem.id);
      setSelectedProjectForExport(fullProject);
      setIsPickerOpen(false);
      setIsExportOpen(true);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      toast.error("Failed to load project details");
    } finally {
      setIsFetchingProject(false);
    }
  };

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this asset from the ecosystem?")) return;
    
    try {
      await deleteMarketplaceItem(itemId);
      toast.success("Asset removed successfully");
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to remove asset");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24] selection:bg-[#FA5F55]/20 selection:text-[#FA5F55]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-72 pt-24 pb-12 px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Marketplace Hero */}
          <section className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#1f1e24] rounded-[3rem] p-16 text-white overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#FA5F55]/20 rounded-full blur-[120px] -mr-64 -mt-64" />
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#FA5F55]/10 rounded-full blur-[100px] -ml-32 -mb-32" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-2 rounded-full bg-[#FA5F55] shadow-[0_0_15px_rgba(250,95,85,0.8)]" />
                        <span className="text-xs font-black text-[#FA5F55] uppercase tracking-[0.4em]">Professional Library</span>
                     </div>
                     <h1 className="text-8xl font-[1000] tracking-tighter mb-8 leading-[0.85]">
                        Template <br /> <span className="text-[#FA5F55]">Ecosystem.</span>
                     </h1>
                     <p className="text-xl text-white/50 max-w-xl font-medium leading-relaxed mb-12">
                        Acquire and deploy professional LaTeX templates and high-fidelity snippets engineered for precision.
                     </p>
                    <div className="flex gap-4">
                       <button className="px-10 py-5 bg-[#FA5F55] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#FA5F55]/20 hover:scale-105 active:scale-95 transition-all">
                         Latest Additions
                       </button>
                       <button 
                        onClick={() => setIsPickerOpen(true)}
                        className="px-10 py-5 bg-white/10 hover:bg-white text-white hover:text-[#1f1e24] rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3"
                       >
                         Contribute Asset <Plus className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 
                 <div className="hidden lg:grid grid-cols-2 gap-4 animate-float">
                    <div className="space-y-4">
                       <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 mt-12">
                          <TrendingUp className="w-8 h-8 text-[#FA5F55] mb-4" />
                          <p className="text-3xl font-black mb-1">2.4k+</p>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Installs</p>
                       </div>
                       <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                          <Award className="w-8 h-8 text-[#FA5F55] mb-4" />
                          <p className="text-3xl font-black mb-1">500+</p>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verified Templates</p>
                       </div>
                    </div>
                    <div className="space-y-4 mt-8">
                       <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                          <Box className="w-8 h-8 text-[#FA5F55] mb-4" />
                          <p className="text-3xl font-black mb-1">100%</p>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Open Logic</p>
                       </div>
                       <div className="bg-[#FA5F55] rounded-3xl p-8 shadow-2xl shadow-[#FA5F55]/20">
                          <Zap className="w-8 h-8 text-white mb-4" />
                          <p className="text-3xl font-black mb-1 text-white">PRO</p>
                          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Premium Assets</p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </section>

          {/* Featured Section */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-[10px] font-black text-[#FA5F55] uppercase tracking-[0.3em] mb-2">Editor's Choice</h2>
                   <h3 className="text-3xl font-[1000] tracking-tight">Featured Ecosystem Assets</h3>
                </div>
                <div className="flex gap-2">
                   <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white cursor-pointer hover:border-[#FA5F55]/20 transition-all">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                   </div>
                   <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center bg-white cursor-pointer hover:border-[#FA5F55]/20 transition-all">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
             </div>
             
             <div className="flex gap-8 overflow-x-auto pb-8 pt-2 no-scrollbar px-1">
                {items.slice(0, 4).map((item) => (
                   <div key={`featured-${item.id}`} className="min-w-[400px] max-w-[400px]">
                      <MarketplaceItemCard 
                        item={item}
                        onClick={(id) => router.push(`/dashboard/marketplace/${id}`)}
                      />
                   </div>
                ))}
                {items.length === 0 && !isLoading && (
                  <div className="w-full py-12 bg-white/50 rounded-[3rem] border border-dashed border-gray-200 flex items-center justify-center">
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Featured assets arrive soon</p>
                  </div>
                )}
             </div>
          </section>

          {/* Tab Navigation */}
          <section className="flex items-center gap-6 border-b border-[#f1f1f1]">
             {[
               { id: 'explore', label: 'Explore Ecosystem', icon: Library },
               { id: 'creator', label: 'My Creations', icon: Sparkles }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "flex items-center gap-3 pb-6 relative transition-all",
                   activeTab === tab.id 
                    ? "text-[#1f1e24]" 
                    : "text-gray-400 hover:text-[#1f1e24]"
                 )}
               >
                 <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#FA5F55]" : "")} />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                 {activeTab === tab.id && (
                   <motion.div 
                    layoutId="activeTabMarketplace"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#FA5F55] rounded-full" 
                   />
                 )}
               </button>
             ))}
          </section>

          {/* Navigation & Filters */}
          <section className="space-y-8">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Search */}
                <div className="relative w-full max-w-2xl group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#FA5F55] transition-all duration-300" />
                   <input 
                     type="text" 
                     placeholder="Search the ecosystem..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-16 pr-8 py-5 bg-white border border-[#f1f1f1] rounded-[2rem] focus:border-[#FA5F55]/20 focus:ring-[12px] focus:ring-[#FA5F55]/5 transition-all outline-none text-base font-medium shadow-2xl shadow-black/[0.01]"
                   />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                   <div className="flex bg-white p-1.5 rounded-2xl border border-[#f1f1f1]">
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Templates', value: 'template' },
                        { label: 'Snippets', value: 'snippet' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setItemType(type.value as any)}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            itemType === type.value 
                              ? "bg-[#1f1e24] text-white shadow-lg" 
                              : "text-gray-400 hover:text-[#1f1e24]"
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                   </div>
                   
                   <div className="relative group">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-white px-8 py-4 pr-12 rounded-2xl border border-[#f1f1f1] text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#FA5F55]/20 transition-all cursor-pointer shadow-2xl shadow-black/[0.01]"
                      >
                         <option value="newest">Newest</option>
                         <option value="popular">Most Popular</option>
                         <option value="top_rated">Top Rated</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                   </div>
                </div>
             </div>

             {/* Categories */}
             <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button
                   onClick={() => setSelectedCategory(null)}
                   className={cn(
                     "flex-shrink-0 px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                     selectedCategory === null 
                      ? "bg-[#FA5F55] text-white border-[#FA5F55] shadow-lg shadow-[#FA5F55]/20" 
                      : "bg-white text-gray-400 border-[#f1f1f1] hover:border-[#FA5F55]/40 hover:text-[#1f1e24]"
                   )}
                >
                   All Assets
                </button>
                {categories.map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => setSelectedCategory(cat.id)}
                     className={cn(
                       "flex-shrink-0 px-8 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                       selectedCategory === cat.id 
                        ? "bg-[#FA5F55] text-white border-[#FA5F55] shadow-lg shadow-[#FA5F55]/20" 
                        : "bg-white text-gray-400 border-[#f1f1f1] hover:border-[#FA5F55]/40 hover:text-[#1f1e24]"
                     )}
                   >
                     {cat.name}
                   </button>
                ))}
             </div>
          </section>

          {/* Grid Section */}
          <section>
             {isLoading ? (
               <div className="py-24 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 border-4 border-gray-100 border-t-[#FA5F55] rounded-full animate-spin" />
                  <p className="text-gray-400 font-black text-sm uppercase tracking-[0.3em]">Exploring the ecosystem...</p>
               </div>
             ) : (activeTab === 'explore' && filteredItems.length === 0) || (activeTab === 'creator' && creatorSubTab === 'published' && filteredItems.length === 0) || (activeTab === 'creator' && creatorSubTab === 'drafts' && userProjects.length === 0) ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-white rounded-[3rem] border border-dashed border-gray-200 py-32 px-12 text-center"
               >
                  <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <Box className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">No assets found matching your criteria.</h3>
                  <p className="text-gray-400 mb-10 max-w-md mx-auto font-medium">Try broadening your search or choosing a different category.</p>
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                    className="px-10 py-4 bg-[#1f1e24] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-[#FA5F55] transition-all"
                  >
                    Clear Filters
                  </button>
               </motion.div>
             ) : activeTab === 'creator' && creatorSubTab === 'drafts' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {userProjects.map((project, index) => (
                    <motion.div
                      key={`draft-${project.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-[2.5rem] border border-[#f1f1f1] p-8 hover:border-[#FA5F55]/30 hover:shadow-2xl hover:shadow-[#FA5F55]/5 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FA5F55]/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-[#FA5F55]/10 transition-colors" />
                      <Library className="w-10 h-10 text-[#FA5F55] mb-6" />
                      <h3 className="text-xl font-black mb-3 line-clamp-1">{project.title}</h3>
                      <p className="text-gray-400 text-xs font-medium mb-8 line-clamp-2">
                        {project.description || "Unpublished engineering asset waiting for evolution."}
                      </p>
                      <button 
                        onClick={() => handleProjectSelect(project)}
                        className="w-full py-4 bg-[#1f1e24] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-[#FA5F55] transition-all flex items-center justify-center gap-3"
                      >
                        Publish Asset <Plus className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredItems.map((item, index) => (
                     <motion.div
                       key={item.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.05 }}
                     >
                        <MarketplaceItemCard 
                          item={item}
                          onClick={(id) => router.push(`/dashboard/marketplace/${id}`)}
                          onDelete={activeTab === 'creator' ? handleDeleteItem : undefined}
                        />
                     </motion.div>
                  ))}
                </div>
              )}
          </section>

          {/* Call to Action - Join the Creator Community */}
          {!isLoading && (activeTab === 'explore' && filteredItems.length > 0 || activeTab === 'creator') && (
            <section className="bg-linear-to-r from-[#FA5F55] to-[#ff7b73] rounded-[3rem] p-16 text-white relative overflow-hidden shadow-2xl shadow-[#FA5F55]/20">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/images/pattern.svg')] bg-repeat" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                  <div className="max-w-xl">
                     <h2 className="text-5xl font-[1000] mb-6 leading-tight">Become a Creator.</h2>
                     <p className="text-white/80 text-lg font-bold leading-relaxed">
                        Have a beautiful template or a useful TikZ snippet? Share it with the community and build your reputation as a LaTeX expert.
                     </p>
                  </div>
                   <button 
                    onClick={() => setIsPickerOpen(true)}
                    className="flex-shrink-0 px-12 py-6 bg-[#1f1e24] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Export to Marketplace
                  </button>
               </div>

              {activeTab === 'creator' && (
                <div className="flex bg-white/50 p-1 rounded-2xl border border-[#f1f1f1] w-fit mb-8 mt-12 mx-auto md:mx-0">
                  <button
                    onClick={() => setCreatorSubTab('published')}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      creatorSubTab === 'published' ? "bg-[#1f1e24] text-white shadow-xl" : "text-gray-400 hover:text-[#1f1e24]"
                    )}
                  >
                    Published Assets
                  </button>
                  <button
                    onClick={() => setCreatorSubTab('drafts')}
                    className={cn(
                      "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      creatorSubTab === 'drafts' ? "bg-[#FA5F55] text-white shadow-xl" : "text-gray-400 hover:text-[#FA5F55]"
                    )}
                  >
                    Ready to Share ({userProjects.length})
                  </button>
                </div>
              )}
           </section>
          )}

        </div>
      </main>

      <ProjectPickerModal 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleProjectSelect}
      />

      {selectedProjectForExport && (
        <ExportToMarketplaceModal 
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          source={selectedProjectForExport}
        />
      )}

      {/* Loading Overlay for fetching project */}
      <AnimatePresence>
        {isFetchingProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6">
               <Loader2 className="w-12 h-12 text-[#FA5F55] animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1f1e24]">Preparing Engineering Asset...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
