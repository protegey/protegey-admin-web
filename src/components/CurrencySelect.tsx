"use client";

import { useLang } from "@/lib/i18n/LangProvider";
import { getCurrencyOptions } from "@/lib/currencies";

export function CurrencySelect({ value, onChange, className }: { value: string; onChange: (code: string) => void; className: string }) {
  const { lang } = useLang();
  const options = getCurrencyOptions(lang);
  // The contract might already hold a code ICU doesn't recognize (shouldn't happen going forward,
  // but an existing row could) — keep it selectable rather than silently swapping it out from under the admin.
  const hasCurrentValue = options.some((option) => option.code === value);

  return (
    <select className={className} required value={value} onChange={(e) => onChange(e.target.value)}>
      {!hasCurrentValue && value ? <option value={value}>{value}</option> : null}
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
