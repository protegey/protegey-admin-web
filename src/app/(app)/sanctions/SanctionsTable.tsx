"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useLang } from "@/lib/i18n/LangProvider";
import { Pagination } from "@/components/Pagination";
import { deleteSanction, restoreSanction, updateSanction } from "./actions";
import type { SanctionsEntity } from "./types";

interface Props {
  sanctions: SanctionsEntity[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
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

function EditDialog({
  open,
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            {t("cancel")}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t("savingEllipsis") : t("saveButton")}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotesCell({ sanction, onSaved }: { sanction: SanctionsEntity; onSaved: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(sanction.notes ?? "");
  const [saving, setSaving] = useState(false);

  function openDialog() {
    setValue(sanction.notes ?? "");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    await updateSanction(sanction.id, { notes: value || undefined });
    setSaving(false);
    setOpen(false);
    onSaved();
  }

  return (
    <>
      <td className="max-w-48 px-4 py-3">
        <div className="group flex items-center gap-1">
          <span className="truncate text-sm text-muted-foreground">{sanction.notes ?? "—"}</span>
          <button onClick={openDialog} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="size-3 text-muted-foreground" />
          </button>
        </div>
      </td>

      <EditDialog open={open} title={t("sanctionsEditNoteDialogTitle")} onClose={() => setOpen(false)} onSave={save} saving={saving}>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("sanctionsNotePlaceholder")}
          rows={4}
          autoFocus
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </EditDialog>
    </>
  );
}

function PepCell({ sanction, onSaved }: { sanction: SanctionsEntity; onSaved: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(sanction.isPep);
  const [saving, setSaving] = useState(false);

  function openDialog() {
    setValue(sanction.isPep);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    await updateSanction(sanction.id, { isPep: value });
    setSaving(false);
    setOpen(false);
    onSaved();
  }

  return (
    <>
      <td className="px-4 py-3">
        <button onClick={openDialog} className="group flex items-center gap-1.5">
          {sanction.isPep ? (
            <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
              {t("sanctionsPepBadge")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
          <Pencil className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </td>

      <EditDialog open={open} title={t("sanctionsEditPepDialogTitle")} onClose={() => setOpen(false)} onSave={save} saving={saving}>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => setValue(e.target.checked)}
            className="rounded border-border"
          />
          {t("sanctionsMarkAsPepLabel")}
        </label>
      </EditDialog>
    </>
  );
}

function NameCell({ sanction, onSaved }: { sanction: SanctionsEntity; onSaved: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(sanction.name);
  const [aliasesStr, setAliasesStr] = useState(sanction.aliases?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);

  function openDialog() {
    setName(sanction.name);
    setAliasesStr(sanction.aliases?.join(", ") ?? "");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    const aliases = aliasesStr.split(",").map((a) => a.trim()).filter(Boolean);
    await updateSanction(sanction.id, { name, aliases });
    setSaving(false);
    setOpen(false);
    onSaved();
  }

  return (
    <>
      <td className="px-4 py-3">
        <div className="group flex items-center gap-1.5">
          <span className="font-medium">{sanction.name}</span>
          <button onClick={openDialog} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="size-3 text-muted-foreground" />
          </button>
        </div>
      </td>
      <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
        {sanction.aliases?.length ? sanction.aliases.join(", ") : "—"}
      </td>

      <EditDialog open={open} title={t("sanctionsEditNameDialogTitle")} onClose={() => setOpen(false)} onSave={save} saving={saving}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("sanctionsNameFieldLabel")}</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("sanctionsAliasesFieldLabel")}</label>
            <input
              value={aliasesStr}
              onChange={(e) => setAliasesStr(e.target.value)}
              placeholder={t("sanctionsAliasesPlaceholder")}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </EditDialog>
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
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            {t("cancel")}
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

const TYPE_LABEL_KEYS: Record<string, "sanctionsTypePerson" | "sanctionsTypeBusiness"> = {
  person: "sanctionsTypePerson",
  business: "sanctionsTypeBusiness",
};

export function SanctionsTable({ sanctions, page, totalPages, total, onPageChange, loading }: Props) {
  const { t } = useLang();
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
      <div className="relative rounded-lg border border-border bg-card">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60">
            <div className="flex items-center gap-2">
              <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <span className="text-sm text-muted-foreground">{t("loadingEllipsis")}</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-medium">{t("sanctionsColName")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColAliases")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsTypeLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsSourceLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColSourceId")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColNationality")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColListingDate")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColNotes")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColPep")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("sanctionsColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {sanctions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                    {t("sanctionsEmptyMessage")}
                  </td>
                </tr>
              ) : (
                sanctions.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <NameCell sanction={s} onSaved={() => onPageChange(page)} />
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.type === "person" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`}>
                        {TYPE_LABEL_KEYS[s.type] ? t(TYPE_LABEL_KEYS[s.type]) : s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 uppercase">{s.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.sourceId ?? "—"}</td>
                    <CountryCell code={s.nationality} />
                    <td className="px-4 py-3">{formatDate(s.listingDate)}</td>
                    <NotesCell sanction={s} onSaved={() => onPageChange(page)} />
                    <PepCell sanction={s} onSaved={() => onPageChange(page)} />
                    <td className="px-4 py-3">
                      {s.delistedAt ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          {t("sanctionsStatusDelisted")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          {t("sanctionsStatusActive")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.delistedAt ? (
                        <button
                          onClick={() => setConfirmAction({ id: s.id, action: "restore" })}
                          className="text-sm text-primary hover:underline"
                        >
                          {t("sanctionsRestoreButton")}
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ id: s.id, action: "delete" })}
                          className="text-sm text-destructive hover:underline"
                        >
                          {t("sanctionsDelistButton")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={20}
          itemLabel={t("sanctionsShowingEntriesWord")}
          onPageChange={onPageChange}
          className="border-t border-border px-4 py-3"
        />
      </div>

      <ConfirmDialog
        open={confirmAction?.action === "delete"}
        title={t("sanctionsDelistConfirmTitle")}
        description={t("sanctionsDelistConfirmDescription")}
        confirmLabel={t("sanctionsDelistButton")}
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction?.action === "restore"}
        title={t("sanctionsRestoreConfirmTitle")}
        description={t("sanctionsRestoreConfirmDescription")}
        confirmLabel={t("sanctionsRestoreButton")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
