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
