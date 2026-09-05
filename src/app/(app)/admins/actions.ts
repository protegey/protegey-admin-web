"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export interface CreateAdminState {
  error?: string;
  success?: boolean;
}

export async function createAdminAction(
  _prevState: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!firstName || !lastName || !email) {
    return { error: "All fields are required." };
  }

  try {
    await apiFetch("/admins", { method: "POST", body: { firstName, lastName, email } });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admins");
  return { success: true };
}
