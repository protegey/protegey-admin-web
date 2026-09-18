"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export interface CreateAdminState {
  error?: string;
  success?: boolean;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export interface PendingAdminInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: string;
  roles: { name: string; displayName: string }[];
}

export async function getPendingAdminInvitations(): Promise<PendingAdminInvitation[]> {
  return apiFetch<PendingAdminInvitation[]>("/admins/invitations");
}

export async function resendAdminInvitationAction(invitationId: string): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/admins/invitations/${invitationId}/resend`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  revalidatePath("/admins");
  return { success: true };
}

export async function sendAdminPasswordResetAction(userId: string): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/admins/${userId}/reset-password`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export interface UpdateInvitationState {
  error?: string;
  success?: boolean;
}

/** Bound with the invitation id (see submitDocumentAction-style patterns) so it fits useActionState's (prevState, formData) shape. */
export async function updateAdminInvitationAction(
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
    return { error: t(lang, "adminsSelectRoleError") };
  }

  try {
    await apiFetch(`/admins/invitations/${invitationId}`, {
      method: "PATCH",
      body: { firstName, lastName, email, roleIds },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  revalidatePath("/admins");
  return { success: true };
}

export async function createAdminAction(
  _prevState: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  const lang = await getLang();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleIds = formData.getAll("roleIds").map(String);

  if (!firstName || !lastName || !email) {
    return { error: t(lang, "allFieldsRequiredError") };
  }
  if (roleIds.length === 0) {
    return { error: t(lang, "adminsSelectRoleError") };
  }

  try {
    await apiFetch("/admins", { method: "POST", body: { firstName, lastName, email, roleIds } });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: t(lang, "somethingWentWrongRetryMessage") };
  }

  revalidatePath("/admins");
  return { success: true };
}
