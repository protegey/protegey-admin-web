"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { PartnerDetailIllustration } from "@/components/PartnerDetailIllustration";
import { PartnerFormDialog, type EditablePartner } from "../PartnerFormDialog";
import { decidePartner, getPartnerDocuments, type PartnerDocument } from "../documents-actions";
import { deletePartnerAction } from "../actions";
import { DocumentReviewRow } from "./DocumentReviewRow";

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  description: string | null;
  rejectionReason: string | null;
  createdAt: string;
  activatedAt: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  pending_verification: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  inactive: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export function PartnerDetailClient({
  partner: initialPartner,
  documents: initialDocuments,
}: {
  partner: Partner;
  documents: PartnerDocument[];
}) {
  const router = useRouter();
  const [partner, setPartner] = useState(initialPartner);
  const [documents, setDocuments] = useState(initialDocuments);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [confirmDecision, setConfirmDecision] = useState<"approve" | "reject" | null>(null);
  const [decisionPending, setDecisionPending] = useState(false);

  function closeDecisionConfirm() {
    setConfirmDecision(null);
    setDecisionReason("");
  }

  useEffect(() => {
    setPartner(initialPartner);
  }, [initialPartner]);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  async function reloadDocuments() {
    const docs = await getPartnerDocuments(partner.id);
    setDocuments(docs);
  }

  const canDecide = partner.status === "pending_verification" || partner.status === "pending";
  const allApproved = documents.length > 0 && documents.every((d) => d.status === "approved");

  async function handleApprovePartner() {
    setDecisionPending(true);
    const result = await decidePartner(partner.id, "approve");
    setDecisionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Partner approved and activated.");
      closeDecisionConfirm();
      router.refresh();
    }
  }

  async function handleRejectPartner() {
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
      closeDecisionConfirm();
      router.refresh();
    }
  }

  async function handleDelete() {
    setDeletePending(true);
    const result = await deletePartnerAction(partner.id);
    setDeletePending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Partner deleted.");
    router.push("/partners");
  }

  const editablePartner: EditablePartner = {
    id: partner.id,
    name: partner.name,
    type: partner.type,
    plan: partner.plan,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone,
    country: partner.country,
    description: partner.description,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <PartnerDetailIllustration className="h-16 w-16 shrink-0" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{partner.name}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[partner.status] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {formatLabel(partner.status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatLabel(partner.type)} · {formatLabel(partner.plan)}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {partner.status === "rejected" && partner.rejectionReason ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">Application rejected</p>
          <p className="mt-1 text-sm text-destructive">{partner.rejectionReason}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md border border-border bg-card p-5 sm:grid-cols-3">
        <InfoField label="Contact email" value={partner.contactEmail} />
        <InfoField label="Contact phone" value={partner.contactPhone} />
        <InfoField label="Country" value={partner.country} />
        <InfoField label="Created" value={new Date(partner.createdAt).toLocaleDateString()} />
        <InfoField label="Activated" value={partner.activatedAt ? new Date(partner.activatedAt).toLocaleDateString() : null} />
        <InfoField label="Description" value={partner.description} />
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">KYB documents</p>
        <div className="flex flex-col gap-3">
          {documents.map((document) => (
            <DocumentReviewRow key={document.id} partnerId={partner.id} document={document} onChanged={reloadDocuments} />
          ))}
        </div>

        {canDecide ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Partner application decision</p>
            {!allApproved ? (
              <p className="mb-3 text-xs text-muted-foreground">
                Every document must be approved before this partner can be activated.
              </p>
            ) : null}
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
                  disabled={decisionPending || !allApproved}
                  onClick={handleApprovePartner}
                  title={!allApproved ? "All documents must be approved first" : undefined}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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

      <PartnerFormDialog open={editOpen} onClose={() => setEditOpen(false)} partner={editablePartner} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this partner?"
        description="This removes the partner from every list and blocks their team from signing in. Records are kept for audit purposes."
        confirmPhrase={partner.name}
        pending={deletePending}
      />
    </div>
  );
}
