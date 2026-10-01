"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LangProvider";
import { CurrencySelect } from "@/components/CurrencySelect";
import type { StringKey } from "@/lib/i18n/strings";
import {
  updateKycProvider,
  updateNumericSetting,
  updateDefaultContractTemplate,
  type KycProvider,
  type NumericSettingKey,
  type PlatformSettings,
  type ContractDiscountType,
  type DefaultContractTemplate,
} from "./actions";

const inputClass =
  "w-24 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const contractInputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

function DefaultContractTemplateForm({
  initialTemplate,
  onSave,
}: {
  initialTemplate: DefaultContractTemplate;
  onSave: (template: DefaultContractTemplate) => Promise<void>;
}) {
  const { t } = useLang();
  const [form, setForm] = useState(initialTemplate);
  const [pending, setPending] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initialTemplate);

  function update<K extends keyof DefaultContractTemplate>(key: K, value: DefaultContractTemplate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await onSave(form);
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("billingFieldStandardMonthlyFee")}</span>
        <input
          className={contractInputClass}
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
        <select
          className={contractInputClass}
          value={form.discountType}
          onChange={(e) => update("discountType", e.target.value as ContractDiscountType)}
        >
          <option value="percent">{t("billingDiscountTypePercent")}</option>
          <option value="fixed">{t("billingDiscountTypeFixed")}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("billingFieldDiscountValue")}</span>
        <input
          className={contractInputClass}
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
          className={contractInputClass}
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
          className={contractInputClass}
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
          className={contractInputClass}
          type="number"
          step="1"
          min="1"
          required
          value={form.paymentTermsDays}
          onChange={(e) => update("paymentTermsDays", Number(e.target.value))}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("billingFieldTaxRate")}</span>
        <input
          className={contractInputClass}
          type="number"
          step="0.01"
          min="0"
          value={form.taxRate}
          onChange={(e) => update("taxRate", e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("billingFieldCurrency")}</span>
        <CurrencySelect className={contractInputClass} value={form.currency} onChange={(code) => update("currency", code)} />
      </label>

      <div className="sm:col-span-2 lg:col-span-3">
        <p className="mb-1 mt-2 text-xs font-semibold text-foreground">{t("settingsDefaultContractBankSectionTitle")}</p>
        <p className="mb-3 text-xs text-muted-foreground">{t("settingsDefaultContractBankSectionHint")}</p>
      </div>

      <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldMethod")}</span>
        <input className={contractInputClass} required value={form.bankPaymentMethod} onChange={(e) => update("bankPaymentMethod", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldRoutingNumber")}</span>
        <input className={contractInputClass} required value={form.bankRoutingNumber} onChange={(e) => update("bankRoutingNumber", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldAccountNumber")}</span>
        <input className={contractInputClass} required value={form.bankAccountNumber} onChange={(e) => update("bankAccountNumber", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldAccountType")}</span>
        <input className={contractInputClass} required value={form.bankAccountType} onChange={(e) => update("bankAccountType", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBeneficiaryName")}</span>
        <input className={contractInputClass} required value={form.bankBeneficiaryName} onChange={(e) => update("bankBeneficiaryName", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBeneficiaryAddress")}</span>
        <input
          className={contractInputClass}
          required
          value={form.bankBeneficiaryAddress}
          onChange={(e) => update("bankBeneficiaryAddress", e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBankName")}</span>
        <input className={contractInputClass} required value={form.bankName} onChange={(e) => update("bankName", e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentFieldBankAddress")}</span>
        <input className={contractInputClass} required value={form.bankAddress} onChange={(e) => update("bankAddress", e.target.value)} />
      </label>

      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={!dirty || pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t("settingsDefaultContractSavingEllipsis") : t("settingsDefaultContractSaveButton")}
        </button>
      </div>
    </form>
  );
}

const NUMERIC_SETTINGS: { key: NumericSettingKey; labelKey: StringKey; unitKey: StringKey }[] = [
  { key: "client_invitation_ttl_hours", labelKey: "settingsClientInvitationTtlLabel", unitKey: "settingsHoursSuffix" },
  { key: "partner_invitation_ttl_hours", labelKey: "settingsPartnerInvitationTtlLabel", unitKey: "settingsHoursSuffix" },
  { key: "password_reset_ttl_hours", labelKey: "settingsPasswordResetTtlLabel", unitKey: "settingsHoursSuffix" },
  { key: "rescreening_interval_days", labelKey: "settingsRescreeningIntervalLabel", unitKey: "settingsDaysSuffix" },
];

function NumericSettingRow({
  labelKey,
  unitKey,
  value,
  onSave,
}: {
  labelKey: StringKey;
  unitKey: StringKey;
  value: number;
  onSave: (next: number) => Promise<void>;
}) {
  const { t } = useLang();
  const [draft, setDraft] = useState(String(value));
  const [pending, setPending] = useState(false);
  const dirty = Number(draft) !== value;

  async function handleSave() {
    const next = Number(draft);
    if (!Number.isFinite(next) || next < 1) return;
    setPending(true);
    await onSave(next);
    setPending(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <p className="text-sm text-foreground">{t(labelKey)}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-muted-foreground">{t(unitKey)}</span>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={handleSave}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t("settingsSavingEllipsis") : t("settingsSaveButton")}
        </button>
      </div>
    </div>
  );
}

export function SettingsClient({ initialSettings }: { initialSettings: PlatformSettings }) {
  const { t } = useLang();
  const [settings, setSettings] = useState(initialSettings);
  const [kycPending, setKycPending] = useState(false);

  async function handleKycProviderChange(next: KycProvider) {
    if (next === settings.kycProvider || kycPending) return;
    setKycPending(true);
    const result = await updateKycProvider(next);
    setKycPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSettings((prev) => ({ ...prev, kycProvider: next }));
      toast.success(t("settingsKycProviderUpdatedToast"));
    }
  }

  async function handleNumericSave(key: NumericSettingKey, next: number) {
    const result = await updateNumericSetting(key, next);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSettings((prev) => ({ ...prev, [key]: next }));
      toast.success(t("settingsNumericSettingUpdatedToast"));
    }
  }

  async function handleDefaultContractSave(template: DefaultContractTemplate) {
    const result = await updateDefaultContractTemplate(template);
    if (result.error) {
      toast.error(result.error);
    } else {
      setSettings((prev) => ({ ...prev, defaultContractTemplate: template }));
      toast.success(t("settingsDefaultContractSavedToast"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("settingsPageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("settingsPageSubtitle")}</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("settingsKycProviderTitle")}</p>
          <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{t("settingsKycProviderHint")}</p>
        </div>
        <div className="inline-flex shrink-0 rounded-md border border-border bg-muted p-1">
          <button
            type="button"
            disabled={kycPending}
            onClick={() => handleKycProviderChange("didit")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              settings.kycProvider === "didit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("settingsKycProviderDidit")}
          </button>
          <button
            type="button"
            disabled={kycPending}
            onClick={() => handleKycProviderChange("facetec")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              settings.kycProvider === "facetec" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("settingsKycProviderFacetec")}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">{t("settingsTimersTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("settingsTimersHint")}</p>
        <div className="mt-2 divide-y divide-border">
          {NUMERIC_SETTINGS.map(({ key, labelKey, unitKey }) => (
            <NumericSettingRow
              key={key}
              labelKey={labelKey}
              unitKey={unitKey}
              value={settings[key]}
              onSave={(next) => handleNumericSave(key, next)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground">{t("settingsDefaultContractTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("settingsDefaultContractHint")}</p>
        <DefaultContractTemplateForm initialTemplate={settings.defaultContractTemplate} onSave={handleDefaultContractSave} />
      </div>
    </div>
  );
}
