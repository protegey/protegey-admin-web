export interface RiskCategoryBreakdown {
  /** 'behavioral' | 'network' | 'contextual' | 'historical' */
  category: string;
  /** Ready-to-display label from the backend (French when the session is in French). */
  label: string;
  points: number;
  count: number;
  weight: number;
}

export interface RiskProfileHistoryEntry {
  at: string;
  source: string;
  category: string;
  reason: string;
  points: number;
  scoreBefore: number;
  scoreAfter: number;
  direction: "increased" | "decreased" | "unchanged";
}

export interface RiskProfile {
  id: string;
  partnerId: string;
  externalCustomerId: string;
  cumulativeScore: number;
  createdAt: string;
  updatedAt: string;
  breakdown: RiskCategoryBreakdown[];
  decayedScore: number;
  weightedScore: number;
  topCategory: string | null;
  /** Newest first. */
  history: RiskProfileHistoryEntry[];
}

export interface PaginatedRiskProfiles {
  data: RiskProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
