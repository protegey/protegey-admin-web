"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export interface CreatePartnerState {
  error?: string;
  success?: boolean;
}

export async function createPartnerAction(
  _prevState: CreatePartnerState,
  formData: FormData,
): Promise<CreatePartnerState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const adminFirstName = String(formData.get("adminFirstName") ?? "").trim();
  const adminLastName = String(formData.get("adminLastName") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim();

  if (!name || !type || !adminFirstName || !adminLastName || !adminEmail) {
    return { error: "Please fill in the partner name, type, and the admin's name and email." };
  }

  try {
    await apiFetch("/partners", {
      method: "POST",
      body: {
        name,
        type,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        country: country || undefined,
        description: description || undefined,
        adminFirstName,
        adminLastName,
        adminEmail,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/partners");
  return { success: true };
}
