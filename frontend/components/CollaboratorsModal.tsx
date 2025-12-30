"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  Mail, 
  Loader2, 
  Check, 
  Clock, 
  Trash2,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getProjectCollaborators, 
  inviteCollaborator, 
  removeCollaborator,
  type Collaborator 
} from "@/lib/api/collaboration";

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  isOwner: boolean;
}

export default function CollaboratorsModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  isOwner,
}: CollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, projectId]);

  const loadCollaborators = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectCollaborators(projectId);
      setCollaborators(data);
    } catch (error) {
      console.error("Failed to load collaborators:", error);
      toast.error("Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsInviting(true);
      const newCollab = await inviteCollaborator(projectId, email.trim());
      setCollaborators((prev) => [...prev, newCollab]);
      setEmail("");
      toast.success(`Invitation sent to ${email}`);
    } catch (error: any) {
      console.error("Failed to invite:", error);
      const message = error.response?.data?.detail || "Failed to send invitation";
      toast.error(message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      setRemovingId(collaboratorId);
      await removeCollaborator(projectId, collaboratorId);
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      toast.success("Collaborator removed");
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      toast.error("Failed to remove collaborator");
    } finally {
      setRemovingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>;
      case "pending":
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#FA5F55]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Collaborators</h3>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">{projectTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Invite Form */}
          {isOwner && (
            <form onSubmit={handleInvite} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to invite..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA5F55]/20 focus:border-[#FA5F55] text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isInviting || !email.trim()}
                  className="bg-[#FA5F55] hover:bg-[#FA5F55]/90 shrink-0"
                >
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No collaborators yet</p>
                {isOwner && (
                  <p className="text-gray-400 text-xs mt-1">
                    Invite someone using their email above
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {(collab.full_name || collab.username || collab.invited_email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {collab.full_name || collab.username || collab.invited_email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{collab.invited_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(collab.status)}
                      {isOwner && (
                        <button
                          onClick={() => handleRemove(collab.id)}
                          disabled={removingId === collab.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          {removingId === collab.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
