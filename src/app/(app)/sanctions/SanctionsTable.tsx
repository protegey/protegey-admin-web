"use client";

import { deleteSanction, restoreSanction } from "./actions";
import type { SanctionsEntity } from "./actions";

interface Props {
  sanctions: SanctionsEntity[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SanctionsTable({ sanctions, page, totalPages, total, onPageChange }: Props) {
  function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  }

  function formatAliases(aliases: string[]): string {
    if (!aliases || aliases.length === 0) return "—";
    return aliases.join(", ");
  }

  async function handleDelete(id: string) {
    if (!confirm("De-list this sanctions entry?")) return;
    await deleteSanction(id);
    onPageChange(page);
  }

  async function handleRestore(id: string) {
    await restoreSanction(id);
    onPageChange(page);
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Source ID</th>
              <th className="px-4 py-3 font-medium">Aliases</th>
              <th className="px-4 py-3 font-medium">Nationality</th>
              <th className="px-4 py-3 font-medium">Listing Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sanctions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No sanctions entries found.
                </td>
              </tr>
            ) : (
              sanctions.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.type === "person" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.sourceId ?? "—"}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                    {formatAliases(s.aliases)}
                  </td>
                  <td className="px-4 py-3">{s.nationality ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(s.listingDate)}</td>
                  <td className="px-4 py-3">
                    {s.delistedAt ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                        Delisted
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.delistedAt ? (
                      <button
                        onClick={() => handleRestore(s.id)}
                        className="text-sm text-primary hover:underline"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-sm text-destructive hover:underline"
                      >
                        De-list
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {sanctions.length} of {total.toLocaleString()} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
