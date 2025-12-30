'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Copy, Pencil, Trash2, FileCode2, Code, Package, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api/client';
import Sidebar from '../dashboard/components/Sidebar';

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Templates</h1>
              <p className="text-gray-500 mt-1">Store and reuse your personal LaTeX code snippets</p>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <FileCode2 className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-6">Create your first template to save LaTeX code for reuse</p>
              <Button onClick={handleCreate} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <FileCode2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.title}</h3>
                          {template.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{template.description}</p>
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
                        <div className="bg-[#1e1e24] rounded-lg border border-gray-100 overflow-hidden">
                          <div className="px-2 py-1 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-blue-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Preamble Preview</span>
                          </div>
                          <div className="p-2 max-h-32 overflow-y-auto custom-scrollbar">
                            <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">
                              {template.preamble}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {template.code && (
                        <div className="bg-[#1e1e24] rounded-lg border border-gray-100 overflow-hidden">
                          <div className="px-2 py-1 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                            <Code className="w-3 h-3 text-green-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Body Code Preview</span>
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
                        <button
                          onClick={() => copyToClipboard(template.preamble!, 'Preamble')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Preamble
                        </button>
                      )}
                      {template.code && (
                        <button
                          onClick={() => copyToClipboard(template.code!, 'Code')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Code
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => handleEdit(template)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-red-50 text-red-500 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Math Equations Template"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this template"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Preamble */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm bg-slate-50"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-mono text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingTemplate ? 'Update Template' : 'Create Template'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
