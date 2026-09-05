"use client";

import { Dialog } from "./Dialog";

/**
 * A final "are you sure?" popup for approve/reject-style actions — lighter than
 * ConfirmDialog (no retyping required), but still a deliberate extra click before
 * anything is committed. `children` can hold extra input (e.g. a rejection reason).
 */
export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  pendingLabel,
  pending = false,
  confirmDisabled = false,
  variant = "primary",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  pendingLabel?: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  variant?: "primary" | "destructive";
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col gap-4">
        {children}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || confirmDisabled}
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
              variant === "destructive" ? "bg-destructive text-white" : "bg-primary text-primary-foreground"
            }`}
          >
            {pending ? (pendingLabel ?? "Working…") : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
