import type { Metadata } from "next";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { getPartnerOptions } from "@/lib/partner-options";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { RefreshButton } from "@/components/RefreshButton";
import { Pagination } from "@/components/Pagination";
import { getRiskProfiles } from "./actions";
import type { PaginatedRiskProfiles, RiskProfile } from "./types";

export const metadata: Metadata = { title: "Risk Profiles — Protegey Admin" };

const RISK_LEVEL_STYLES: Record<RiskProfile["riskLevel"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-600",
  high: "bg-orange-500/15 text-orange-600",
  critical: "bg-destructive/15 text-destructive",
};

const RISK_LEVEL_LABEL_KEYS: Record<RiskProfile["riskLevel"], Parameters<typeof t>[1]> = {
  low: "riskLevelLow",
  medium: "riskLevelMedium",
  high: "riskLevelHigh",
  critical: "riskLevelCritical",
};

export default async function RiskProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; externalCustomerId?: string; partnerId?: string }>;
}) {
  const { page: pageParam, externalCustomerId, partnerId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [lang, partners] = await Promise.all([getLang(), getPartnerOptions()]);

  let profiles: PaginatedRiskProfiles | null = null;
  let accessError: ApiError | null = null;
  if (partnerId) {
    try {
      profiles = await getRiskProfiles(partnerId, page, 20, externalCustomerId);
    } catch (err) {
      if (err instanceof ApiError) {
        accessError = err;
      } else {
        throw err;
      }
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "riskProfileListTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang, "riskProfileListSubtitle")}</p>
        </div>
        <RefreshButton />
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="partnerId">
          {t(lang, "riskProfilePartnerLabel")}
          <select id="partnerId" name="partnerId" defaultValue={partnerId ?? ""} className="h-10 min-w-56 rounded-md border border-border bg-background px-3 font-normal">
            <option value="">{t(lang, "riskProfileSelectPartnerOption")}</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="externalCustomerId">
          {t(lang, "riskProfileSearchLabel")}
          <input
            id="externalCustomerId"
            name="externalCustomerId"
            defaultValue={externalCustomerId ?? ""}
            placeholder={t(lang, "riskProfileSearchPlaceholder")}
            className="h-10 min-w-64 rounded-md border border-border bg-background px-3 font-normal"
          />
        </label>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          {t(lang, "searchLabel")}
        </button>
      </form>

      {!partnerId ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t(lang, "riskProfileSelectPartnerPrompt")}
        </p>
      ) : accessError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {accessError.status === 403 ? t(lang, "riskProfileAccessError") : accessError.message}
        </div>
      ) : (
        <RiskProfileTable profiles={profiles!} lang={lang} externalCustomerId={externalCustomerId} partnerId={partnerId} />
      )}
    </section>
  );
}

function RiskProfileTable({
  profiles,
  lang,
  externalCustomerId,
  partnerId,
}: {
  profiles: PaginatedRiskProfiles;
  lang: Awaited<ReturnType<typeof getLang>>;
  externalCustomerId?: string;
  partnerId: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            {[
              "riskProfileColCustomerId",
              "riskProfileColCumulative",
              "riskProfileColDecayed",
              "riskProfileColWeighted",
              "riskProfileColTopCategory",
              "riskProfileColUpdated",
              "",
            ].map((label, i) => (
              <th key={label || i} className="px-4 py-3 font-medium">
                {label ? t(lang, label as Parameters<typeof t>[1]) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {profiles.data.map((profile) => (
            <tr key={profile.id}>
              <td className="px-4 py-3 font-mono text-xs">{profile.externalCustomerId}</td>
              <td className="px-4 py-3">{profile.cumulativeScore}</td>
              <td className="px-4 py-3">{profile.decayedScore}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{profile.weightedScore}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RISK_LEVEL_STYLES[profile.riskLevel]}`}>
                    {t(lang, RISK_LEVEL_LABEL_KEYS[profile.riskLevel])}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                {profile.topCategory ? (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {profile.breakdown.find((b) => b.category === profile.topCategory)?.label ?? profile.topCategory}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(profile.updatedAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/risk-profile/${encodeURIComponent(profile.externalCustomerId)}?partnerId=${encodeURIComponent(partnerId)}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t(lang, "riskProfileOpenButton")}
                </Link>
              </td>
            </tr>
          ))}
          {profiles.data.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                {t(lang, "riskProfileEmpty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        page={profiles.page}
        totalPages={profiles.totalPages}
        total={profiles.total}
        pageSize={profiles.limit}
        itemLabel={t(lang, "riskProfileRecords")}
        linkTo={{ pathname: "/risk-profile", params: { partnerId, externalCustomerId } }}
        className="border-t border-border px-4 py-3"
      />
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
