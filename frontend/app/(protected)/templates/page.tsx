'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Plus, 
  Copy, 
  Pencil, 
  Trash2, 
  FileCode2, 
  Code, 
  Package, 
  X, 
  Loader2, 
  Search, 
  LayoutGrid, 
  Sparkles,
  ArrowRight,
  Check,
  Share2,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api/client';
import Sidebar from '../dashboard/components/Sidebar';
import DashboardHeader from '../dashboard/components/DashboardHeader';
import ExportToMarketplaceModal from '@/components/marketplace/ExportToMarketplaceModal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';

interface Template {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  preamble: string | null;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preamble: '',
    code: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sharing state
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTemplateForShare, setSelectedTemplateForShare] = useState<Template | null>(null);

  const displayName = user?.full_name?.split(' ')[0] || user?.username || 'User';

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await apiClient.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ title: '', description: '', preamble: '', code: '' });
    setShowModal(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description || '',
      preamble: template.preamble || '',
      code: template.code || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTemplate) {
        await apiClient.put(`/templates/${editingTemplate.id}`, formData);
        toast.success('Template updated!');
      } else {
        await apiClient.post('/templates', formData);
        toast.success('Template created!');
      }
      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await apiClient.delete(`/templates/${id}`);
      toast.success('Template deleted!');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleShare = (template: Template) => {
    setSelectedTemplateForShare(template);
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#1f1e24] selection:bg-[#FA5F55]/20 selection:text-[#FA5F55]">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-72 pt-24 pb-12 px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Premium Header Section */}
          <section className="pt-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FA5F55] shadow-[0_0_12px_rgba(250,95,85,0.5)]" />
                <span className="text-xs font-black text-[#FA5F55] uppercase tracking-[0.3em]">Personal Library</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-6xl font-[900] tracking-tight mb-4 leading-none">
                    My <span className="text-gradient">Templates</span>
                  </h1>
                  <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
                    Store and organize your LaTeX masterpieces.
                  </p>
                </div>
                <motion.button
                  onClick={handleCreate}
                  className="flex items-center gap-3 px-8 py-4 bg-[#1f1e24] text-white rounded-2xl font-black shadow-2xl shadow-black/10 hover:bg-[#FA5F55] hover:shadow-[#FA5F55]/20 transition-all text-xs uppercase tracking-widest"
                  whileHover={{ y: -4 }}
                >
                  <Plus className="w-5 h-5" />
                  New Template
                </motion.button>
              </div>
            </motion.div>
          </section>

          {/* Clean Filters & Search */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
             <div className="relative w-full max-w-2xl group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#FA5F55] transition-all duration-300" />
               <input 
                 type="text" 
                 placeholder="Search your snippets..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-16 pr-8 py-5 bg-white border border-[#f1f1f1] rounded-[2rem] focus:border-[#FA5F55]/20 focus:ring-[12px] focus:ring-[#FA5F55]/5 transition-all outline-none text-base font-medium shadow-2xl shadow-black/[0.01]"
               />
             </div>
             <div className="flex items-center gap-6">
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Snippets</p>
                   <p className="text-4xl font-black text-[#1f1e24] tracking-tighter">{templates.length}</p>
                </div>
             </div>
          </section>

          {/* Templates Grid */}
          <section>
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                 <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FA5F55] rounded-full animate-spin" />
                 <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Loading snippets...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-24 px-8 text-center"
              >
                 <div className="bg-gray-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <FileCode2 className="w-12 h-12 text-gray-300" />
                 </div>
                 <h3 className="text-2xl font-extrabold mb-3">No templates found.</h3>
                 <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">Add your first LaTeX snippet to start building your personal library.</p>
                 <button 
                   onClick={handleCreate}
                   className="px-10 py-4 bg-[#FA5F55] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#FA5F55]/20 hover:scale-105 active:scale-95 transition-all"
                 >
                   Create My First Template
                 </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl border-2 border-[#e6dbd1] p-6 hover:border-[#FA5F55]/30 hover:shadow-xl hover:shadow-[#FA5F55]/5 transition-all duration-300 relative flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-[#f9f4eb] rounded-xl text-[#FA5F55] group-hover:scale-105 transition-transform duration-300">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1">
                         <button onClick={() => handleEdit(template)} className="p-1.5 hover:bg-[#f9f4eb] rounded-lg text-gray-400 hover:text-[#FA5F55] transition-all">
                            <Pencil className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(template.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                          <button 
                            onClick={() => handleShare(template)} 
                            className="p-1.5 hover:bg-[#FA5F55]/10 rounded-lg text-gray-400 hover:text-[#FA5F55] transition-all"
                            title="Share to Marketplace"
                          >
                             <Store className="w-4 h-4" />
                          </button>
                      </div>
                    </div>

                    <div className="flex-1 mb-4">
                      <h3 className="font-bold text-[#1f1e24] text-lg mb-1 group-hover:text-[#FA5F55] transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-[#1f1e24]/60 text-sm line-clamp-2 min-h-[40px]">
                        {template.description || "Stored for quick access."}
                      </p>
                    </div>

                    {/* Compact Code Preview */}
                    <div className="space-y-2">
                       {template.preamble && (
                         <div className="bg-[#1e1e24] rounded-lg overflow-hidden group/code cursor-pointer border border-[#e6dbd1]/20" onClick={() => copyToClipboard(template.preamble!, 'Preamble')}>
                            <div className="px-3 py-1.5 flex items-center justify-between bg-[#2a2a30]">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Preamble</span>
                                <Copy className="w-3 h-3 text-gray-500 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                            </div>
                            <div className="px-3 py-2 max-h-20 overflow-hidden relative">
                               <pre className="text-[10px] font-mono text-gray-400 line-clamp-2 leading-relaxed">
                                  {template.preamble}
                               </pre>
                            </div>
                         </div>
                       )}
                       {template.code && (
                         <div className="bg-[#1e1e24] rounded-lg overflow-hidden group/code cursor-pointer border border-[#e6dbd1]/20" onClick={() => copyToClipboard(template.code!, 'Code')}>
                            <div className="px-3 py-1.5 flex items-center justify-between bg-[#2a2a30]">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Body Code</span>
                                <Copy className="w-3 h-3 text-gray-500 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                            </div>
                            <div className="px-3 py-2 max-h-24 overflow-hidden relative">
                               <pre className="text-[10px] font-mono text-gray-400 line-clamp-3 leading-relaxed">
                                  {template.code}
                               </pre>
                            </div>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
            </div>
            )}
          </section>
        </div>
      </main>

      {/* Modern Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative z-50 border border-gray-100"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-10 py-8">
                <div>
                   <h2 className="text-3xl font-extrabold text-[#1f1e24] tracking-tight">
                    {editingTemplate ? 'Refine Template' : 'New Template'}
                  </h2>
                  <p className="text-gray-400 font-medium text-sm mt-1">Design your LaTeX code snippet.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-[#1f1e24] rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-[#1f1e24]/70" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scrollbar">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Template Label</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Matrix Math Library"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent border-2 focus:border-[#FA5F55]/20 focus:bg-white focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none font-bold text-[#1f1e24]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Brief Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What is this for?"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent border-2 focus:border-[#FA5F55]/20 focus:bg-white focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none font-medium text-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-blue-500" /> Preamble
                       </label>
                    </div>
                    <textarea
                      value={formData.preamble}
                      onChange={(e) => setFormData({ ...formData, preamble: e.target.value })}
                      placeholder="\\usepackage{amsmath}..."
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl bg-[#1e1e24] text-gray-300 font-mono text-xs focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none border-2 border-transparent focus:border-[#FA5F55]/30 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-green-500" /> Body Code
                       </label>
                    </div>
                    <textarea
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="\\begin{equation}..."
                      rows={6}
                      className="w-full px-6 py-4 rounded-2xl bg-[#1e1e24] text-gray-300 font-mono text-xs focus:ring-8 focus:ring-[#FA5F55]/5 transition-all outline-none border-2 border-transparent focus:border-[#FA5F55]/30 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-white text-gray-400 hover:text-[#1f1e24] hover:bg-white border border-gray-100 transition-all shadow-sm"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-[#FA5F55] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#FA5F55]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Processing...' : (editingTemplate ? 'Update Snapshot' : 'Create Template')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedTemplateForShare && (
        <ExportToMarketplaceModal 
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedTemplateForShare(null);
          }}
          source={{
            title: selectedTemplateForShare.title,
            description: selectedTemplateForShare.description,
            latex_content: selectedTemplateForShare.code,
            preamble: selectedTemplateForShare.preamble
          }}
        />
      )}
    </div>
  );
}
