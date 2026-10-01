"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export type ContractDiscountType = "percent" | "fixed";

/** Which PROTEGEY bank account this contract's partner pays into — a locally-invoiced partner may
 * need a different, local PROTEGEY account than the US Brex account most partners use. */
export interface ContractBankFields {
  bankPaymentMethod: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
  bankBeneficiaryName: string;
  bankBeneficiaryAddress: string;
  bankName: string;
  bankAddress: string;
}

export interface PartnerContract extends ContractBankFields {
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

export interface UpsertContractInput extends ContractBankFields {
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

export interface DefaultContractTemplate extends ContractBankFields {
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  overageRate: string;
  paymentTermsDays: number;
  taxRate: string;
  currency: string;
}

/** Pre-fills the form for a partner with no contract yet — an already-saved contract always
 * takes priority over this (see PartnerContractSection.toFormState). */
export async function getDefaultContractTemplate(): Promise<DefaultContractTemplate> {
  const settings = await apiFetch<{ defaultContractTemplate: DefaultContractTemplate }>("/settings");
  return settings.defaultContractTemplate;
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

export interface ContractCycleUsage {
  cycleStart: string;
  cycleEnd: string;
  includedTransactions: string;
  consumedTransactions: number;
  overageTransactions: number;
  percentUsed: number;
}

export async function getPartnerContractUsage(partnerId: string): Promise<ContractCycleUsage | null> {
  return apiFetch<ContractCycleUsage | null>(`/partners/${partnerId}/contract/usage`);
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
