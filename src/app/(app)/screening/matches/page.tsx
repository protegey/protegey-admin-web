import type { Metadata } from "next";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { getPartnerOptions } from "@/lib/partner-options";
import { RefreshButton } from "@/components/RefreshButton";
import { Pagination } from "@/components/Pagination";
import { getScreeningMatches } from "../actions";
import { ApiError } from "../errors";
import type { PaginatedScreeningMatchRecords, ScreeningMatchRecordStatus } from "../types";
import { MatchActions } from "./MatchActions";

export const metadata: Metadata = { title: "Screening Matches — Protegey Admin" };

const STATUSES: { value: ScreeningMatchRecordStatus | "all"; labelKey: Parameters<typeof t>[1] }[] = [
  { value: "all", labelKey: "screeningMatchesStatusAll" },
  { value: "possible_match", labelKey: "screeningMatchesStatusPossibleMatch" },
  { value: "confirmed", labelKey: "screeningMatchesStatusConfirmed" },
  { value: "false_positive", labelKey: "screeningMatchesStatusFalsePositive" },
  { value: "cleared", labelKey: "screeningMatchesStatusCleared" },
];

const STATUS_STYLES: Record<ScreeningMatchRecordStatus, string> = {
  possible_match: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  confirmed: "bg-destructive/10 text-destructive",
  false_positive: "bg-muted text-muted-foreground",
  cleared: "bg-primary/10 text-primary",
};

export default async function ScreeningMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; externalCustomerId?: string; status?: string; partnerId?: string }>;
}) {
  const { page: pageParam, externalCustomerId, status, partnerId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const statusFilter = STATUSES.some((s) => s.value === status) ? (status as ScreeningMatchRecordStatus | "all") : "all";
  const [lang, partners] = await Promise.all([getLang(), getPartnerOptions()]);

  let matches: PaginatedScreeningMatchRecords | null = null;
  let accessError: ApiError | null = null;
  if (partnerId) {
    try {
      matches = await getScreeningMatches(partnerId, page, 20, externalCustomerId, statusFilter === "all" ? undefined : statusFilter);
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
          <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "screeningMatchesPageTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(lang, "screeningMatchesSubtitle")}</p>
        </div>
        <RefreshButton />
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="partnerId">
          {t(lang, "screeningMatchesPartnerLabel")}
          <select id="partnerId" name="partnerId" defaultValue={partnerId ?? ""} className="h-10 min-w-56 rounded-md border border-border bg-background px-3 font-normal">
            <option value="">{t(lang, "screeningMatchesSelectPartnerOption")}</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="externalCustomerId">
          {t(lang, "screeningMatchesCustomerIdFilterLabel")}
          <input
            id="externalCustomerId"
            name="externalCustomerId"
            defaultValue={externalCustomerId ?? ""}
            className="h-10 min-w-56 rounded-md border border-border bg-background px-3 font-normal"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium" htmlFor="status">
          {t(lang, "screeningMatchesStatusFilterLabel")}
          <select id="status" name="status" defaultValue={statusFilter} className="h-10 min-w-44 rounded-md border border-border bg-background px-3 font-normal">
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {t(lang, s.labelKey)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          {t(lang, "screeningMatchesApplyFilter")}
        </button>
      </form>

      {!partnerId ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t(lang, "screeningMatchesSelectPartnerPrompt")}
        </p>
      ) : accessError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {accessError.status === 403 ? t(lang, "screeningMatchesAccessError") : accessError.message}
        </div>
      ) : (
        <MatchesTable page={matches!} lang={lang} externalCustomerId={externalCustomerId} status={statusFilter} partnerId={partnerId} />
      )}
    </section>
  );
}

function MatchesTable({
  page,
  lang,
  externalCustomerId,
  status,
  partnerId,
}: {
  page: PaginatedScreeningMatchRecords;
  lang: Awaited<ReturnType<typeof getLang>>;
  externalCustomerId?: string;
  status: ScreeningMatchRecordStatus | "all";
  partnerId: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            {[
              "screeningMatchesColCustomerId",
              "screeningMatchesColMatchedName",
              "screeningMatchesColScore",
              "screeningMatchesColSource",
              "screeningMatchesColPep",
              "screeningMatchesColStatus",
              "screeningMatchesColVerified",
              "screeningMatchesColActions",
            ].map((label) => (
              <th key={label} className="px-4 py-3 font-medium">
                {t(lang, label as Parameters<typeof t>[1])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {page.data.map((match) => (
            <tr key={match.id}>
              <td className="px-4 py-3 font-mono text-xs">{match.externalCustomerId}</td>
              <td className="px-4 py-3 font-medium">{match.matchedName}</td>
              <td className="px-4 py-3">{Math.round(match.matchScore * 100)}%</td>
              <td className="px-4 py-3 uppercase text-muted-foreground">{match.source}</td>
              <td className="px-4 py-3">
                {match.isPep ? (
                  <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                    {t(lang, "sanctionsPepBadge")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[match.status]}`}>
                  {t(lang, STATUSES.find((s) => s.value === match.status)!.labelKey)}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {match.verifiedAt ? new Date(match.verifiedAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3">
                <MatchActions id={match.id} status={match.status} partnerId={partnerId} />
              </td>
            </tr>
          ))}
          {page.data.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                {t(lang, "screeningMatchesEmpty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination
        page={page.page}
        totalPages={page.totalPages}
        total={page.total}
        pageSize={page.limit}
        itemLabel={t(lang, "screeningMatchesRecords")}
        linkTo={{
          pathname: "/screening/matches",
          params: { partnerId, externalCustomerId, status: status !== "all" ? status : undefined },
        }}
        className="border-t border-border px-4 py-3"
      />
    </div>
  );
}
