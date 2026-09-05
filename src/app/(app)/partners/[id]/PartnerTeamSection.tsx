"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import {
  getPartnerTeam,
  getPartnerPendingInvitations,
  resendPartnerInvitation,
  setPartnerAgentStatus,
  type TeamMember,
  type PendingInvitation,
} from "../team-actions";

export function PartnerTeamSection({
  partnerId,
  initialMembers,
  initialInvitations,
}: {
  partnerId: string;
  initialMembers: TeamMember[];
  initialInvitations: PendingInvitation[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<TeamMember | null>(null);
  const [statusPending, setStatusPending] = useState(false);

  async function reload() {
    const [nextMembers, nextInvitations] = await Promise.all([
      getPartnerTeam(partnerId),
      getPartnerPendingInvitations(partnerId),
    ]);
    setMembers(nextMembers);
    setInvitations(nextInvitations);
  }

  async function handleResend(invitationId: string) {
    setResendingId(invitationId);
    const result = await resendPartnerInvitation(partnerId, invitationId);
    setResendingId(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation resent.");
      reload();
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    setStatusPending(true);
    const result = await setPartnerAgentStatus(partnerId, statusTarget.id, !statusTarget.isActive);
    setStatusPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(statusTarget.isActive ? "Agent blocked." : "Agent unblocked.");
    setStatusTarget(null);
    reload();
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="mb-3 text-sm font-semibold text-foreground">Team</p>

      {invitations.length > 0 ? (
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Pending invitations</p>
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">
                  {invitation.firstName} {invitation.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {invitation.email} · {invitation.roles.map((role) => role.displayName).join(", ") || "—"}
                </p>
              </div>
              <button
                type="button"
                disabled={resendingId === invitation.id}
                onClick={() => handleResend(invitation.id)}
                className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {resendingId === invitation.id ? "Sending…" : "Resend"}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {member.firstName} {member.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email} · {member.roles.map((role) => role.displayName).join(", ") || "—"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  member.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}
              >
                {member.isActive ? "Active" : "Blocked"}
              </span>
              <button
                type="button"
                onClick={() => setStatusTarget(member)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  member.isActive
                    ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {member.isActive ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 ? <p className="text-sm text-muted-foreground">No agents yet.</p> : null}
      </div>

      <ConfirmActionDialog
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleToggleStatus}
        title={statusTarget?.isActive ? "Block this agent?" : "Unblock this agent?"}
        description={
          statusTarget?.isActive
            ? "They will no longer be able to sign in or do anything in the organization."
            : "They will regain access to the organization."
        }
        confirmLabel={statusTarget?.isActive ? "Block" : "Unblock"}
        pendingLabel={statusTarget?.isActive ? "Blocking…" : "Unblocking…"}
        pending={statusPending}
        variant={statusTarget?.isActive ? "destructive" : "primary"}
      />
    </div>
  );
}
