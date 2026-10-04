"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LangProvider";
import { CurrencySelect } from "@/components/CurrencySelect";
import type { StringKey } from "@/lib/i18n/strings";
import {
  upsertPartnerContract,
  getPartnerContract,
  getPartnerBillingHistory,
  getPartnerContractUsage,
  type ContractDiscountType,
  type ContractBonusRecurrence,
  type PartnerContract,
  type BillingAuditEvent,
  type ContractCycleUsage,
  type DefaultContractTemplate,
} from "./contract-actions";

const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const BILLING_FIELD_LABEL_KEY: Record<string, StringKey> = {
  standardMonthlyFee: "billingFieldStandardMonthlyFee",
  discountType: "billingFieldDiscountType",
  discountValue: "billingFieldDiscountValue",
  includedTransactions: "billingFieldIncludedTransactions",
  bonusTransactions: "billingFieldBonusTransactions",
  bonusRecurrence: "billingFieldBonusRecurrence",
  overageRate: "billingFieldOverageRate",
  paymentTermsDays: "billingFieldPaymentTermsDays",
  taxRate: "billingFieldTaxRate",
  currency: "billingFieldCurrency",
  bankPaymentMethod: "invoicePaymentFieldMethod",
  bankRoutingNumber: "invoicePaymentFieldRoutingNumber",
  bankAccountNumber: "invoicePaymentFieldAccountNumber",
  bankAccountType: "invoicePaymentFieldAccountType",
  bankBeneficiaryName: "invoicePaymentFieldBeneficiaryName",
  bankBeneficiaryAddress: "invoicePaymentFieldBeneficiaryAddress",
  bankName: "invoicePaymentFieldBankName",
  bankAddress: "invoicePaymentFieldBankAddress",
};

interface FormState {
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  bonusTransactions: string;
  bonusRecurrence: ContractBonusRecurrence;
  overageRate: string;
  paymentTermsDays: string;
  taxRate: string;
  currency: string;
  bankPaymentMethod: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankAccountType: string;
  bankBeneficiaryName: string;
  bankBeneficiaryAddress: string;
  bankName: string;
  bankAddress: string;
}

/** A partner's own saved contract always takes priority; the platform-wide default template
 * (admin-editable on the Settings page) only fills the form when this partner has no contract
 * of their own yet. Bonus fields have no platform-wide default — a gift is always a deliberate,
 * per-partner decision, never something a fresh contract inherits automatically. */
function toFormState(contract: PartnerContract | null, defaultTemplate: DefaultContractTemplate): FormState {
  const source = contract ?? defaultTemplate;
  return {
    standardMonthlyFee: source.standardMonthlyFee,
    discountType: source.discountType,
    discountValue: source.discountValue,
    includedTransactions: source.includedTransactions,
    bonusTransactions: contract?.bonusTransactions ?? "0",
    bonusRecurrence: contract?.bonusRecurrence ?? "none",
    overageRate: source.overageRate,
    paymentTermsDays: String(source.paymentTermsDays),
    taxRate: source.taxRate,
    currency: source.currency,
    bankPaymentMethod: source.bankPaymentMethod,
    bankRoutingNumber: source.bankRoutingNumber,
    bankAccountNumber: source.bankAccountNumber,
    bankAccountType: source.bankAccountType,
    bankBeneficiaryName: source.bankBeneficiaryName,
    bankBeneficiaryAddress: source.bankBeneficiaryAddress,
    bankName: source.bankName,
    bankAddress: source.bankAddress,
  };
}

export function PartnerContractSection({
  partnerId,
  initialContract,
  initialHistory,
  initialUsage,
  defaultTemplate,
}: {
  partnerId: string;
  initialContract: PartnerContract | null;
  initialHistory: BillingAuditEvent[];
  initialUsage: ContractCycleUsage | null;
  defaultTemplate: DefaultContractTemplate;
}) {
  const { t, lang } = useLang();
  const [form, setForm] = useState<FormState>(toFormState(initialContract, defaultTemplate));
  const [contract, setContract] = useState(initialContract);
  const [history, setHistory] = useState(initialHistory);
  const [usage, setUsage] = useState(initialUsage);
  const [hasContract, setHasContract] = useState(initialContract !== null);
  const [pending, setPending] = useState(false);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await upsertPartnerContract(partnerId, {
      standardMonthlyFee: form.standardMonthlyFee,
      discountType: form.discountType,
      discountValue: form.discountValue,
      includedTransactions: form.includedTransactions,
      bonusTransactions: form.bonusTransactions,
      bonusRecurrence: form.bonusRecurrence,
      overageRate: form.overageRate,
      paymentTermsDays: Number(form.paymentTermsDays),
      taxRate: form.taxRate,
      currency: form.currency,
      bankPaymentMethod: form.bankPaymentMethod,
      bankRoutingNumber: form.bankRoutingNumber,
      bankAccountNumber: form.bankAccountNumber,
      bankAccountType: form.bankAccountType,
      bankBeneficiaryName: form.bankBeneficiaryName,
      bankBeneficiaryAddress: form.bankBeneficiaryAddress,
      bankName: form.bankName,
      bankAddress: form.bankAddress,
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("billingContractSavedToast"));
    setHasContract(true);
    // Refresh the change history, usage, and the saved contract itself (for bonusTransactionsRemaining)
    // inline so an admin sees the new values without a full reload.
    const [nextHistory, nextUsage, nextContract] = await Promise.all([
      getPartnerBillingHistory(partnerId),
      getPartnerContractUsage(partnerId),
      getPartnerContract(partnerId),
    ]);
    setHistory(nextHistory);
    setUsage(nextUsage);
    setContract(nextContract);
  }

  function describeHistoryEntry(event: BillingAuditEvent): string {
    const actor = event.actorLabel ?? "—";
    if (event.type === "billing.contract_created") {
      return `${actor} ${t("billingHistoryCreatedEntry")}`;
    }
    const field = event.metadata?.field ? String(event.metadata.field) : "";
    const fieldLabel = BILLING_FIELD_LABEL_KEY[field] ? t(BILLING_FIELD_LABEL_KEY[field]) : field;
    return `${actor}${t("billingHistoryUpdatedEntryBefore")}${fieldLabel}${t("billingHistoryUpdatedEntryMiddle")}${String(
      event.metadata?.from ?? "",
    )}${t("billingHistoryUpdatedEntryAfter")}${String(event.metadata?.to ?? "")}`;
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">{t("billingContractTitle")}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t("billingContractHint")}</p>

      {!hasContract ? <p className="mt-3 text-xs font-medium text-muted-foreground">{t("billingContractEmptyState")}</p> : null}

      <div className="mt-4 rounded-md border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">{t("billingUsageTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("billingUsageHint")}</p>

        {usage ? (
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("billingUsageIncludedLabel")}</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {Number(usage.includedTransactions).toLocaleString(locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("billingUsageConsumedLabel")}</p>
                <p className="text-lg font-semibold tabular-nums text-foreground">{usage.consumedTransactions.toLocaleString(locale)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("billingUsageOverageLabel")}</p>
                <p className={`text-lg font-semibold tabular-nums ${usage.overageTransactions > 0 ? "text-destructive" : "text-foreground"}`}>
                  {usage.overageTransactions.toLocaleString(locale)}
                </p>
              </div>
            </div>
            {usage.bonusRecurrence !== "none" ? (
              <div className="grid grid-cols-2 gap-4 rounded-md border border-primary/20 bg-primary/5 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {usage.bonusRecurrence === "monthly" ? t("billingUsageBonusAppliedMonthlyLabel") : t("billingUsageBonusAppliedOnceLabel")}
                  </p>
                  <p className="text-lg font-semibold tabular-nums text-primary">{usage.bonusApplied.toLocaleString(locale)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("billingUsageEffectiveOverageLabel")}</p>
                  <p
                    className={`text-lg font-semibold tabular-nums ${usage.effectiveOverageTransactions > 0 ? "text-destructive" : "text-foreground"}`}
                  >
                    {usage.effectiveOverageTransactions.toLocaleString(locale)}
                  </p>
                </div>
                {usage.bonusRecurrence === "once" && contract ? (
                  <p className="col-span-2 text-[11px] text-muted-foreground">
                    {t("billingUsageBonusRemainingBefore")}
                    {Number(contract.bonusTransactionsRemaining ?? "0").toLocaleString(locale)}
                    {t("billingUsageBonusRemainingAfter")}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${usage.percentUsed >= 100 ? "bg-destructive" : usage.percentUsed >= 80 ? "bg-amber-500" : "bg-primary"}`}
                style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {usage.percentUsed}% · {t("billingUsageCyclePeriodBefore")}
              {new Date(usage.cycleStart).toLocaleDateString(locale)}
              {t("billingUsageCyclePeriodJoiner")}
              {new Date(usage.cycleEnd).toLocaleDateString(locale)}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">{t("billingUsageEmptyState")}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldStandardMonthlyFee")}</span>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min="0"
            required
            value={form.standardMonthlyFee}
            onChange={(e) => update("standardMonthlyFee", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldDiscountType")}</span>
          <select className={inputClass} value={form.discountType} onChange={(e) => update("discountType", e.target.value as ContractDiscountType)}>
            <option value="percent">{t("billingDiscountTypePercent")}</option>
            <option value="fixed">{t("billingDiscountTypeFixed")}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldDiscountValue")}</span>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min="0"
            value={form.discountValue}
            onChange={(e) => update("discountValue", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldIncludedTransactions")}</span>
          <input
            className={inputClass}
            type="number"
            step="1"
            min="0"
            required
            value={form.includedTransactions}
            onChange={(e) => update("includedTransactions", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldBonusRecurrence")}</span>
          <select
            className={inputClass}
            value={form.bonusRecurrence}
            onChange={(e) => update("bonusRecurrence", e.target.value as ContractBonusRecurrence)}
          >
            <option value="none">{t("billingBonusRecurrenceNone")}</option>
            <option value="once">{t("billingBonusRecurrenceOnce")}</option>
            <option value="monthly">{t("billingBonusRecurrenceMonthly")}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {form.bonusRecurrence === "monthly" ? t("billingFieldBonusTransactionsMonthly") : t("billingFieldBonusTransactions")}
          </span>
          <input
            className={inputClass}
            type="number"
            step="1"
            min="0"
            disabled={form.bonusRecurrence === "none"}
            value={form.bonusTransactions}
            onChange={(e) => update("bonusTransactions", e.target.value)}
          />
          {form.bonusRecurrence === "once" ? <p className="mt-0.5 text-[11px] text-muted-foreground">{t("billingBonusOnceHint")}</p> : null}
          {form.bonusRecurrence === "monthly" ? <p className="mt-0.5 text-[11px] text-muted-foreground">{t("billingBonusMonthlyHint")}</p> : null}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldOverageRate")}</span>
          <input
            className={inputClass}
            type="number"
            step="0.000001"
            min="0"
            required
            value={form.overageRate}
            onChange={(e) => update("overageRate", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldPaymentTermsDays")}</span>
          <input
            className={inputClass}
            type="number"
            step="1"
            min="1"
            required
            value={form.paymentTermsDays}
            onChange={(e) => update("paymentTermsDays", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldTaxRate")}</span>
          <input className={inputClass} type="number" step="0.01" min="0" value={form.taxRate} onChange={(e) => update("taxRate", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("billingFieldCurrency")}</span>
          <CurrencySelect className={inputClass} value={form.currency} onChange={(code) => update("currency", code)} />
        </label>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="mb-1 mt-2 text-xs font-semibold text-foreground">{t("settingsDefaultContractBankSectionTitle")}</p>
          <p className="mb-3 text-xs text-muted-foreground">{t("billingContractBankSectionHint")}</p>
        </div>

        <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldMethod")}</span>
          <input className={inputClass} required value={form.bankPaymentMethod} onChange={(e) => update("bankPaymentMethod", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldRoutingNumber")}</span>
          <input className={inputClass} required value={form.bankRoutingNumber} onChange={(e) => update("bankRoutingNumber", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldAccountNumber")}</span>
          <input className={inputClass} required value={form.bankAccountNumber} onChange={(e) => update("bankAccountNumber", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldAccountType")}</span>
          <input className={inputClass} required value={form.bankAccountType} onChange={(e) => update("bankAccountType", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBeneficiaryName")}</span>
          <input className={inputClass} required value={form.bankBeneficiaryName} onChange={(e) => update("bankBeneficiaryName", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBeneficiaryAddress")}</span>
          <input
            className={inputClass}
            required
            value={form.bankBeneficiaryAddress}
            onChange={(e) => update("bankBeneficiaryAddress", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBankName")}</span>
          <input className={inputClass} required value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBankAddress")}</span>
          <input className={inputClass} required value={form.bankAddress} onChange={(e) => update("bankAddress", e.target.value)} />
        </label>

        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? t("billingContractSavingEllipsis") : hasContract ? t("billingContractSaveButton") : t("billingContractCreateButton")}
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("billingHistoryTitle")}</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("billingHistoryEmptyState")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {history.map((event) => (
              <li key={event.id} className="text-xs text-muted-foreground">
                <span className="text-foreground">{describeHistoryEntry(event)}</span>{" "}
                <span>· {new Date(event.createdAt).toLocaleString(locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
