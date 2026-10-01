/**
 * Every ISO 4217 currency code the runtime's ICU data knows about (~160) — not a hand-maintained
 * list, so it never goes stale and never misses a country's currency (XAF, XOF, DZD, and anything
 * else a partner's invoice might need are already in here). `Intl.supportedValuesOf` and
 * `Intl.DisplayNames` are both standard, available in Node 18+ and every modern browser.
 */
export interface CurrencyOption {
  code: string;
  label: string;
}

export function getCurrencyOptions(lang: "en" | "fr" = "en"): CurrencyOption[] {
  const displayNames = new Intl.DisplayNames([lang === "fr" ? "fr" : "en"], { type: "currency" });
  return Intl.supportedValuesOf("currency")
    .map((code) => ({ code, label: `${code} — ${displayNames.of(code) ?? code}` }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
