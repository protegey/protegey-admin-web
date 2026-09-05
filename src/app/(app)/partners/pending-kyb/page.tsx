import type { Metadata } from "next";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { PendingKybIllustration } from "@/components/PendingKybIllustration";
import { PartnersClient } from "../PartnersClient";

export const metadata: Metadata = {
  title: "Pending KYB — Protegey Admin",
};

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  description: string | null;
  createdAt: string;
}

interface PaginatedPartners {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function PendingKybPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const query = new URLSearchParams({ page: String(page), limit: "20", status: "pending_verification" });
  if (search) query.set("search", search);

  const result = await apiFetch<PaginatedPartners>(`/partners?${query.toString()}`);

  return (
    <Suspense>
      <PartnersClient
        partners={result.data}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        heading="Pending KYB"
        description="Partners still waiting on document verification before they can be activated."
        illustration={<PendingKybIllustration className="h-20 w-20 shrink-0" />}
      />
    </Suspense>
  );
}
