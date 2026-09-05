"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "./Dialog";

/**
 * A deliberately heavier confirmation than a plain browser confirm() — the
 * caller must retype a confirmation phrase (e.g. the partner's name) before
 * the destructive action can be triggered. Use for anything that removes
 * access or data, even when it's a soft delete.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmPhrase,
  confirmLabel = "Delete",
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmPhrase: string;
  confirmLabel?: string;
  pending?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === confirmPhrase;

  function handleClose() {
    setTyped("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title={title} description={description}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">This action cannot be undone from this screen.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Type <span className="font-semibold text-foreground">{confirmPhrase}</span> to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches || pending}
            onClick={onConfirm}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
