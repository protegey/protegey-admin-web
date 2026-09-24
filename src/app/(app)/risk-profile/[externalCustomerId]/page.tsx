import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { getRiskProfile } from "../actions";
import type { RiskProfile, RiskProfileHistoryEntry } from "../types";

export const metadata: Metadata = { title: "Risk Profile — Protegey Admin" };

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

const DIRECTION_ICON = {
  increased: TrendingUp,
  decreased: TrendingDown,
  unchanged: Minus,
} as const;

const DIRECTION_LABEL_KEY = {
  increased: "riskProfileDirectionIncreased",
  decreased: "riskProfileDirectionDecreased",
  unchanged: "riskProfileDirectionUnchanged",
} as const;

const DIRECTION_STYLE = {
  increased: "text-destructive",
  decreased: "text-primary",
  unchanged: "text-muted-foreground",
} as const;

export default async function RiskProfileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ externalCustomerId: string }>;
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const { externalCustomerId } = await params;
  const { partnerId } = await searchParams;
  const lang = await getLang();

  let profile: RiskProfile | null = null;
  let error: ApiError | null = null;
  if (partnerId) {
    try {
      profile = await getRiskProfile(partnerId, externalCustomerId);
    } catch (err) {
      if (err instanceof ApiError) {
        error = err;
      } else {
        throw err;
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/risk-profile" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {t(lang, "riskProfileBackToList")}
      </Link>

      {!partnerId ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t(lang, "riskProfileSelectPartnerPrompt")}
        </p>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error.status === 403 ? t(lang, "riskProfileAccessError") : error.status === 404 ? t(lang, "riskProfileNotFound") : error.message}
        </div>
      ) : (
        <RiskProfileDetail profile={profile!} externalCustomerId={externalCustomerId} lang={lang} />
      )}
    </div>
  );
}

function RiskProfileDetail({
  profile,
  externalCustomerId,
  lang,
}: {
  profile: RiskProfile;
  externalCustomerId: string;
  lang: Awaited<ReturnType<typeof getLang>>;
}) {
  const categoryLabels = new Map(profile.breakdown.map((bucket) => [bucket.category, bucket.label]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(lang, "riskProfileDetailSubtitle")}</p>
        <h1 className="font-mono text-2xl font-bold">{externalCustomerId}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ScoreCard label={t(lang, "riskProfileCumulativeScoreLabel")} value={profile.cumulativeScore} />
        <ScoreCard label={t(lang, "riskProfileDecayedScoreLabel")} value={profile.decayedScore} hint={t(lang, "riskProfileDecayedScoreHint")} />
        <ScoreCard
          label={t(lang, "riskProfileWeightedScoreLabel")}
          value={profile.weightedScore}
          hint={t(lang, "riskProfileWeightedScoreHint")}
          riskBadge={
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RISK_LEVEL_STYLES[profile.riskLevel]}`}>
              {t(lang, RISK_LEVEL_LABEL_KEYS[profile.riskLevel])}
            </span>
          }
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">{t(lang, "riskProfileBreakdownTitle")}</h2>
        {profile.breakdown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t(lang, "riskProfileBreakdownEmpty")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{t(lang, "riskProfileBreakdownTitle")}</th>
                  <th className="px-4 py-3 font-medium">{t(lang, "riskProfileWeightLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t(lang, "riskProfilePointsLabel")}</th>
                  <th className="px-4 py-3 font-medium">{t(lang, "riskProfileCountLabel")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profile.breakdown.map((bucket) => (
                  <tr key={bucket.category} className={bucket.category === profile.topCategory ? "bg-primary/5" : undefined}>
                    <td className="px-4 py-3 font-medium">{bucket.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{Math.round(bucket.weight * 100)}%</td>
                    <td className="px-4 py-3">{bucket.points}</td>
                    <td className="px-4 py-3 text-muted-foreground">{bucket.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold">{t(lang, "riskProfileHistoryTitle")}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{t(lang, "riskProfileHistorySubtitle")}</p>
        {profile.history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t(lang, "riskProfileHistoryEmpty")}
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {profile.history.map((entry, i) => (
              <HistoryRow key={`${entry.at}-${i}`} entry={entry} lang={lang} categoryLabels={categoryLabels} />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, hint, riskBadge }: { label: string; value: number; hint?: string; riskBadge?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-2xl font-bold">{value}</p>
        {riskBadge}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function HistoryRow({
  entry,
  lang,
  categoryLabels,
}: {
  entry: RiskProfileHistoryEntry;
  lang: Awaited<ReturnType<typeof getLang>>;
  categoryLabels: Map<string, string>;
}) {
  const Icon = DIRECTION_ICON[entry.direction];
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card px-4 py-3 text-sm">
      <span className="font-mono font-semibold">
        {entry.scoreBefore} → {entry.scoreAfter}
      </span>
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${DIRECTION_STYLE[entry.direction]}`}>
        <Icon className="size-3.5" />
        {t(lang, DIRECTION_LABEL_KEY[entry.direction])}
      </span>
      <span className="text-muted-foreground">—</span>
      <span className="flex-1 min-w-40">{entry.reason}</span>
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {categoryLabels.get(entry.category) ?? entry.category}
      </span>
      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatRelativeTime(entry.at, lang)}</span>
    </li>
  );
}

function formatRelativeTime(iso: string, lang: Awaited<ReturnType<typeof getLang>>): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (lang === "fr") {
    if (diffSeconds < 60) return "à l'instant";
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 30) return `il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR");
  }
  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
