"use client";

import DashboardHeader from "./components/DashboardHeader";
import Sidebar from "./components/Sidebar";
import ProjectCard from "./components/ProjectCard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import { 
  Plus, 
  Search, 
  Loader2, 
  LayoutGrid, 
  Clock, 
  Zap, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  Layers,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getProjects } from "@/lib/api/projects";
import type { ProjectListItem } from "@/types/project";
import { toast } from "sonner";

function CircleProgress({ value, max }: { value: number, max: number }) {
  const percentage = (value / max) * 100;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="text-gray-50 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
        <circle 
          className="text-[#FA5F55] stroke-current transition-all duration-1000 ease-out" 
          strokeWidth="8" 
          strokeDasharray={251.2} 
          strokeDashoffset={251.2 - (251.2 * percentage) / 100}
          strokeLinecap="round" 
          fill="transparent" 
          r="40" cx="50" cy="50" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
         <FileText className="w-5 h-5 text-gray-200" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayName = user?.full_name?.split(' ')[0] || user?.username || 'User';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const recentProjects = useMemo(() => {
    return projects.slice(0, 3);
  }, [projects]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24] selection:bg-[#FA5F55]/20 selection:text-[#FA5F55]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-72 pt-24 pb-12 px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Hero Greeting - Warm & Personal */}
          <div className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl font-[900] tracking-tight mb-4 leading-none text-[#1f1e24]">
                Good evening, <br/>
                <span className="text-[#FA5F55]">
                   {displayName}.
                </span>
              </h1>
              <p className="text-xl text-[#1f1e24]/60 max-w-2xl font-medium leading-relaxed">
                Ready to create something extraordinary? Your studio is prepped.
              </p>
            </motion.div>
          </div>

          {/* Premium Bento Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <motion.div 
               whileHover={{ y: -5 }}
               className="md:col-span-2 lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-[#f1f1f1] flex flex-col justify-between shadow-2xl shadow-black/[0.02] relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#FA5F55]/10 to-transparent rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
               <div className="relative">
                 <div className="bg-[#1f1e24] p-4 rounded-2xl w-fit mb-8 shadow-xl shadow-black/10">
                    <Zap className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Computational Credits</h3>
                 <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tracking-tighter">84<span className="text-2xl text-gray-300">%</span></p>
                 </div>
                 <div className="mt-6 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "84%" }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-[#FA5F55] shadow-[0_0_15px_rgba(250,95,85,0.4)]" 
                    />
                 </div>
               </div>
               <button className="mt-10 text-[11px] font-black text-[#1f1e24] uppercase tracking-[0.2em] flex items-center gap-3 group/btn hover:text-[#FA5F55] transition-colors">
                  Upgrade Capacity <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform" />
               </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="lg:col-span-1.5 bg-white rounded-[2.5rem] p-10 border border-[#f1f1f1] shadow-2xl shadow-black/[0.02] flex flex-col items-center justify-center gap-3 relative group"
            >
               <CircleProgress value={projects.length} max={50} />
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Projects</h3>
               <p className="text-4xl font-black">{projects.length}</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => setIsModalOpen(true)}
              className="lg:col-span-1.5 bg-[#1f1e24] rounded-[2.5rem] p-10 text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-6 cursor-pointer group hover:bg-[#FA5F55] transition-all duration-500"
            >
               <div className="bg-white/10 p-5 rounded-full group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                  <Plus className="w-10 h-10" />
               </div>
               <span className="font-extrabold text-[11px] uppercase tracking-[0.3em]">Start New</span>
            </motion.div>
          </section>

          {/* Clean Filter Section */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
             <div className="relative w-full max-w-2xl group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#FA5F55] transition-all duration-300" />
               <input 
                 type="text" 
                 placeholder="Search your workspace..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-16 pr-8 py-5 bg-white border border-[#f1f1f1] rounded-[2rem] focus:border-[#FA5F55]/20 focus:ring-[12px] focus:ring-[#FA5F55]/5 transition-all outline-none text-base font-medium shadow-2xl shadow-black/[0.01]"
               />
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/projects')}
                  className="px-8 py-5 bg-[#fcfcfc] text-gray-400 border border-[#f1f1f1] rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:text-[#1f1e24] hover:shadow-xl hover:shadow-black/5 transition-all"
                >
                  <LayoutGrid className="w-4 h-4" /> All Projects
                </button>
             </div>
          </section>

          {/* Projects Reveal */}
          <section>
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-[#FA5F55] rounded-full" />
                   <h2 className="text-2xl font-extrabold tracking-tight">Recent Work</h2>
                </div>
                {!searchQuery && (
                  <button 
                    onClick={() => router.push('/projects')}
                    className="text-sm font-bold text-gray-400 hover:text-[#FA5F55] transition-colors"
                  >
                    Manage All
                  </button>
                )}
             </div>

             {isLoading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FA5F55] rounded-full animate-spin" />
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Syncing workspace...</p>
               </div>
             ) : filteredProjects.length === 0 ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-white rounded-3xl border border-dashed border-gray-200 py-24 px-8 text-center"
               >
                  <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Layers className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No projects found.</h3>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">Create your first LaTeX document or try a different search term.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3 bg-[#FA5F55] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FA5F55]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Get Started
                  </button>
               </motion.div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredProjects.slice(0, 6).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProjectCard 
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        status={project.status}
                        updatedAt={project.updated_at}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      />
                    </motion.div>
                 ))}
               </div>
             )}
          </section>

          {/* Quick Actions / Templates Shortcut */}
          <section className="bg-gradient-to-br from-[#1f1e24] to-[#333333] rounded-[2.5rem] p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#FA5F55]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
             <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl">
                   <h2 className="text-4xl font-extrabold mb-4">Start with a template.</h2>
                   <p className="text-gray-400 text-lg font-medium leading-relaxed">
                      Don't start from zero. Choose from over 50 professional templates designed for researchers and creators.
                   </p>
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => router.push('/resources/templates')}
                     className="px-10 py-5 bg-white text-[#1f1e24] rounded-2xl font-bold hover:scale-105 transition-all text-lg"
                   >
                     Browse Templates
                   </button>
                </div>
             </div>
          </section>

        </div>
      </main>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
