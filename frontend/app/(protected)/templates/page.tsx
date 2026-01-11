'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Copy, Pencil, Trash2, FileCode2, Code, Package, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api/client';
import Sidebar from '../dashboard/components/Sidebar';
import DashboardHeader from '../dashboard/components/DashboardHeader';
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
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preamble: '',
    code: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.full_name || user?.username || 'User';

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

  return (
    <div className="min-h-screen bg-[#f9f4eb]/50">
      <Sidebar />
      <DashboardHeader />
      
      <main className="ml-64 p-8 pt-24">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xl text-[#1f1e24]/70">Welcome</p>
          <h1 className="text-4xl font-bold text-[#1f1e24]">{displayName}</h1>
        </motion.div>

        {/* Templates Section */}
        <motion.div 
          className="bg-linear-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1f1e24]">My Templates</h2>
                <p className="text-sm text-[#1f1e24]/60 mt-1">
                  {templates.length} template{templates.length !== 1 ? 's' : ''} total • Store and reuse your personal LaTeX code snippets
                </p>
              </div>
              <motion.button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all shadow-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                New Template
              </motion.button>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
            </div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center">
              <FileCode2 className="w-16 h-16 mx-auto mb-4 text-[#1f1e24]/20" />
              <h3 className="text-lg font-medium text-[#1f1e24] mb-2">No templates yet</h3>
              <p className="text-[#1f1e24]/50 mb-4">Create your first template to save LaTeX code for reuse</p>
              <motion.button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Template
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border-2 border-[#1f1e24]/20 shadow-sm hover:shadow-md hover:border-[#FA5F55]/30 transition-all overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#FA5F55]/10 flex items-center justify-center shrink-0">
                          <FileCode2 className="w-5 h-5 text-[#FA5F55]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1f1e24] truncate">{template.title}</h3>
                          {template.description && (
                            <p className="text-xs text-[#1f1e24]/50 line-clamp-1">{template.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {template.preamble && (
                        <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-wider font-bold">
                          Preamble
                        </Badge>
                      )}
                      {template.code && (
                        <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-600 border-green-100 uppercase tracking-wider font-bold">
                          Body Code
                        </Badge>
                      )}
                    </div>

                    {/* Code Previews */}
                    <div className="space-y-3 mb-4">
                      {template.preamble && (
                        <div className="bg-[#1e1e24] rounded-lg border-2 border-[#1f1e24]/20 overflow-hidden">
                          <div className="px-2 py-1 bg-[#f9f4eb]/80 border-b border-[#1f1e24]/10 flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-blue-500" />
                            <span className="text-[9px] font-bold text-[#1f1e24]/60 uppercase tracking-tight">Preamble Preview</span>
                          </div>
                          <div className="p-2 max-h-32 overflow-y-auto custom-scrollbar">
                            <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">
                              {template.preamble}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {template.code && (
                        <div className="bg-[#1e1e24] rounded-lg border-2 border-[#1f1e24]/20 overflow-hidden">
                          <div className="px-2 py-1 bg-[#f9f4eb]/80 border-b border-[#1f1e24]/10 flex items-center gap-1.5">
                            <Code className="w-3 h-3 text-green-500" />
                            <span className="text-[9px] font-bold text-[#1f1e24]/60 uppercase tracking-tight">Body Code Preview</span>
                          </div>
                          <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">
                              {template.code}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Copy Buttons */}
                    <div className="flex gap-2 mb-4">
                      {template.preamble && (
                        <motion.button
                          onClick={() => copyToClipboard(template.preamble!, 'Preamble')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-all border border-blue-100"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Copy className="w-3 h-3" />
                          Copy Preamble
                        </motion.button>
                      )}
                      {template.code && (
                        <motion.button
                          onClick={() => copyToClipboard(template.code!, 'Code')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-all border border-green-100"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Copy className="w-3 h-3" />
                          Copy Code
                        </motion.button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t-2 border-[#1f1e24]/10 pt-4">
                      <motion.button
                        onClick={() => handleEdit(template)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-[#f9f4eb]/50 text-[#1f1e24] text-sm font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(template.id)}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-red-50 text-red-500 text-sm font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-[#1f1e24]/20"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#1f1e24]/10 bg-[#f9f4eb]/50">
                <h2 className="text-xl font-semibold text-[#1f1e24]">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h2>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[#1f1e24]/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-[#1f1e24]/70" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Math Equations Template"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:ring-2 focus:ring-[#FA5F55]/20 focus:border-[#FA5F55] outline-none transition-all text-[#1f1e24]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:ring-2 focus:ring-[#FA5F55]/20 focus:border-[#FA5F55] outline-none transition-all text-[#1f1e24]"
                  />
                </div>

                {/* Preamble */}
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      Preamble (Packages & Settings)
                    </span>
                  </label>
                  <textarea
                    value={formData.preamble}
                    onChange={(e) => setFormData({ ...formData, preamble: e.target.value })}
                    placeholder="\\usepackage{amsmath}&#10;\\usepackage{graphicx}&#10;..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm bg-[#f9f4eb]/20 text-[#1f1e24]"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-2">
                    <span className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-green-500" />
                      Code (Body Content)
                    </span>
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="\\begin{equation}&#10;  E = mc^2&#10;\\end{equation}"
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#1f1e24]/20 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-mono text-sm bg-[#f9f4eb]/20 text-[#1f1e24]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t-2 border-[#1f1e24]/10 bg-[#f9f4eb]/30">
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border-2 border-[#1f1e24]/20 text-[#1f1e24] font-medium hover:bg-[#1f1e24]/5 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#FA5F55] hover:bg-[#FA5F55]/90 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Saving...
                    </>
                  ) : (
                    editingTemplate ? 'Update Template' : 'Create Template'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
