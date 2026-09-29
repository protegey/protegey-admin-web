"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export type ContractDiscountType = "percent" | "fixed";

export interface PartnerContract {
  id: string;
  partnerId: string;
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  overageRate: string;
  paymentTermsDays: number;
  taxRate: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertContractInput {
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  overageRate: string;
  paymentTermsDays: number;
  taxRate: string;
  currency: string;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function getPartnerContract(partnerId: string): Promise<PartnerContract | null> {
  return apiFetch<PartnerContract | null>(`/partners/${partnerId}/contract`);
}

export async function upsertPartnerContract(partnerId: string, input: UpsertContractInput): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/contract`, { method: "PUT", body: input });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export interface BillingAuditEvent {
  id: string;
  actorLabel: string | null;
  type: string;
  metadata: Record<string, string | number> | null;
  createdAt: string;
}

export async function getPartnerBillingHistory(partnerId: string): Promise<BillingAuditEvent[]> {
  const result = await apiFetch<{ data: BillingAuditEvent[] }>(`/partners/${partnerId}/audit-logs?typePrefix=billing.&limit=20`);
  return result.data;
}
