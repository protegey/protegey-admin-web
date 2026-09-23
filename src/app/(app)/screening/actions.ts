"use server";

import { getAccessToken } from "@/lib/session";
import { ApiError } from "./errors";
import type { ScreeningResult } from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

/**
 * Screens a name against sanctions and PEP lists in one shot — backed by the shared
 * `GET /sanctions/search` endpoint (also used by the partner-facing screening tool).
 */
export async function screenName(name: string, type?: string): Promise<ScreeningResult> {
  const query = new URLSearchParams({ name });
  if (type && type !== "all") query.set("type", type);

  const token = await getAccessToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BACKEND_API_URL}/sanctions/search?${query.toString()}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (body && (body.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message);
  }
  return res.json();
}
