"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LangProvider";

/**
 * Plain, serializable description of a server-rendered pagination link — deliberately data, not a
 * function: this component is a Client Component, and a Server Component caller cannot pass it a
 * function prop (`hrefFor: (page) => string`) across the boundary — React's Flight serializer
 * rejects that at render time ("Functions cannot be passed directly to Client Components"). Every
 * `hrefFor` call site used to hit exactly that, silently on some routes and as a hard 500 on
 * others depending on where in the stream the error landed. `Pagination` builds the href itself
 * from this plain data instead.
 */
export interface PaginationLinkTo {
  /** Defaults to the current path (a bare `?query` string) when omitted. */
  pathname?: string;
  /** Every other query param to preserve, e.g. `{ partnerId, status }`. Falsy/empty values are dropped. */
  params?: Record<string, string | undefined>;
  /** Query param name the page number is written under. Defaults to `"page"`. */
  pageParam?: string;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Page size used to fetch this list — rendered as a small indicator (e.g. "20 / page"). */
  pageSize: number;
  /** Translated plural noun for what is being counted (e.g. "entries", "partners"). */
  itemLabel: string;
  /** Client-side navigation (pushes a new URL via the router). Mutually exclusive with `linkTo`. */
  onPageChange?: (page: number) => void;
  /** Server-rendered navigation — describes the href for a given page number. Mutually exclusive with `onPageChange`. */
  linkTo?: PaginationLinkTo;
  className?: string;
}

function buildHref(linkTo: PaginationLinkTo, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(linkTo.params ?? {})) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set(linkTo.pageParam ?? "page", String(page));
  const query = params.toString();
  const pathname = linkTo.pathname ?? "";
  return query ? `${pathname}?${query}` : pathname || "?";
}

const navButtonClass =
  "flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

/**
 * Single reusable pagination bar used across every paginated list in the app (Sanctions, AML
 * reviews, Partners, Admins). Renders a "Page X of Y — Z items · N / page" summary plus
 * previous/next controls, either as buttons (client-driven) or links (server-driven via `hrefFor`).
 */
export function Pagination({ page, totalPages, total, pageSize, itemLabel, onPageChange, linkTo, className }: PaginationProps) {
  const { t } = useLang();
  const safeTotalPages = Math.max(1, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= safeTotalPages;
  const prevTarget = Math.max(1, page - 1);
  const nextTarget = Math.min(safeTotalPages, page + 1);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground ${className ?? ""}`}>
      <p>
        {t("pageWord")} {page} {t("ofWord")} {safeTotalPages} — {total.toLocaleString()} {itemLabel}
        <span className="mx-1.5 text-border">·</span>
        {pageSize} {t("paginationPerPage")}
      </p>
      <div className="flex items-center gap-2">
        {linkTo ? (
          <Link href={buildHref(linkTo, prevTarget)} aria-disabled={prevDisabled} className={navButtonClass}>
            <ChevronLeft className="size-4" />
            {t("previousPageButton")}
          </Link>
        ) : (
          <button type="button" disabled={prevDisabled} onClick={() => onPageChange?.(prevTarget)} className={navButtonClass}>
            <ChevronLeft className="size-4" />
            {t("previousPageButton")}
          </button>
        )}
        {linkTo ? (
          <Link href={buildHref(linkTo, nextTarget)} aria-disabled={nextDisabled} className={navButtonClass}>
            {t("nextPageButton")}
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <button type="button" disabled={nextDisabled} onClick={() => onPageChange?.(nextTarget)} className={navButtonClass}>
            {t("nextPageButton")}
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
