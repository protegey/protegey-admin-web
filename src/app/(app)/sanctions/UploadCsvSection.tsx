"use client";

import { useState, useRef } from "react";
import { previewCsv, importCsv } from "./actions";
import type { PreviewResult } from "./actions";

interface Props {
  onImported: () => void;
}

export function UploadCsvSection({ onImported }: Props) {
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
      setImportResult(`Preview failed: ${(err as Error).message}`);
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
        `Import complete: ${result.imported} created, ${result.merged} merged, ${result.updated} updated, ${result.skipped} skipped, ${result.rejected} rejected (of ${result.totalRows} total rows)`,
      );
      onImported();
    } catch (err) {
      setImportResult(`Import failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Import Sanctions CSV</h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">CSV File</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="custom">Custom</option>
            <option value="nigsac">NIGSAC</option>
            <option value="ofac">OFAC</option>
            <option value="eu">EU</option>
            <option value="un">UN</option>
            <option value="au">AU</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Duplicate Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="skip">Skip</option>
            <option value="merge">Merge</option>
            <option value="force">Force overwrite</option>
          </select>
        </div>
        <button
          onClick={handlePreview}
          disabled={!file || loading}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Preview
        </button>
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Import"}
        </button>
      </div>

      {file && (
        <p className="mt-2 text-sm text-muted-foreground">
          File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {importResult && (
        <p className="mt-4 rounded-md bg-muted p-3 text-sm">{importResult}</p>
      )}

      {preview && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">
            Total rows: {preview.totalRows} | Valid: {preview.valid.length} | Rejected:{" "}
            {preview.rejected.length}
          </p>
          {preview.rejected.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="mb-1 text-sm font-medium text-destructive">Rejected rows:</p>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {preview.rejected.map((r) => (
                  <li key={r.rowNumber}>
                    Row {r.rowNumber}: {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {preview.valid.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <p className="mb-1 text-sm font-medium">Sample valid rows:</p>
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
