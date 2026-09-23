"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export interface PartnerDocument {
  id: string;
  partnerId: string;
  type: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  fileName: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewedBy: { firstName: string; lastName: string } | null;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function getPartnerDocuments(partnerId: string): Promise<PartnerDocument[]> {
  return apiFetch<PartnerDocument[]>(`/partners/${partnerId}/documents`);
}

export async function reviewDocument(
  partnerId: string,
  documentId: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/documents/${documentId}/review`, {
      method: "PATCH",
      body: { decision, reason },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  revalidatePath("/partners");
  return { success: true };
}

export async function decidePartner(
  partnerId: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/decision`, {
      method: "PATCH",
      body: { decision, reason },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  revalidatePath("/partners");
  return { success: true };
}

/** Switches the identity-verification provider used for this partner's KYC flow (Didit ⇄ FaceTec). */
export async function updatePartnerKycProvider(
  partnerId: string,
  kycProvider: "didit" | "facetec",
): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}`, {
      method: "PATCH",
      body: { kycProvider },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  revalidatePath(`/partners/${partnerId}`);
  return { success: true };
}
