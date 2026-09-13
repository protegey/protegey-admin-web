"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { deleteSanction, restoreSanction, updateSanction } from "./actions";
import type { SanctionsEntity } from "./types";

interface Props {
  sanctions: SanctionsEntity[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", ZA: "\u{1F1FF}\u{1F1E6}", KE: "\u{1F1F0}\u{1F1EA}",
  GH: "\u{1F1EC}\u{1F1ED}", EG: "\u{1F1EA}\u{1F1EC}", ET: "\u{1F1EA}\u{1F1F9}",
  TZ: "\u{1F1F9}\u{1F1FF}", UG: "\u{1F1FA}\u{1F1EC}", RW: "\u{1F1F7}\u{1F1FC}",
  SN: "\u{1F1F8}\u{1F1F3}", CI: "\u{1F1E8}\u{1F1EE}", CM: "\u{1F1E8}\u{1F1F2}",
  CD: "\u{1F1E8}\u{1F1E9}", AO: "\u{1F1E6}\u{1F1F4}", MZ: "\u{1F1F2}\u{1F1FF}",
  ZW: "\u{1F1FF}\u{1F1FC}", ZM: "\u{1F1FF}\u{1F1F2}", MW: "\u{1F1F2}\u{1F1FC}",
  BW: "\u{1F1E7}\u{1F1FC}", NA: "\u{1F1F3}\u{1F1E6}", SZ: "\u{1F1F8}\u{1F1FF}",
  LS: "\u{1F1F1}\u{1F1F8}", MG: "\u{1F1F2}\u{1F1EC}", MU: "\u{1F1F2}\u{1F1FA}",
  SC: "\u{1F1F8}\u{1F1E8}", KM: "\u{1F1F0}\u{1F1F2}", DJ: "\u{1F1E9}\u{1F1EF}",
  SO: "\u{1F1F8}\u{1F1F4}", SD: "\u{1F1F8}\u{1F1E9}", SS: "\u{1F1F8}\u{1F1F8}",
  ER: "\u{1F1EA}\u{1F1F7}",
  US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}", FR: "\u{1F1EB}\u{1F1F7}",
  DE: "\u{1F1E9}\u{1F1EA}", IT: "\u{1F1EE}\u{1F1F9}", ES: "\u{1F1EA}\u{1F1F8}",
  PT: "\u{1F1F5}\u{1F1F9}", NL: "\u{1F1F3}\u{1F1F1}", BE: "\u{1F1E7}\u{1F1EA}",
  CH: "\u{1F1E8}\u{1F1ED}", AT: "\u{1F1E6}\u{1F1F9}", SE: "\u{1F1F8}\u{1F1EA}",
  NO: "\u{1F1F3}\u{1F1F4}", DK: "\u{1F1E9}\u{1F1F0}", FI: "\u{1F1EB}\u{1F1EE}",
  IE: "\u{1F1EE}\u{1F1EA}", GR: "\u{1F1EC}\u{1F1F7}",
  PL: "\u{1F1F5}\u{1F1F1}", CZ: "\u{1F1E8}\u{1F1FF}", SK: "\u{1F1F8}\u{1F1F0}",
  HU: "\u{1F1ED}\u{1F1FA}", RO: "\u{1F1F7}\u{1F1F4}", BG: "\u{1F1E7}\u{1F1EC}",
  HR: "\u{1F1ED}\u{1F1F7}", SI: "\u{1F1F8}\u{1F1EE}", LT: "\u{1F1F1}\u{1F1F9}",
  LV: "\u{1F1F1}\u{1F1FB}", EE: "\u{1F1EA}\u{1F1EA}",
  RU: "\u{1F1F7}\u{1F1FA}", UA: "\u{1F1FA}\u{1F1E6}", BY: "\u{1F1E7}\u{1F1FE}",
  TR: "\u{1F1F9}\u{1F1F7}", SA: "\u{1F1F8}\u{1F1E6}", AE: "\u{1F1E6}\u{1F1EA}",
  IL: "\u{1F1EE}\u{1F1F1}", IR: "\u{1F1EE}\u{1F1F7}", IQ: "\u{1F1EE}\u{1F1F6}",
  SY: "\u{1F1F8}\u{1F1FE}", JO: "\u{1F1EF}\u{1F1F4}", LB: "\u{1F1F1}\u{1F1E7}",
  KW: "\u{1F1F0}\u{1F1FC}", QA: "\u{1F1F6}\u{1F1E6}", BH: "\u{1F1E7}\u{1F1ED}",
  OM: "\u{1F1F4}\u{1F1F2}", YE: "\u{1F1FE}\u{1F1EA}",
  IN: "\u{1F1EE}\u{1F1F3}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  KR: "\u{1F1F0}\u{1F1F7}", PK: "\u{1F1F5}\u{1F1F0}", BD: "\u{1F1E7}\u{1F1E9}",
  LK: "\u{1F1F1}\u{1F1F0}", NP: "\u{1F1F3}\u{1F1F5}", AF: "\u{1F1E6}\u{1F1EB}",
  MM: "\u{1F1F2}\u{1F1F2}", TH: "\u{1F1F9}\u{1F1ED}", VN: "\u{1F1FB}\u{1F1F3}",
  PH: "\u{1F1F5}\u{1F1ED}", ID: "\u{1F1EE}\u{1F1E9}", MY: "\u{1F1F2}\u{1F1FE}",
  SG: "\u{1F1F8}\u{1F1EC}", KH: "\u{1F1F0}\u{1F1ED}", LA: "\u{1F1F1}\u{1F1E6}",
  BR: "\u{1F1E7}\u{1F1F7}", AR: "\u{1F1E6}\u{1F1F7}", MX: "\u{1F1F2}\u{1F1FD}",
  CO: "\u{1F1E8}\u{1F1F4}", CL: "\u{1F1E8}\u{1F1F1}", PE: "\u{1F1F5}\u{1F1EA}",
  VE: "\u{1F1FB}\u{1F1EA}", EC: "\u{1F1EA}\u{1F1E8}", BO: "\u{1F1E7}\u{1F1F4}",
  PY: "\u{1F1F5}\u{1F1FE}", UY: "\u{1F1FA}\u{1F1FE}",
  CA: "\u{1F1E8}\u{1F1E6}", AU: "\u{1F1E6}\u{1F1FA}", NZ: "\u{1F1F3}\u{1F1FF}",
};

function countryFlag(code: string | null | undefined): string {
  if (!code) return "";
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "";
}

function CountryCell({ code }: { code: string | null }) {
  if (!code) return <td className="px-4 py-3 text-muted-foreground">—</td>;
  const flag = countryFlag(code);
  let fullName = code;
  try {
    fullName = new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {}
  return (
    <td className="inline-flex items-center gap-1.5 px-4 py-3">
      {flag && <span className="text-base leading-none">{flag}</span>}
      <span className="text-sm">{fullName}</span>
    </td>
  );
}

function NotesCell({ sanction, onSaved }: { sanction: SanctionsEntity; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(sanction.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateSanction(sanction.id, { notes: value || undefined });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (editing) {
    return (
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-40 rounded border border-border bg-background px-2 py-1 text-sm"
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <button onClick={save} disabled={saving} className="text-green-600 hover:text-green-700"><Check className="size-4" /></button>
          <button onClick={() => { setEditing(false); setValue(sanction.notes ?? ""); }} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
      </td>
    );
  }

  return (
    <td className="max-w-48 px-4 py-3">
      <div className="group flex items-center gap-1">
        <span className="truncate text-sm text-muted-foreground">{sanction.notes ?? "—"}</span>
        <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="size-3 text-muted-foreground" /></button>
      </div>
    </td>
  );
}

function NameCell({ sanction, onSaved }: { sanction: SanctionsEntity; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sanction.name);
  const [aliasesStr, setAliasesStr] = useState(sanction.aliases?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const aliases = aliasesStr.split(",").map((a) => a.trim()).filter(Boolean);
    await updateSanction(sanction.id, { name, aliases });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (editing) {
    return (
      <td className="px-4 py-2" colSpan={2}>
        <div className="flex flex-col gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-medium"
          />
          <input
            value={aliasesStr}
            onChange={(e) => setAliasesStr(e.target.value)}
            placeholder="Aliases (comma separated)"
            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
          />
          <div className="flex items-center gap-1">
            <button onClick={save} disabled={saving} className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setName(sanction.name); setAliasesStr(sanction.aliases?.join(", ") ?? ""); }} className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      </td>
    );
  }

  return (
    <>
      <td className="px-4 py-3">
        <div className="group flex items-center gap-1.5">
          <span className="font-medium">{sanction.name}</span>
          <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="size-3 text-muted-foreground" /></button>
        </div>
      </td>
      <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
        {sanction.aliases?.length ? sanction.aliases.join(", ") : "—"}
      </td>
    </>
  );
}

function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel, destructive }: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  destructive?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${destructive ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SanctionsTable({ sanctions, page, totalPages, total, onPageChange }: Props) {
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "delete" | "restore" } | null>(null);

  function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    if (confirmAction.action === "delete") {
      await deleteSanction(confirmAction.id);
    } else {
      await restoreSanction(confirmAction.id);
    }
    setConfirmAction(null);
    onPageChange(page);
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Aliases</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Source ID</th>
                <th className="px-4 py-3 font-medium">Nationality</th>
                <th className="px-4 py-3 font-medium">Listing Date</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sanctions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No sanctions entries found.
                  </td>
                </tr>
              ) : (
                sanctions.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <NameCell sanction={s} onSaved={() => onPageChange(page)} />
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.type === "person" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 uppercase">{s.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.sourceId ?? "—"}</td>
                    <CountryCell code={s.nationality} />
                    <td className="px-4 py-3">{formatDate(s.listingDate)}</td>
                    <NotesCell sanction={s} onSaved={() => onPageChange(page)} />
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
                          onClick={() => setConfirmAction({ id: s.id, action: "restore" })}
                          className="text-sm text-primary hover:underline"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ id: s.id, action: "delete" })}
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

      <ConfirmDialog
        open={confirmAction?.action === "delete"}
        title="De-list this sanctions entry?"
        description="This will mark the entry as delisted. It can be restored later."
        confirmLabel="De-list"
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction?.action === "restore"}
        title="Restore this sanctions entry?"
        description="This will reactivate the entry and it will appear in screening results again."
        confirmLabel="Restore"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
