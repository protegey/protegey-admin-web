"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n/LangProvider";
import { reviewScreeningMatch } from "../actions";
import { ApiError } from "../errors";
import type { ScreeningMatchRecordStatus } from "../types";

const REVIEWABLE: { status: ScreeningMatchRecordStatus; labelKey: "screeningMatchesConfirmButton" | "screeningMatchesFalsePositiveButton" | "screeningMatchesClearButton" }[] = [
  { status: "confirmed", labelKey: "screeningMatchesConfirmButton" },
  { status: "false_positive", labelKey: "screeningMatchesFalsePositiveButton" },
  { status: "cleared", labelKey: "screeningMatchesClearButton" },
];

export function MatchActions({ id, status, partnerId }: { id: string; status: ScreeningMatchRecordStatus; partnerId: string }) {
  const { t } = useLang();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<ScreeningMatchRecordStatus | null>(null);

  function handleReview(next: ScreeningMatchRecordStatus) {
    setPendingStatus(next);
    startTransition(async () => {
      try {
        await reviewScreeningMatch(id, next, partnerId);
        toast.success(t("screeningMatchesReviewedToast"));
        router.refresh();
      } catch (err) {
        toast.error(`${t("screeningMatchesReviewErrorPrefix")} ${err instanceof ApiError ? err.message : (err as Error).message}`);
      } finally {
        setPendingStatus(null);
      }
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {REVIEWABLE.filter((option) => option.status !== status).map((option) => (
        <button
          key={option.status}
          type="button"
          disabled={isPending}
          onClick={() => handleReview(option.status)}
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && pendingStatus === option.status ? t("workingEllipsis") : t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}
