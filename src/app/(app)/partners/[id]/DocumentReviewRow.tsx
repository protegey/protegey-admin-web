"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Download, X } from "lucide-react";
import { reviewDocument, type PartnerDocument } from "../documents-actions";

const DOCUMENT_LABELS: Record<string, string> = {
  business_registration: "Business registration certificate",
  tax_certificate: "Tax identification certificate",
  proof_of_address: "Proof of address",
  director_id: "Director / owner ID",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  submitted: "In review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function DocumentReviewRow({
  partnerId,
  document,
  onChanged,
}: {
  partnerId: string;
  document: PartnerDocument;
  onChanged: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    setPending(true);
    const result = await reviewDocument(partnerId, document.id, "approve");
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document approved.");
      onChanged();
    }
  }

  async function handleReject() {
    if (reason.trim().length < 5) {
      toast.error("Please explain why this document is being rejected.");
      return;
    }
    setPending(true);
    const result = await reviewDocument(partnerId, document.id, "reject", reason.trim());
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document rejected.");
      setRejecting(false);
      setReason("");
      onChanged();
    }
  }

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{DOCUMENT_LABELS[document.type] ?? formatLabel(document.type)}</p>
          {document.fileName ? (
            <a
              href={`/api/partners/${partnerId}/documents/${document.id}/download`}
              className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              <Download className="size-3" />
              {document.fileName}
            </a>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">Not submitted yet</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[document.status]}`}>
          {STATUS_LABELS[document.status] ?? formatLabel(document.status)}
        </span>
      </div>

      {document.status === "rejected" && document.rejectionReason ? (
        <p className="mt-3 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
          <span className="font-medium">Rejection reason: </span>
          {document.rejectionReason}
        </p>
      ) : null}

      {document.status === "submitted" ? (
        <div className="mt-3">
          {rejecting ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this document is being rejected…"
                rows={2}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleReject}
                  className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setReason("");
                  }}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={handleApprove}
                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Check className="size-3.5" />
                Approve
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setRejecting(true)}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
                Reject
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
