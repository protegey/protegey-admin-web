"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LangProvider";
import type { StringKey } from "@/lib/i18n/strings";
import {
  upsertPartnerContract,
  getPartnerBillingHistory,
  getPartnerContractUsage,
  type ContractDiscountType,
  type PartnerContract,
  type BillingAuditEvent,
  type ContractCycleUsage,
} from "./contract-actions";

const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const BILLING_FIELD_LABEL_KEY: Record<string, StringKey> = {
  standardMonthlyFee: "billingFieldStandardMonthlyFee",
  discountType: "billingFieldDiscountType",
  discountValue: "billingFieldDiscountValue",
  includedTransactions: "billingFieldIncludedTransactions",
  overageRate: "billingFieldOverageRate",
  paymentTermsDays: "billingFieldPaymentTermsDays",
  taxRate: "billingFieldTaxRate",
  currency: "billingFieldCurrency",
};

interface FormState {
  standardMonthlyFee: string;
  discountType: ContractDiscountType;
  discountValue: string;
  includedTransactions: string;
  overageRate: string;
  paymentTermsDays: string;
  taxRate: string;
  currency: string;
}

function toFormState(contract: PartnerContract | null): FormState {
  return {
    standardMonthlyFee: contract?.standardMonthlyFee ?? "",
    discountType: contract?.discountType ?? "percent",
    discountValue: contract?.discountValue ?? "0",
    includedTransactions: contract?.includedTransactions ?? "",
    overageRate: contract?.overageRate ?? "",
    paymentTermsDays: contract ? String(contract.paymentTermsDays) : "15",
    taxRate: contract?.taxRate ?? "0",
    currency: contract?.currency ?? "USD",
  };
}

export function PartnerContractSection({
  partnerId,
  initialContract,
  initialHistory,
  initialUsage,
}: {
  partnerId: string;
  initialContract: PartnerContract | null;
  initialHistory: BillingAuditEvent[];
  initialUsage: ContractCycleUsage | null;
}) {
  const { t, lang } = useLang();
  const [form, setForm] = useState<FormState>(toFormState(initialContract));
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
      overageRate: form.overageRate,
      paymentTermsDays: Number(form.paymentTermsDays),
      taxRate: form.taxRate,
      currency: form.currency,
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("billingContractSavedToast"));
    setHasContract(true);
    // Refresh the change history and usage inline so an admin sees the new entries without a full reload.
    const [nextHistory, nextUsage] = await Promise.all([getPartnerBillingHistory(partnerId), getPartnerContractUsage(partnerId)]);
    setHistory(nextHistory);
    setUsage(nextUsage);
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
          <input
            className={inputClass}
            maxLength={3}
            required
            value={form.currency}
            onChange={(e) => update("currency", e.target.value.toUpperCase())}
          />
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
