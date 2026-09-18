"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/i18n/LangProvider";
import { previewCsv, importCsv } from "./actions";
import type { PreviewResult } from "./types";

interface Props {
  onImported: () => void;
}

export function UploadCsvSection({ onImported }: Props) {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("custom");
  const [strategy, setStrategy] = useState("skip");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setImportResult(null);
    }
  }

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    try {
      const result = await previewCsv(file, source);
      setPreview(result);
    } catch (err) {
      setImportResult(`${t("sanctionsPreviewFailedPrefix")} ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    try {
      const result = await importCsv(file, strategy, source);
      setImportResult(
        `${t("sanctionsImportCompletePrefix")} ${result.imported} ${t("sanctionsImportCreatedWord")}, ${result.merged} ${t("sanctionsImportMergedWord")}, ${result.updated} ${t("sanctionsImportUpdatedWord")}, ${result.skipped} ${t("sanctionsImportSkippedWord")}, ${result.rejected} ${t("sanctionsImportRejectedWord")} (${t("sanctionsImportOfWord")} ${result.totalRows} ${t("sanctionsImportTotalRowsWord")})`,
      );
      onImported();
    } catch (err) {
      setImportResult(`${t("sanctionsImportFailedPrefix")} ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">{t("sanctionsUploadTitle")}</h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t("sanctionsCsvFileLabel")}</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t("sanctionsSourceLabel")}</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="custom">{t("sanctionsSourceCustom")}</option>
            <option value="nigsac">NIGSAC</option>
            <option value="ofac">OFAC</option>
            <option value="eu">EU</option>
            <option value="un">UN</option>
            <option value="au">AU</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">{t("sanctionsDuplicateStrategyLabel")}</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="skip">{t("sanctionsStrategySkip")}</option>
            <option value="merge">{t("sanctionsStrategyMerge")}</option>
            <option value="force">{t("sanctionsStrategyForce")}</option>
          </select>
        </div>
        <button
          onClick={handlePreview}
          disabled={!file || loading}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {t("sanctionsPreviewButton")}
        </button>
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? t("sanctionsProcessingEllipsis") : t("sanctionsImportButton")}
        </button>
      </div>

      {file && (
        <p className="mt-2 text-sm text-muted-foreground">
          {t("sanctionsFileLabelPrefix")} {file.name} ({(file.size / 1024).toFixed(1)} {t("sanctionsKbUnit")})
        </p>
      )}

      {importResult && (
        <p className="mt-4 rounded-md bg-muted p-3 text-sm">{importResult}</p>
      )}

      {preview && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">
            {t("sanctionsTotalRowsLabel")} {preview.totalRows} | {t("sanctionsValidLabel")} {preview.valid.length} |{" "}
            {t("sanctionsRejectedLabel")} {preview.rejected.length}
          </p>
          {preview.rejected.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="mb-1 text-sm font-medium text-destructive">{t("sanctionsRejectedRowsLabel")}</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {preview.rejected.map((r) => (
                  <li key={r.rowNumber}>
                    {t("sanctionsRowLabel")} {r.rowNumber}: {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {preview.valid.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <p className="mb-1 text-sm font-medium">{t("sanctionsSampleValidRowsLabel")}</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {preview.valid.slice(0, 5).map((r, i) => (
                  <li key={i}>
                    {String(r.name)} ({String(r.type)}) — {String(r.source)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
