"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

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
  try {
    await apiFetch(`/admins/invitations/${invitationId}/resend`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong." };
  }
  revalidatePath("/admins");
  return { success: true };
}

export async function sendAdminPasswordResetAction(userId: string): Promise<ActionResult> {
  try {
    await apiFetch(`/admins/${userId}/reset-password`, { method: "POST" });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong." };
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
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleIds = formData.getAll("roleIds").map(String);

  if (!firstName || !lastName || !email) {
    return { error: "All fields are required." };
  }
  if (roleIds.length === 0) {
    return { error: "Select at least one role for this administrator." };
  }

  try {
    await apiFetch(`/admins/invitations/${invitationId}`, {
      method: "PATCH",
      body: { firstName, lastName, email, roleIds },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong." };
  }
  revalidatePath("/admins");
  return { success: true };
}

export async function createAdminAction(
  _prevState: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleIds = formData.getAll("roleIds").map(String);

  if (!firstName || !lastName || !email) {
    return { error: "All fields are required." };
  }
  if (roleIds.length === 0) {
    return { error: "Select at least one role for this administrator." };
  }

  try {
    await apiFetch("/admins", { method: "POST", body: { firstName, lastName, email, roleIds } });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admins");
  return { success: true };
}
