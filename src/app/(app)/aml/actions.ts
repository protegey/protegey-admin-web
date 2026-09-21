"use server";

import { getAccessToken } from "@/lib/session";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

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
  const token = await getAccessToken();
  const query = partnerId ? `?partnerId=${encodeURIComponent(partnerId)}` : "";
  const response = await fetch(`${BACKEND_API_URL}/admin/aml/summary${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AML summary request failed with status ${response.status}`);
  }

  return response.json();
}
