import type { Metadata } from "next";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { PartnersClient } from "./PartnersClient";

export const metadata: Metadata = {
  title: "Partners — Protegey Admin",
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

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const { page: pageParam, search, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const query = new URLSearchParams({ page: String(page), limit: "20" });
  if (search) query.set("search", search);
  if (status && status !== "all") query.set("status", status);

  const result = await apiFetch<PaginatedPartners>(`/partners?${query.toString()}`);

  return (
    <Suspense>
      <PartnersClient
        partners={result.data}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        initialStatus={status && status !== "all" ? status : "all"}
      />
    </Suspense>
  );
}
