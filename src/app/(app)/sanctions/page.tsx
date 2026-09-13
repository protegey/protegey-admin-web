import type { Metadata } from "next";
import { Suspense } from "react";
import { SanctionsClient } from "./SanctionsClient";
import { getSanctions, getSanctionsStats } from "./actions";

export const metadata: Metadata = {
  title: "Sanctions — Protegey Admin",
};

export default async function SanctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string; source?: string; delisted?: string }>;
}) {
  const { page: pageParam, search, type, source, delisted } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const includeDelisted = delisted === "true";

  const [sanctions, stats] = await Promise.all([
    getSanctions(page, 20, type, source, search, includeDelisted),
    getSanctionsStats(),
  ]);

  return (
    <Suspense>
      <SanctionsClient
        sanctions={sanctions.data}
        page={sanctions.page}
        totalPages={sanctions.totalPages}
        total={sanctions.total}
        stats={stats}
        initialType={type ?? "all"}
        initialSource={source ?? "all"}
        initialSearch={search ?? ""}
        initialIncludeDelisted={includeDelisted}
      />
    </Suspense>
  );
}
