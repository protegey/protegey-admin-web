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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await apiFetch<PaginatedPartners>(`/partners?page=${page}&limit=20`);

  return (
    <Suspense>
      <PartnersClient
        partners={result.data}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </Suspense>
  );
}
