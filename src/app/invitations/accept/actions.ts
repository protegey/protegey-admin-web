"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { setSessionCookies, type SessionUser } from "@/lib/session";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export interface AcceptInvitationState {
  error?: string;
}

interface AcceptInvitationResponse {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export async function acceptInvitationAction(
  _prevState: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const lang = await getLang();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: t(lang, "acceptInvitationMissingTokenError") };
  }
  if (password.length < 10) {
    return { error: t(lang, "passwordMinLengthError") };
  }
  if (password !== confirmPassword) {
    return { error: t(lang, "passwordMismatchError") };
  }

  let response: AcceptInvitationResponse;
  try {
    response = await apiFetch<AcceptInvitationResponse>("/auth/invitations/accept", {
      method: "POST",
      body: { token, password },
      unauthenticated: true,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: t(lang, "somethingWentWrongRetryMessage") };
  }

  await setSessionCookies(response.accessToken, response.refreshToken, response.user);
  redirect("/admins");
}
