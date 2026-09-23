"use server";

import { getAccessToken } from "@/lib/session";
import { ApiError } from "./errors";
import type { PaginatedScreeningMatchRecords, ScreeningMatchRecordStatus, ScreeningResult } from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Screens a name against sanctions and PEP lists in one shot — backed by the shared
 * `GET /sanctions/search` endpoint (also used by the partner-facing screening tool).
 *
 * Pass `externalCustomerId` when this search is actually screening one of a partner's own
 * customers (not an arbitrary free-text lookup) — the backend then persists any qualifying hit as
 * a durable, reviewable `ScreeningMatchRecord` (see `getScreeningMatches`/`reviewScreeningMatch`
 * below). A Protegey staff caller has no `partnerId` of its own, so `partnerId` must also be passed
 * explicitly for the match to actually persist (the backend falls back to it only when the caller's
 * own JWT has none — a partner-portal caller's own partnerId always wins).
 */
export async function screenName(name: string, type?: string, externalCustomerId?: string, partnerId?: string): Promise<ScreeningResult> {
  const query = new URLSearchParams({ name });
  if (type && type !== "all") query.set("type", type);
  if (externalCustomerId) query.set("externalCustomerId", externalCustomerId);
  if (partnerId) query.set("partnerId", partnerId);

  const res = await fetch(`${BACKEND_API_URL}/sanctions/search?${query.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (body && (body.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }
  return res.json();
}

/** Backed by `GET /admin/screening-matches` — the cross-tenant staff view, mirroring `/admin/sanctions`. */
export async function getScreeningMatches(
  partnerId: string,
  page: number = 1,
  limit: number = 20,
  externalCustomerId?: string,
  status?: ScreeningMatchRecordStatus,
): Promise<PaginatedScreeningMatchRecords> {
  const query = new URLSearchParams({ partnerId, page: String(page), limit: String(limit) });
  if (externalCustomerId) query.set("externalCustomerId", externalCustomerId);
  if (status) query.set("status", status);

  const res = await fetch(`${BACKEND_API_URL}/admin/screening-matches?${query.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (body && (body.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }
  return res.json();
}

/** Backed by `PATCH /admin/screening-matches/:id?partnerId=`. */
export async function reviewScreeningMatch(id: string, status: ScreeningMatchRecordStatus, partnerId: string) {
  const query = new URLSearchParams({ partnerId });
  const res = await fetch(`${BACKEND_API_URL}/admin/screening-matches/${id}?${query.toString()}`, {
    method: "PATCH",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (body && (body.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }
  return res.json();
}
