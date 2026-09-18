"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { setSessionCookies, type SessionUser } from "@/lib/session";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export interface LoginState {
  error?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const lang = await getLang();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: t(lang, "loginMissingCredentialsError") };
  }

  let response: LoginResponse;
  try {
    response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      unauthenticated: true,
    });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return { error: t(lang, "loginIncorrectCredentialsError") };
    }
    return { error: t(lang, "somethingWentWrongRetryMessage") };
  }

  await setSessionCookies(response.accessToken, response.refreshToken, response.user);
  redirect("/admins");
}
