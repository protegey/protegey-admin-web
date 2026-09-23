"use client";

import { useState } from "react";
import { Search, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useLang } from "@/lib/i18n/LangProvider";
import { screenName } from "./actions";
import { ApiError } from "./errors";
import type { ScreeningResult } from "./types";

const DECISION_STYLES: Record<string, string> = {
  blocked: "bg-destructive/10 text-destructive border-destructive/30",
  review: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
  clear: "bg-primary/10 text-primary border-primary/30",
};

const DECISION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  blocked: ShieldAlert,
  review: ShieldQuestion,
  clear: ShieldCheck,
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString();
}

export function ScreeningClient() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [searchedName, setSearchedName] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("screeningNameRequiredError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await screenName(name.trim(), type);
      setResult(res);
      setSearchedName(name.trim());
    } catch (err) {
      setResult(null);
      setError(`${t("screeningErrorPrefix")} ${err instanceof ApiError ? err.message : (err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  const DecisionIcon = result ? (DECISION_ICONS[result.decision] ?? ShieldQuestion) : null;
  const decisionLabelKey =
    result?.decision === "blocked"
      ? "screeningDecisionBlocked"
      : result?.decision === "review"
        ? "screeningDecisionReview"
        : "screeningDecisionClear";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">{t("screeningTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("screeningSubtitle")}</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex min-w-64 flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t("screeningNameLabel")}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("screeningNamePlaceholder")}
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t("sanctionsTypeLabel")}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{t("screeningTypeAny")}</option>
            <option value="person">{t("sanctionsTypePerson")}</option>
            <option value="business">{t("sanctionsTypeBusiness")}</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t("screeningSearchingEllipsis") : t("screeningSearchButton")}
        </button>
      </form>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
      )}

      {!result && !error ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("screeningEmptyState")}
        </p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-5">
          <div className={`flex flex-wrap items-center gap-4 rounded-lg border p-5 ${DECISION_STYLES[result.decision] ?? "border-border bg-card"}`}>
            {DecisionIcon ? <DecisionIcon className="size-8 shrink-0" /> : null}
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide opacity-80">{t("screeningDecisionLabel")}</p>
              <p className="text-lg font-bold">
                {t(decisionLabelKey)}
                {searchedName ? <span className="ml-2 text-sm font-normal opacity-80">— &ldquo;{searchedName}&rdquo;</span> : null}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide opacity-80">{t("screeningScoreLabel")}</p>
              <p className="text-lg font-bold">{Math.round(result.score * 100)}%</p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                result.pepMatch
                  ? "border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {result.pepMatch ? t("screeningPepMatchYes") : t("screeningPepMatchNo")}
            </span>
          </div>

          {result.degraded ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {t("screeningDegradedNotice")}
              {result.fallbackReason ? ` (${result.fallbackReason})` : ""}
            </p>
          ) : null}

          <div>
            <h2 className="mb-3 text-sm font-semibold">
              {t("screeningMatchesTitle")} ({result.matches.length})
            </h2>
            {result.matches.length === 0 ? (
              <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                {t("screeningNoMatches")}
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-medium">{t("sanctionsColName")}</th>
                        <th className="px-4 py-3 font-medium">{t("sanctionsColAliases")}</th>
                        <th className="px-4 py-3 font-medium">{t("sanctionsTypeLabel")}</th>
                        <th className="px-4 py-3 font-medium">{t("sanctionsSourceLabel")}</th>
                        <th className="px-4 py-3 font-medium">{t("sanctionsColNationality")}</th>
                        <th className="px-4 py-3 font-medium">{t("screeningMatchedOnLabel")}</th>
                        <th className="px-4 py-3 font-medium">{t("screeningScoreLabel")}</th>
                        <th className="px-4 py-3 font-medium">{t("sanctionsColPep")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.matches.map((m) => (
                        <tr key={m.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{m.name}</td>
                          <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                            {m.aliases?.length ? m.aliases.join(", ") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${m.type === "person" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`}
                            >
                              {m.type === "person" ? t("sanctionsTypePerson") : m.type === "business" ? t("sanctionsTypeBusiness") : m.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 uppercase text-muted-foreground">{m.source}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.nationality ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.matchedOn}</td>
                          <td className="px-4 py-3 text-muted-foreground">{Math.round(m.score * 100)}%</td>
                          <td className="px-4 py-3">
                            {m.isPep ? (
                              <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                                {t("sanctionsPepBadge")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {result.matches.filter((m) => formatDate(m.listingDate) !== "—" || m.notes).length > 0 ? (
            <div className="flex flex-col gap-2">
              {result.matches.map((m) =>
                m.notes || m.listingDate ? (
                  <p key={m.id} className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{m.name}</span>
                    {m.listingDate ? ` — ${t("sanctionsColListingDate")}: ${formatDate(m.listingDate)}` : ""}
                    {m.notes ? ` — ${m.notes}` : ""}
                  </p>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
