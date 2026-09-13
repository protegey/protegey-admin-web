"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/session";
import type {
  PaginatedSanctions,
  SanctionsStats,
  ImportResult,
  PreviewResult,
} from "./types";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function getSanctions(
  page: number = 1,
  limit: number = 20,
  type?: string,
  source?: string,
  search?: string,
  includeDelisted: boolean = false,
): Promise<PaginatedSanctions> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type) query.set("type", type);
  if (source) query.set("source", source);
  if (search) query.set("search", search);
  if (includeDelisted) query.set("includeDelisted", "true");

  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions?${query.toString()}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function getSanctionsStats(): Promise<SanctionsStats> {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions/stats`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function previewCsv(file: File, source: string = "custom"): Promise<PreviewResult> {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("file", file);
  form.append("source", source);

  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions/preview`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function importCsv(
  file: File,
  duplicateStrategy: string = "skip",
  source: string = "custom",
): Promise<ImportResult> {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("file", file);
  form.append("duplicateStrategy", duplicateStrategy);
  form.append("source", source);

  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions/import`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function deleteSanction(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  revalidatePath("/sanctions");
  return { success: true };
}

export async function restoreSanction(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`${BACKEND_API_URL}/admin/sanctions/${id}/restore`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  revalidatePath("/sanctions");
  return { success: true };
}
