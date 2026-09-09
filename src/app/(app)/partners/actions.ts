"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";

export interface PartnerFormState {
  error?: string;
  success?: boolean;
}

export async function createPartnerAction(
  _prevState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const country = String(formData.get("country") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const adminFirstName = String(formData.get("adminFirstName") ?? "").trim();
  const adminLastName = String(formData.get("adminLastName") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim();
  const adminPhone = String(formData.get("adminPhone") ?? "").trim();
  const adminRole = String(formData.get("adminRole") ?? "").trim();
  const adminRoleOther = String(formData.get("adminRoleOther") ?? "").trim();

  if (
    !name ||
    !type ||
    !country ||
    !description ||
    !adminFirstName ||
    !adminLastName ||
    !adminEmail ||
    !adminPhone ||
    !adminRole
  ) {
    return { error: "Please fill in every field." };
  }
  if (adminRole === "other" && !adminRoleOther) {
    return { error: "Please specify the primary contact's role." };
  }

  try {
    await apiFetch("/partners", {
      method: "POST",
      body: {
        name,
        type,
        country,
        description,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPhone,
        adminRole,
        adminRoleOther: adminRole === "other" ? adminRoleOther : undefined,
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

export async function deletePartnerAction(partnerId: string): Promise<PartnerFormState> {
  try {
    await apiFetch(`/partners/${partnerId}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/partners");
  return { success: true };
}

export async function updatePartnerAction(
  partnerId: string,
  _prevState: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const plan = String(formData.get("plan") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !type) {
    return { error: "Please fill in the partner name and type." };
  }

  try {
    await apiFetch(`/partners/${partnerId}`, {
      method: "PATCH",
      body: {
        name,
        type,
        plan: plan || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        country: country || undefined,
        description: description || undefined,
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
