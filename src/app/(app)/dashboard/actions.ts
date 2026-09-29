"use server";

import { apiFetch } from "@/lib/api";

export interface DashboardActivityItem {
  id: string;
  partnerId: string;
  partnerName: string;
  actorLabel: string | null;
  type: string;
  metadata: Record<string, string | number> | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalPartners: number;
  partnersByStatus: Record<string, number>;
  pendingKybCount: number;
  partnersWithoutContractCount: number;
  recentPartners: { id: string; name: string; status: string; createdAt: string }[];
  recentActivity: DashboardActivityItem[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/admin/dashboard/summary");
}
