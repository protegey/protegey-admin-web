export interface SanctionsEntity {
  id: string;
  name: string;
  normalizedName: string;
  type: string;
  source: string;
  sourceId: string | null;
  aliases: string[];
  dateOfBirth: string | null;
  nationality: string | null;
  listingDate: string | null;
  delistedAt: string | null;
  notes: string | null;
  createdAt: string;
  isPep: boolean;
}

export interface PaginatedSanctions {
  data: SanctionsEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SanctionsStats {
  total: number;
  active: number;
  delisted: number;
  pepCount: number;
  byType: { type: string; count: number }[];
  bySource: { source: string; count: number }[];
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  rejected: number;
  merged: number;
  totalRows: number;
}

export interface PreviewResult {
  valid: Record<string, unknown>[];
  rejected: { rowNumber: number; reason: string; raw: string }[];
  totalRows: number;
}
