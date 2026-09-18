"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

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

export interface AssignableRole {
  id: string;
  name: string;
  displayName: string;
}

export async function getPartnerTeam(partnerId: string): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>(`/partners/${partnerId}/team`);
}

export async function getPartnerPendingInvitations(partnerId: string): Promise<PendingInvitation[]> {
  return apiFetch<PendingInvitation[]>(`/partners/${partnerId}/team/invitations`);
}

export async function getAssignablePartnerRoles(): Promise<AssignableRole[]> {
  return apiFetch<AssignableRole[]>("/roles?scope=partner");
}

export async function resendPartnerInvitation(partnerId: string, invitationId: string): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/invitations/${invitationId}/resend`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export interface UpdateInvitationState {
  error?: string;
  success?: boolean;
}

/** Bound with (partnerId, invitationId) so it fits useActionState's (prevState, formData) shape. */
export async function updatePartnerInvitationAction(
  partnerId: string,
  invitationId: string,
  _prevState: UpdateInvitationState,
  formData: FormData,
): Promise<UpdateInvitationState> {
  const lang = await getLang();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleIds = formData.getAll("roleIds").map(String);

  if (!firstName || !lastName || !email) {
    return { error: t(lang, "allFieldsRequiredError") };
  }
  if (roleIds.length === 0) {
    return { error: t(lang, "partnersTeamSelectRoleError") };
  }

  try {
    await apiFetch(`/partners/${partnerId}/team/invitations/${invitationId}`, {
      method: "PATCH",
      body: { firstName, lastName, email, roleIds },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export async function setPartnerAgentStatus(
  partnerId: string,
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/team/${userId}/status`, { method: "PATCH", body: { isActive } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}
