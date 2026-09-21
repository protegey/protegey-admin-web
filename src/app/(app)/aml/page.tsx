import type { Metadata } from "next";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { RefreshButton } from "@/components/RefreshButton";
import { getAmlSummary } from "./actions";

export const metadata: Metadata = { title: "AML — Protegey Admin" };

const metrics = [
  ["openAlerts", "amlOpenAlerts"],
  ["confirmedAlerts", "amlConfirmedAlerts"],
  ["overdueAlerts", "amlOverdueAlerts"],
  ["escalatedAlerts", "amlEscalatedAlerts"],
  ["confirmedPep", "amlConfirmedPep"],
  ["pepReviews", "amlPepReviews"],
  ["eddOpen", "amlEddOpen"],
  ["sarDrafts", "amlSarDrafts"],
  ["sarSubmitted", "amlSarSubmitted"],
] as const;

export default async function AmlPage({ searchParams }: { searchParams: Promise<{ partnerId?: string }> }) {
  const [{ partnerId }, lang] = await Promise.all([searchParams, getLang()]);
  const summary = await getAmlSummary(partnerId);
  const partnerOptions = partnerId ? (await getAmlSummary()).partners : summary.partners;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "amlTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang, "amlSubtitle")}</p>
        </div>
        <RefreshButton />
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="partnerId">
          {t(lang, "amlPartnerFilter")}
          <select id="partnerId" name="partnerId" defaultValue={partnerId ?? ""} className="h-10 min-w-56 rounded-md border border-border bg-background px-3 font-normal">
            <option value="">{t(lang, "amlAllPartners")}</option>
            {partnerOptions.map((partner) => <option key={partner.partnerId} value={partner.partnerId}>{partner.partnerName}</option>)}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{t(lang, "amlApplyFilter")}</button>
      </form>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map(([key, label]) => <MetricCard key={key} label={t(lang, label)} value={summary[key]} />)}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="border-b border-border px-4 py-3 text-left text-base font-semibold">{t(lang, "amlPartnerBreakdown")}</caption>
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>{(["amlPartner", "amlOpenAlerts", "amlOverdueAlerts", "amlOpenEdd", "amlConfirmedPep", "amlSarDrafts"] as const).map((label) => <th key={label} className="px-4 py-3 font-medium">{t(lang, label)}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {summary.partners.map((partner) => <tr key={partner.partnerId}>
              <td className="px-4 py-3 font-medium">{partner.partnerName}</td>
              <td className="px-4 py-3">{partner.openAlerts.toLocaleString()}</td>
              <td className="px-4 py-3">{partner.overdueAlerts.toLocaleString()}</td>
              <td className="px-4 py-3">{partner.openEdd.toLocaleString()}</td>
              <td className="px-4 py-3">{partner.confirmedPep.toLocaleString()}</td>
              <td className="px-4 py-3">{partner.sarDrafts.toLocaleString()}</td>
            </tr>)}
            {summary.partners.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t(lang, "amlNoPartners")}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p></div>;
}
