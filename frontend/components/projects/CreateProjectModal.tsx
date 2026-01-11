"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, FileText } from "lucide-react";
import { createProject } from "@/lib/api/projects";
import { createSubProject } from "@/lib/api/subProjects";
import { PREBUILT_PROJECTS } from "@/lib/constants/prebuilt-projects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("blank");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsCreating(true);

    try {
      let latexContent = "\\documentclass{article}\n\\begin{document}\n\nHello, World!\n\n\\end{document}";
      
      if (selectedTemplateId !== "blank") {
        const template = PREBUILT_PROJECTS.find(t => t.id === selectedTemplateId);
        if (template) {
          latexContent = template.latex_content;
        }
      }

      const newProject = await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        status: "draft",
        latex_content: latexContent
      });

      // Automatically create a "Main Document" sub-project with the template content
      try {
        await createSubProject(newProject.id, {
          title: "Main Document",
          sub_project_type: "document",
          latex_code: latexContent
        });
      } catch (spError) {
        console.error("Failed to create initial sub-project:", spError);
        // We don't block the flow if sub-project creation fails, but we should probably warn
        toast.error("Project created, but failed to initialize main document.");
      }

      toast.success("Project created successfully!");
      onClose();
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl max-w-2xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f9f4eb]/30">
              <h2 className="text-xl font-semibold text-[#1f1e24]">Create New Project</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[#1f1e24] mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Thesis Final Draft"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FA5F55] focus:ring-4 focus:ring-[#FA5F55]/10 transition-all"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#1f1e24] mb-1">
                      Description <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your project..."
                      rows={2}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FA5F55] focus:ring-4 focus:ring-[#FA5F55]/10 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#1f1e24] mb-3">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Blank Option */}
                    <div
                      role="button"
                      onClick={() => setSelectedTemplateId("blank")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3",
                        selectedTemplateId === "blank"
                          ? "border-[#FA5F55] bg-[#FA5F55]/5"
                          : "border-gray-100 hover:border-[#FA5F55]/40 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedTemplateId === "blank" ? "bg-[#FA5F55]/10 text-[#FA5F55]" : "bg-gray-100 text-gray-500"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#1f1e24] text-sm">Blank Project</h4>
                          {selectedTemplateId === "blank" && <Check className="w-4 h-4 text-[#FA5F55]" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Start from scratch with a basic LaTeX structure.</p>
                      </div>
                    </div>

                    {/* Prebuilt Templates */}
                    {PREBUILT_PROJECTS.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <div
                          key={template.id}
                          role="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3",
                            isSelected
                              ? "border-[#FA5F55] bg-[#FA5F55]/5"
                              : "border-gray-100 hover:border-[#FA5F55]/40 hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            isSelected ? "bg-[#FA5F55]/10 text-[#FA5F55]" : "bg-gray-100 text-gray-500"
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-[#1f1e24] text-sm">{template.title}</h4>
                              {isSelected && <Check className="w-4 h-4 text-[#FA5F55]" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-project-form"
                disabled={isCreating || !title.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-[#FA5F55] hover:bg-[#FA5F55]/90 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
