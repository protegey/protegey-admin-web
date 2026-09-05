"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Download, X } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import {
  decidePartner,
  getPartnerDocuments,
  reviewDocument,
  type PartnerDocument,
} from "./documents-actions";

const DOCUMENT_LABELS: Record<string, string> = {
  business_registration: "Business registration certificate",
  tax_certificate: "Tax identification certificate",
  proof_of_address: "Proof of address",
  director_id: "Director / owner ID",
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

function DocumentRow({
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
    <div className="rounded-md border border-border p-3">
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
          {formatLabel(document.status)}
        </span>
      </div>

      {document.status === "rejected" && document.rejectionReason ? (
        <p className="mt-2 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
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

export function PartnerDocumentsDialog({
  open,
  onClose,
  partner,
}: {
  open: boolean;
  onClose: () => void;
  partner: { id: string; name: string; status: string } | null;
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState<PartnerDocument[] | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [showRejectPartner, setShowRejectPartner] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);

  async function loadDocuments() {
    if (!partner) return;
    const docs = await getPartnerDocuments(partner.id);
    setDocuments(docs);
  }

  useEffect(() => {
    if (open && partner) {
      loadDocuments();
      setShowRejectPartner(false);
      setDecisionReason("");
    } else {
      setDocuments(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, partner?.id]);

  async function handleApprovePartner() {
    if (!partner) return;
    setDecisionPending(true);
    const result = await decidePartner(partner.id, "approve");
    setDecisionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Partner approved and activated.");
      router.refresh();
      onClose();
    }
  }

  async function handleRejectPartner() {
    if (!partner) return;
    if (decisionReason.trim().length < 5) {
      toast.error("Please explain why this partner is being rejected.");
      return;
    }
    setDecisionPending(true);
    const result = await decidePartner(partner.id, "reject", decisionReason.trim());
    setDecisionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Partner application rejected.");
      router.refresh();
      onClose();
    }
  }

  const canDecide = partner?.status === "pending_verification" || partner?.status === "pending";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={partner ? `Documents — ${partner.name}` : "Documents"}
      description="Review the KYB documents submitted by this partner."
    >
      {!documents ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((document) => (
            <DocumentRow key={document.id} partnerId={partner!.id} document={document} onChanged={loadDocuments} />
          ))}

          {canDecide ? (
            <div className="mt-2 border-t border-border pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Partner application decision</p>
              {showRejectPartner ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Explain why this partner's application is being rejected…"
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={decisionPending}
                      onClick={handleRejectPartner}
                      className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      Confirm rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectPartner(false)}
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
                    disabled={decisionPending}
                    onClick={handleApprovePartner}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    Approve partner
                  </button>
                  <button
                    type="button"
                    disabled={decisionPending}
                    onClick={() => setShowRejectPartner(true)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Reject partner
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  );
}
