"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import { COUNTRIES, countryFlagEmoji } from "@/lib/countries";

export function CountrySelect({
  name,
  defaultValue,
  placeholder = "Select a country",
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(defaultValue ?? null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
      setHighlighted(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (country) => country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const selected = COUNTRIES.find((c) => c.code === selectedCode) ?? null;

  function select(code: string | null) {
    setSelectedCode(code);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const country = filtered[highlighted];
      if (country) select(country.code);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedCode ?? ""} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-md border bg-background px-3 py-2 text-left text-sm outline-none transition-colors ${
          open ? "border-ring ring-2 ring-ring" : "border-border"
        }`}
      >
        {selected ? (
          <span className="text-base leading-none">{countryFlagEmoji(selected.code)}</span>
        ) : (
          <Globe className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className={`flex-1 truncate ${selected ? "text-foreground" : "text-muted-foreground"}`}>
          {selected ? selected.name : placeholder}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              select(null);
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear country"
          >
            <X className="size-3.5" />
          </span>
        ) : null}
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="animate-dropdown-in absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl ring-1 ring-black/5">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search countries…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div ref={listRef} className="scroll-thin max-h-72 overflow-y-auto overscroll-contain p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No country matches &ldquo;{query}&rdquo;.
              </p>
            ) : (
              filtered.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => select(country.code)}
                  className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                    index === highlighted ? "bg-muted" : ""
                  } ${country.code === selectedCode ? "text-primary" : "text-foreground"}`}
                >
                  <span className="text-base leading-none">{countryFlagEmoji(country.code)}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-muted-foreground">{country.code}</span>
                  {country.code === selectedCode ? <Check className="size-3.5 shrink-0" /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
