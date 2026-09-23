"use server";

import { apiFetch } from "@/lib/api";
import type { PaginatedRiskProfiles, RiskProfile } from "./types";

/**
 * Backed by `GET /admin/risk-profile` — the cross-tenant staff view, mirroring `/admin/sanctions`
 * (explicit `partnerId` query param, gated on `admin.access`). Protegey staff accounts have no
 * partner of their own, so `partnerId` must be picked explicitly (see the partner selector on the
 * list page) rather than relying on the caller's own JWT the way the partner-portal `/risk-profile/me`
 * routes do.
 */
export async function getRiskProfiles(
  partnerId: string,
  page: number = 1,
  limit: number = 20,
  externalCustomerId?: string,
): Promise<PaginatedRiskProfiles> {
  const query = new URLSearchParams({ partnerId, page: String(page), limit: String(limit) });
  if (externalCustomerId) query.set("externalCustomerId", externalCustomerId);
  return apiFetch<PaginatedRiskProfiles>(`/admin/risk-profile?${query.toString()}`);
}

export async function getRiskProfile(partnerId: string, externalCustomerId: string): Promise<RiskProfile> {
  const query = new URLSearchParams({ partnerId });
  return apiFetch<RiskProfile>(`/admin/risk-profile/${encodeURIComponent(externalCustomerId)}?${query.toString()}`);
}
