"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export type KycProvider = "didit" | "facetec";

export type NumericSettingKey =
  | "client_invitation_ttl_hours"
  | "partner_invitation_ttl_hours"
  | "password_reset_ttl_hours"
  | "rescreening_interval_days";

export type ContractDiscountType = "percent" | "fixed";

export interface DefaultContractTemplate {
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  overageRate: string;
  paymentTermsDays: number;
  taxRate: string;
  currency: string;
  /** Which PROTEGEY bank account a brand-new contract pre-fills with — editable per partner
   * afterward on that partner's own contract (a locally-invoiced partner may pay into a
   * different, local PROTEGEY account than this global default). */
  bankPaymentMethod: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
  bankBeneficiaryName: string;
  bankBeneficiaryAddress: string;
  bankName: string;
  bankAddress: string;
}

export interface PlatformSettings {
  kycProvider: KycProvider;
  client_invitation_ttl_hours: number;
  partner_invitation_ttl_hours: number;
  password_reset_ttl_hours: number;
  rescreening_interval_days: number;
  defaultContractTemplate: DefaultContractTemplate;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  return apiFetch<PlatformSettings>("/settings");
}

export async function updateKycProvider(provider: KycProvider): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch("/settings/kyc-provider", { method: "PATCH", body: { provider } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export async function updateNumericSetting(key: NumericSettingKey, value: number): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/settings/${key}`, { method: "PATCH", body: { value } });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}

export async function updateDefaultContractTemplate(template: DefaultContractTemplate): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch("/settings/default-contract-template", { method: "PATCH", body: template });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
  return { success: true };
}
