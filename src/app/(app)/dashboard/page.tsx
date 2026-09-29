import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, ShieldCheck, FileWarning, Ban } from "lucide-react";
import { getDashboardSummary } from "./actions";
import { getLang } from "@/lib/i18n/lang";
import { t, type StringKey } from "@/lib/i18n/strings";

export const metadata: Metadata = {
  title: "Dashboard — Protegey Admin",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  pending_verification: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  inactive: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL_KEYS: Record<string, StringKey> = {
  pending_verification: "partnersStatusPendingVerification",
  pending: "partnersStatusPending",
  active: "partnersStatusActive",
  suspended: "partnersStatusSuspended",
  inactive: "partnersStatusInactive",
  rejected: "partnersStatusRejected",
};

function formatEventType(type: string): string {
  const words = type.replace(/[._]/g, " ").split(" ");
  return words.map((word, index) => (index === 0 ? word[0].toUpperCase() + word.slice(1) : word)).join(" ");
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "text-destructive" : tone === "warning" ? "text-amber-500" : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className={`text-2xl font-semibold tabular-nums ${toneClass}`}>{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [summary, lang] = await Promise.all([getDashboardSummary(), getLang()]);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t(lang, "dashboardPageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t(lang, "dashboardPageSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t(lang, "dashboardTotalPartnersLabel")} value={summary.totalPartners} />
        <StatCard label={t(lang, "dashboardActiveLabel")} value={summary.partnersByStatus.active ?? 0} />
        <StatCard label={t(lang, "dashboardPendingKybLabel")} value={summary.pendingKybCount} tone={summary.pendingKybCount > 0 ? "warning" : "default"} />
        <StatCard label={t(lang, "dashboardSuspendedLabel")} value={summary.partnersByStatus.suspended ?? 0} tone={(summary.partnersByStatus.suspended ?? 0) > 0 ? "danger" : "default"} />
      </div>

      {summary.partnersWithoutContractCount > 0 ? (
        <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
          <Ban className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {summary.partnersWithoutContractCount} {t(lang, "dashboardNoContractLabel")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t(lang, "dashboardNoContractHint")}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Handshake className="size-4" />
              {t(lang, "dashboardRecentPartnersTitle")}
            </p>
            <Link href="/partners" className="text-xs font-medium text-primary hover:underline">
              {t(lang, "dashboardViewAllLink")}
            </Link>
          </div>
          <ul className="flex flex-col gap-2.5">
            {summary.recentPartners.map((partner) => (
              <li key={partner.id} className="flex items-center justify-between gap-3">
                <Link href={`/partners/${partner.id}`} className="truncate text-sm text-foreground hover:underline">
                  {partner.name}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[partner.status] ?? "bg-muted text-muted-foreground"}`}>
                    {STATUS_LABEL_KEYS[partner.status] ? t(lang, STATUS_LABEL_KEYS[partner.status]) : partner.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(partner.createdAt).toLocaleDateString(locale)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4" />
            {t(lang, "dashboardRecentActivityTitle")}
          </p>
          <ul className="flex flex-col gap-2.5">
            {summary.recentActivity.map((event) => (
              <li key={event.id} className="text-xs">
                <Link href={`/partners/${event.partnerId}`} className="font-medium text-foreground hover:underline">
                  {event.partnerName}
                </Link>{" "}
                <span className="text-muted-foreground">
                  · {formatEventType(event.type)} {event.actorLabel ? `— ${event.actorLabel}` : ""} · {new Date(event.createdAt).toLocaleString(locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {summary.pendingKybCount > 0 ? (
        <div className="flex items-center justify-between rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <FileWarning className="size-4 text-amber-500" />
            <p className="text-sm text-foreground">
              {summary.pendingKybCount} {t(lang, "dashboardPendingKybLabel")}
            </p>
          </div>
          <Link href="/partners/pending-kyb" className="text-xs font-medium text-primary hover:underline">
            {t(lang, "dashboardReviewLink")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
