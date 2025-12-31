"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Check, 
  X, 
  Clock, 
  Users,
  FileText,
  Loader2
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
import Sidebar from '../dashboard/components/Sidebar';
import DashboardHeader from '../dashboard/components/DashboardHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';

export default function InvitationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const displayName = user?.full_name || user?.username || 'User';

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

        {/* Invitations Section */}
        <motion.div 
          className="bg-linear-to-br from-[#f9f4eb] via-white to-[#FA5F55]/10 rounded-xl shadow-sm border-2 border-[#1f1e24]/20 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#FA5F55]/10 rounded-lg">
                <Mail className="w-6 h-6 text-[#FA5F55]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#1f1e24]">Your Invitations</h2>
                <p className="text-sm text-[#1f1e24]/60 mt-1">
                  {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''} • Project collaboration invitations from other users
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FA5F55]" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#1f1e24]/20" />
              <h3 className="text-lg font-medium text-[#1f1e24] mb-2">No pending invitations</h3>
              <p className="text-[#1f1e24]/50">
                When someone invites you to collaborate on a project, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-[#1f1e24]/20 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#FA5F55]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="p-3 bg-[#FA5F55]/10 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-[#FA5F55]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1f1e24] truncate text-lg">
                          {invitation.project_title}
                        </h3>
                        {invitation.project_description && (
                          <p className="text-sm text-[#1f1e24]/60 mt-1 line-clamp-2">
                            {invitation.project_description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-sm text-[#1f1e24]/70">
                          <span>Invited by</span>
                          <span className="font-medium text-[#1f1e24]">
                            {invitation.invited_by_name}
                          </span>
                          <span className="text-[#1f1e24]/50">({invitation.invited_by_email})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-[#1f1e24]/40" />
                          <span className="text-xs text-[#1f1e24]/50">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        onClick={() => handleReject(invitation.id)}
                        disabled={processingId === invitation.id}
                        className="px-4 py-2 text-sm font-medium text-[#1f1e24] border-2 border-[#1f1e24]/20 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </motion.button>
                      <motion.button
                        onClick={() => handleAccept(invitation.id)}
                        disabled={processingId === invitation.id}
                        className="px-4 py-2 text-sm font-medium bg-[#FA5F55] text-white rounded-lg hover:bg-[#FA5F55]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
