import "server-only";
import { apiFetch } from "./api";

export interface PartnerOption {
  id: string;
  name: string;
}

interface PaginatedPartnersLite {
  data: PartnerOption[];
  total: number;
}

/**
 * Lightweight partner list for admin dropdowns. The `/admin/risk-profile`, `/admin/screening-matches`
 * and `/sanctions/search` (with `externalCustomerId`) routes are cross-tenant staff views with no
 * "current partner" of their own — the admin must explicitly pick which partner's data to act on,
 * same idea as the partner filter already on `/aml/reviews`.
 */
export async function getPartnerOptions(): Promise<PartnerOption[]> {
  const result = await apiFetch<PaginatedPartnersLite>("/partners?limit=100");
  return result.data.map((p) => ({ id: p.id, name: p.name }));
}
