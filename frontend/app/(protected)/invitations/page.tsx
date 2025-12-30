"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Check, 
  X, 
  Clock, 
  ArrowLeft, 
  Users,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getMyInvitations, 
  acceptInvitation, 
  rejectInvitation,
  type Invitation 
} from "@/lib/api/collaboration";

export default function InvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await getMyInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      await acceptInvitation(invitationId);
      toast.success("Invitation accepted! Project added to your dashboard.");
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      await rejectInvitation(invitationId);
      toast.success("Invitation rejected");
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Failed to reject invitation:", error);
      toast.error("Failed to reject invitation");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
            <Mail className="w-6 h-6 text-[#FA5F55]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
            <p className="text-gray-600 mt-1">
              Project collaboration invitations from other users
            </p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA5F55]"></div>
        </div>
      ) : invitations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No pending invitations</h3>
          <p className="text-gray-500 text-sm">
            When someone invites you to collaborate on a project, it will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation, index) => (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {invitation.project_title}
                    </h3>
                    {invitation.project_description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {invitation.project_description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <span>Invited by</span>
                      <span className="font-medium text-gray-700">
                        {invitation.invited_by_name}
                      </span>
                      <span className="text-gray-400">({invitation.invited_by_email})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="text-gray-600 hover:text-red-600 hover:border-red-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="bg-[#FA5F55] hover:bg-[#FA5F55]/90"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
