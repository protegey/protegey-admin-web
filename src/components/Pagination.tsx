"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LangProvider";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Page size used to fetch this list — rendered as a small indicator (e.g. "20 / page"). */
  pageSize: number;
  /** Translated plural noun for what is being counted (e.g. "entries", "partners"). */
  itemLabel: string;
  /** Client-side navigation (pushes a new URL via the router). Mutually exclusive with `hrefFor`. */
  onPageChange?: (page: number) => void;
  /** Server-rendered navigation — returns the href for a given page number. Mutually exclusive with `onPageChange`. */
  hrefFor?: (page: number) => string;
  className?: string;
}

const navButtonClass =
  "flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

/**
 * Single reusable pagination bar used across every paginated list in the app (Sanctions, AML
 * reviews, Partners, Admins). Renders a "Page X of Y — Z items · N / page" summary plus
 * previous/next controls, either as buttons (client-driven) or links (server-driven via `hrefFor`).
 */
export function Pagination({ page, totalPages, total, pageSize, itemLabel, onPageChange, hrefFor, className }: PaginationProps) {
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
        {hrefFor ? (
          <Link href={hrefFor(prevTarget)} aria-disabled={prevDisabled} className={navButtonClass}>
            <ChevronLeft className="size-4" />
            {t("previousPageButton")}
          </Link>
        ) : (
          <button type="button" disabled={prevDisabled} onClick={() => onPageChange?.(prevTarget)} className={navButtonClass}>
            <ChevronLeft className="size-4" />
            {t("previousPageButton")}
          </button>
        )}
        {hrefFor ? (
          <Link href={hrefFor(nextTarget)} aria-disabled={nextDisabled} className={navButtonClass}>
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
