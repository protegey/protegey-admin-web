import type { Metadata } from "next";
import Link from "next/link";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { RefreshButton } from "@/components/RefreshButton";
import { Pagination } from "@/components/Pagination";
import { getAmlReviews, getAmlSummary, type AmlReviewPage } from "../actions";

export const metadata: Metadata = { title: "AML Reviews — Protegey Admin" };

type ReviewKind = "alerts" | "pep" | "edd";

const tabs: { key: ReviewKind; label: "amlReviewsAlerts" | "amlReviewsPep" | "amlReviewsEdd" }[] = [
  { key: "alerts", label: "amlReviewsAlerts" },
  { key: "pep", label: "amlReviewsPep" },
  { key: "edd", label: "amlReviewsEdd" },
];

export default async function AmlReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const activeTab = tabs.some((tab) => tab.key === params.tab) ? params.tab as ReviewKind : "alerts";
  const partnerId = params.partnerId;
  const status = params.status ?? "all";
  const pages = {
    alerts: Math.max(1, Number(params.alertsPage) || 1),
    pep: Math.max(1, Number(params.pepPage) || 1),
    edd: Math.max(1, Number(params.eddPage) || 1),
  };

  const [summary, alerts, pep, edd, lang] = await Promise.all([
    getAmlSummary(),
    getAmlReviews("alerts", pages.alerts, partnerId, status),
    getAmlReviews("pep", pages.pep, partnerId, status),
    getAmlReviews("edd", pages.edd, partnerId, status),
    getLang(),
  ]);
  const reviews = { alerts, pep, edd };
  const activeReviews = reviews[activeTab];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "amlReviewsTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang, "amlReviewsSubtitle")}</p>
        </div>
        <RefreshButton />
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <input type="hidden" name="tab" value={activeTab} />
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="partnerId">
          {t(lang, "amlPartnerFilter")}
          <select id="partnerId" name="partnerId" defaultValue={partnerId ?? ""} className="h-10 min-w-56 rounded-md border border-border bg-background px-3 font-normal">
            <option value="">{t(lang, "amlAllPartners")}</option>
            {summary.partners.map((partner) => <option key={partner.partnerId} value={partner.partnerId}>{partner.partnerName}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="status">
          {t(lang, "amlStatusFilter")}
          <select id="status" name="status" defaultValue={status} className="h-10 min-w-44 rounded-md border border-border bg-background px-3 font-normal">
            <option value="all">{t(lang, "amlAllStatuses")}</option>
            <option value="open">{t(lang, "amlStatusOpen")}</option>
            <option value="pending">{t(lang, "amlStatusPending")}</option>
            <option value="confirmed">{t(lang, "amlStatusConfirmed")}</option>
            <option value="closed">{t(lang, "amlStatusClosed")}</option>
          </select>
        </label>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">{t(lang, "amlApplyFilter")}</button>
      </form>

      <nav className="flex gap-1 border-b border-border" aria-label={t(lang, "amlReviewTabsAria")}>
        {tabs.map((tab) => {
          const href = reviewHref(tab.key, partnerId, status);
          return <Link key={tab.key} href={href} className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t(lang, tab.label)} <span className="ml-1 text-xs">({reviews[tab.key].total.toLocaleString()})</span>
          </Link>;
        })}
      </nav>

      <ReviewTable page={activeReviews} kind={activeTab} lang={lang} partnerId={partnerId} status={status} />
    </section>
  );
}

function reviewHref(tab: ReviewKind, partnerId?: string, status?: string, page?: number) {
  const query = new URLSearchParams({ tab });
  if (partnerId) query.set("partnerId", partnerId);
  if (status && status !== "all") query.set("status", status);
  if (page && page > 1) query.set(`${tab}Page`, String(page));
  return `/aml/reviews?${query.toString()}`;
}

function ReviewTable({ page, kind, lang, partnerId, status }: { page: AmlReviewPage; kind: ReviewKind; lang: Parameters<typeof t>[0]; partnerId?: string; status: string }) {
  const title = kind === "alerts" ? "amlReviewsAlerts" : kind === "pep" ? "amlReviewsPep" : "amlReviewsEdd";
  return <div className="overflow-x-auto rounded-lg border border-border bg-card">
    <table className="w-full min-w-[760px] text-left text-sm">
      <caption className="border-b border-border px-4 py-3 text-left text-base font-semibold">{t(lang, title)}</caption>
      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground"><tr>
        {["amlReviewId", "amlPartner", "amlReviewCategory", "amlReviewStatus", "amlReviewRisk", "amlReviewCreated", "amlReviewDue"].map((label) => <th key={label} className="px-4 py-3 font-medium">{t(lang, label as Parameters<typeof t>[1])}</th>)}
      </tr></thead>
      <tbody className="divide-y divide-border">
        {page.data.map((row) => <tr key={row.id}>
          <td className="px-4 py-3 font-mono text-xs">{row.id}</td><td className="px-4 py-3">{row.partnerName}</td><td className="px-4 py-3">{row.category}</td><td className="px-4 py-3">{row.status}</td><td className="px-4 py-3">{row.riskLevel ?? "—"}</td><td className="px-4 py-3">{formatDate(row.createdAt)}</td><td className="px-4 py-3">{formatDate(row.dueAt)}</td>
        </tr>)}
        {page.data.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t(lang, "amlReviewsEmpty")}</td></tr>}
      </tbody>
    </table>
    <Pagination
      page={page.page}
      totalPages={page.totalPages}
      total={page.total}
      pageSize={page.limit}
      itemLabel={t(lang, "amlReviewsRecords")}
      linkTo={{
        pathname: "/aml/reviews",
        params: { tab: kind, partnerId, status: status !== "all" ? status : undefined },
        pageParam: `${kind}Page`,
      }}
      className="border-t border-border px-4 py-3"
    />
  </div>;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
