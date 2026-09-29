"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LangProvider";
import type { StringKey } from "@/lib/i18n/strings";
import { updateKycProvider, updateNumericSetting, type KycProvider, type NumericSettingKey, type PlatformSettings } from "./actions";

const inputClass =
  "w-24 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

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
    </div>
  );
}
