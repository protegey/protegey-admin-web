"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { StatsCards } from "./StatsCards";
import { SanctionsTable } from "./SanctionsTable";
import { UploadCsvSection } from "./UploadCsvSection";
import type { SanctionsEntity, SanctionsStats } from "./types";

interface Props {
  sanctions: SanctionsEntity[];
  page: number;
  totalPages: number;
  total: number;
  stats: SanctionsStats;
  initialType: string;
  initialSource: string;
  initialSearch: string;
  initialIncludeDelisted: boolean;
}

export function SanctionsClient({
  sanctions,
  page,
  totalPages,
  total,
  stats,
  initialType,
  initialSource,
  initialSearch,
  initialIncludeDelisted,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [source, setSource] = useState(initialSource);
  const [includeDelisted, setIncludeDelisted] = useState(initialIncludeDelisted);
  const [showUpload, setShowUpload] = useState(false);

  function applyFilters(newPage: number = 1) {
    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (search) params.set("search", search);
    if (type !== "all") params.set("type", type);
    if (source !== "all") params.set("source", source);
    if (includeDelisted) params.set("delisted", "true");
    startTransition(() => {
      router.push(`/sanctions?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sanctions List</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startTransition(() => router.refresh())}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {showUpload ? "Close Upload" : "Import CSV"}
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />

      {showUpload && (
        <UploadCsvSection
          onImported={() => {
            setShowUpload(false);
            applyFilters();
          }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Name..."
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="person">Person</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="nigsac">NIGSAC</option>
            <option value="ofac">OFAC</option>
            <option value="eu">EU</option>
            <option value="un">UN</option>
            <option value="au">AU</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="delisted"
            checked={includeDelisted}
            onChange={(e) => setIncludeDelisted(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="delisted" className="text-sm text-muted-foreground">
            Include delisted
          </label>
        </div>
        <button
          onClick={() => applyFilters()}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Search
        </button>
      </div>

      <SanctionsTable
        sanctions={sanctions}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={(p) => applyFilters(p)}
        loading={isPending}
      />
    </div>
  );
}
