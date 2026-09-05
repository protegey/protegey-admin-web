"use server";

import { apiFetch, ApiError } from "@/lib/api";

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: { name: string; displayName: string }[];
}

export interface PendingInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: string;
  roles: { name: string; displayName: string }[];
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function getPartnerTeam(partnerId: string): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>(`/partners/${partnerId}/team`);
}

export async function getPartnerPendingInvitations(partnerId: string): Promise<PendingInvitation[]> {
  return apiFetch<PendingInvitation[]>(`/partners/${partnerId}/team/invitations`);
}

export async function resendPartnerInvitation(partnerId: string, invitationId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/partners/${partnerId}/invitations/${invitationId}/resend`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong." };
  }
  return { success: true };
}

export async function setPartnerAgentStatus(
  partnerId: string,
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await apiFetch(`/partners/${partnerId}/team/${userId}/status`, { method: "PATCH", body: { isActive } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong." };
  }
  return { success: true };
}
