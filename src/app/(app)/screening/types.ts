export interface ScreeningMatch {
  id: string;
  name: string;
  type: string;
  source: string;
  sourceId: string | null;
  aliases: string[];
  dateOfBirth: string | null;
  nationality: string | null;
  listingDate: string | null;
  notes: string | null;
  score: number;
  /** 'name' | 'alias' */
  matchedOn: string;
  isPep: boolean;
}

export interface ScreeningResult {
  /** 'blocked' | 'review' | 'clear' */
  decision: string;
  score: number;
  matches: ScreeningMatch[];
  /** True when any returned match is flagged as a Politically Exposed Person. */
  pepMatch: boolean;
  provider?: "protegey" | "dow_jones";
  providers?: Array<"protegey" | "dow_jones">;
  defaultListChecked?: boolean;
  degraded?: boolean;
  fallbackReason?: string;
}

export type ScreeningMatchRecordStatus = "possible_match" | "confirmed" | "false_positive" | "cleared";

/**
 * A durable, reviewable sanctions/PEP hit against one of the partner's real customers — recorded
 * automatically by `GET /sanctions/search` when it's called with `externalCustomerId` set. Unlike
 * `ScreeningMatch` above (a transient result row from one search), this persists across searches
 * and carries a review status an analyst can update.
 */
export interface ScreeningMatchRecord {
  id: string;
  partnerId: string;
  externalCustomerId: string;
  sanctionsEntityId: string;
  matchedName: string;
  matchScore: number;
  matchedOn: string;
  isPep: boolean;
  source: string;
  status: ScreeningMatchRecordStatus;
  verifiedByUserId: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedScreeningMatchRecords {
  data: ScreeningMatchRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
