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

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPartnerTeam(partnerId: string, page = 1): Promise<PaginatedResult<TeamMember>> {
  return apiFetch<PaginatedResult<TeamMember>>(`/partners/${partnerId}/team?page=${page}&limit=20`);
}

export async function getPartnerPendingInvitations(partnerId: string, page = 1): Promise<PaginatedResult<PendingInvitation>> {
  return apiFetch<PaginatedResult<PendingInvitation>>(`/partners/${partnerId}/team/invitations?page=${page}&limit=20`);
}

/** `GET /roles?scope=partner` only ever resolves to the CALLER's own partner — none, for an
 * admin session — so the admin panel uses this partner-id-scoped equivalent instead. */
export async function getAssignablePartnerRoles(partnerId: string): Promise<AssignableRole[]> {
  return apiFetch<AssignableRole[]>(`/partners/${partnerId}/team/roles`);
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
