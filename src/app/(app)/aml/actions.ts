"use server";

import { getAccessToken } from "@/lib/session";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AmlPartnerSummary {
  partnerId: string;
  partnerName: string;
  openAlerts: number;
  overdueAlerts: number;
  openEdd: number;
  confirmedPep: number;
  sarDrafts: number;
}

export interface AmlSummary {
  openAlerts: number;
  confirmedAlerts: number;
  overdueAlerts: number;
  escalatedAlerts: number;
  confirmedPep: number;
  pepReviews: number;
  eddOpen: number;
  sarDrafts: number;
  sarSubmitted: number;
  partners: AmlPartnerSummary[];
}

export async function getAmlSummary(partnerId?: string): Promise<AmlSummary> {
  const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : "";
  const response = await fetch(`${BACKEND_API_URL}/admin/aml/summary${query}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AML summary request failed with status ${response.status}`);
  }

  return response.json();
}

export interface AmlReviewPage {
  data: AmlReviewRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AmlReviewRow {
  id: string;
  partnerName: string;
  status: string;
  category: string;
  riskLevel: string | null;
  createdAt: string | null;
  dueAt: string | null;
}

type ReviewKind = "alerts" | "pep" | "edd";

function safeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function safeReviewPage(payload: unknown, kind: ReviewKind, requestedPage: number): AmlReviewPage {
  const source = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const rows = Array.isArray(source.data) ? source.data : [];
  const data = rows.flatMap((value): AmlReviewRow[] => {
    if (!value || typeof value !== "object") return [];
    const row = value as Record<string, unknown>;
    const id = safeString(row.id);
    if (!id) return [];

    return [{
      id,
      partnerName: safeString(row.partnerName) ?? safeString(row.partner_name) ?? "—",
      status: safeString(row.status) ?? "—",
      category: safeString(row.category) ?? (kind === "pep" ? "PEP" : kind === "edd" ? "EDD" : "AML"),
      riskLevel: safeString(row.riskLevel) ?? safeString(row.risk_level),
      createdAt: safeString(row.createdAt) ?? safeString(row.created_at),
      dueAt: safeString(row.dueAt) ?? safeString(row.due_at),
    }];
  });

  const total = typeof source.total === "number" ? source.total : data.length;
  const limit = typeof source.limit === "number" ? source.limit : 20;
  const page = typeof source.page === "number" ? source.page : requestedPage;
  const totalPages = typeof source.totalPages === "number" ? source.totalPages : Math.max(1, Math.ceil(total / limit));

  return { data, total, page, limit, totalPages };
}

export async function getAmlReviews(
  kind: ReviewKind,
  page: number = 1,
  partnerId?: string,
  status?: string,
): Promise<AmlReviewPage> {
  const query = new URLSearchParams({ page: String(page), limit: "20" });
  if (partnerId) query.set("partnerId", partnerId);
  if (status && status !== "all") query.set("status", status);

  const response = await fetch(`${BACKEND_API_URL}/admin/aml/${kind}?${query.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`AML ${kind} request failed with status ${response.status}`);

  return safeReviewPage(await response.json(), kind, page);
}
