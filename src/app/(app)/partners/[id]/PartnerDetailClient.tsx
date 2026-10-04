"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Gauge, ListChecks, Pencil, Ban, PlayCircle } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { PartnerDetailIllustration } from "@/components/PartnerDetailIllustration";
import { useLang } from "@/lib/i18n/LangProvider";
import type { StringKey } from "@/lib/i18n/strings";
import { PartnerFormDialog, type EditablePartner } from "../PartnerFormDialog";
import {
  decidePartner,
  getPartnerDocuments,
  reactivatePartner,
  suspendPartner,
  type PartnerDocument,
} from "../documents-actions";
import type { TeamMember, PendingInvitation, AssignableRole, PaginatedResult } from "../team-actions";
import { DocumentReviewRow } from "./DocumentReviewRow";
import { PartnerTeamSection } from "./PartnerTeamSection";
import { PartnerContractSection } from "./PartnerContractSection";
import { PartnerInvoicesSection } from "./PartnerInvoicesSection";
import type { PartnerContract, BillingAuditEvent, ContractCycleUsage, DefaultContractTemplate } from "./contract-actions";
import type { Invoice } from "./invoice-actions";

type PaymentHealth = "no_invoice" | "current" | "pending" | "overdue";

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactRole: string | null;
  contactRoleOther: string | null;
  country: string | null;
  description: string | null;
  rejectionReason: string | null;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
  activatedAt: string | null;
  paymentHealth: PaymentHealth;
}

const PAYMENT_HEALTH_STYLES: Record<PaymentHealth, string> = {
  no_invoice: "bg-muted text-muted-foreground",
  current: "bg-primary/10 text-primary",
  pending: "bg-amber-500/10 text-amber-600",
  overdue: "bg-destructive/10 text-destructive",
};

const PAYMENT_HEALTH_LABEL_KEYS: Record<PaymentHealth, StringKey> = {
  no_invoice: "paymentHealthNoInvoice",
  current: "paymentHealthCurrent",
  pending: "paymentHealthPending",
  overdue: "paymentHealthOverdue",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  pending_verification: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  inactive: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL_KEYS: Record<string, StringKey> = {
  active: "partnersStatusActive",
  pending: "partnersStatusPending",
  pending_verification: "partnersStatusPendingVerification",
  suspended: "partnersStatusSuspended",
  inactive: "partnersStatusInactive",
  rejected: "partnersStatusRejected",
};

const TYPE_LABEL_KEYS: Record<string, StringKey> = {
  fintech: "partnerTypeFintech",
  bank: "partnerTypeBank",
  telco: "partnerTypeTelco",
  regulator: "partnerTypeRegulator",
  other: "partnerTypeOther",
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
  team,
  invitations,
  roles,
  contract,
  billingHistory,
  usage,
  defaultContractTemplate,
  invoices,
}: {
  partner: Partner;
  documents: PartnerDocument[];
  team: PaginatedResult<TeamMember>;
  invitations: PaginatedResult<PendingInvitation>;
  roles: AssignableRole[];
  contract: PartnerContract | null;
  billingHistory: BillingAuditEvent[];
  usage: ContractCycleUsage | null;
  defaultContractTemplate: DefaultContractTemplate;
  invoices: Invoice[];
}) {
  const { t } = useLang();
  const router = useRouter();
  const [partner, setPartner] = useState(initialPartner);
  const [documents, setDocuments] = useState(initialDocuments);
  const [editOpen, setEditOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [confirmDecision, setConfirmDecision] = useState<"approve" | "reject" | null>(null);
  const [decisionPending, setDecisionPending] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [confirmSuspension, setConfirmSuspension] = useState<"suspend" | "reactivate" | null>(null);
  const [suspensionPending, setSuspensionPending] = useState(false);

  function closeDecisionConfirm() {
    setConfirmDecision(null);
    setDecisionReason("");
  }

  function closeSuspensionConfirm() {
    setConfirmSuspension(null);
    setSuspendReason("");
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
      toast.success(t("partnersApprovedToast"));
      closeDecisionConfirm();
      router.refresh();
    }
  }

  async function handleRejectPartner() {
    if (decisionReason.trim().length < 5) {
      toast.error(t("partnersRejectReasonRequiredToast"));
      return;
    }
    setDecisionPending(true);
    const result = await decidePartner(partner.id, "reject", decisionReason.trim());
    setDecisionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("partnersRejectedToast"));
      closeDecisionConfirm();
      router.refresh();
    }
  }

  async function handleSuspend() {
    if (suspendReason.trim().length < 5) {
      toast.error(t("partnersSuspendReasonRequiredToast"));
      return;
    }
    setSuspensionPending(true);
    const result = await suspendPartner(partner.id, suspendReason.trim());
    setSuspensionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("partnersSuspendedToast"));
      closeSuspensionConfirm();
      router.refresh();
    }
  }

  async function handleReactivate() {
    setSuspensionPending(true);
    const result = await reactivatePartner(partner.id);
    setSuspensionPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("partnersReactivatedToast"));
      closeSuspensionConfirm();
      router.refresh();
    }
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
                {STATUS_LABEL_KEYS[partner.status] ? t(STATUS_LABEL_KEYS[partner.status]) : formatLabel(partner.status)}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_HEALTH_STYLES[partner.paymentHealth]}`}>
                {t(PAYMENT_HEALTH_LABEL_KEYS[partner.paymentHealth])}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {TYPE_LABEL_KEYS[partner.type] ? t(TYPE_LABEL_KEYS[partner.type]) : formatLabel(partner.type)} ·{" "}
              {formatLabel(partner.plan)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/risk-profile?partnerId=${encodeURIComponent(partner.id)}`}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Gauge className="size-3.5" />
            {t("navRiskProfiles")}
          </Link>
          <Link
            href={`/screening/matches?partnerId=${encodeURIComponent(partner.id)}`}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ListChecks className="size-3.5" />
            {t("navScreeningMatches")}
          </Link>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="size-3.5" />
            {t("editButton")}
          </button>
          {partner.status === "suspended" ? (
            <button
              type="button"
              onClick={() => setConfirmSuspension("reactivate")}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <PlayCircle className="size-3.5" />
              {t("partnersReactivateButton")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSuspension("suspend")}
              className="flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Ban className="size-3.5" />
              {t("partnersSuspendButton")}
            </button>
          )}
        </div>
      </div>

      {partner.status === "rejected" && partner.rejectionReason ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">{t("partnersApplicationRejectedTitle")}</p>
          <p className="mt-1 text-sm text-destructive">{partner.rejectionReason}</p>
        </div>
      ) : null}

      {partner.status === "suspended" && partner.suspensionReason ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">{t("partnersSuspensionReasonLabel")}</p>
          <p className="mt-1 text-sm text-destructive">{partner.suspensionReason}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-md border border-border bg-card p-5 sm:grid-cols-3 lg:grid-cols-4">
        <InfoField label={t("partnersContactEmailLabel")} value={partner.contactEmail} />
        <InfoField label={t("partnersContactPhoneLabel")} value={partner.contactPhone} />
        <InfoField
          label={t("partnersContactRoleLabel")}
          value={partner.contactRole === "other" ? partner.contactRoleOther : partner.contactRole ? formatLabel(partner.contactRole) : null}
        />
        <InfoField label={t("partnersCountryLabel")} value={partner.country} />
        <InfoField label={t("partnersCreatedLabel")} value={new Date(partner.createdAt).toLocaleDateString()} />
        <InfoField label={t("partnersActivatedLabel")} value={partner.activatedAt ? new Date(partner.activatedAt).toLocaleDateString() : null} />
        <InfoField label={t("partnersDescriptionLabel")} value={partner.description} />
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">{t("partnersKybDocumentsTitle")}</p>
        <div className="flex flex-col gap-3">
          {documents.map((document) => (
            <DocumentReviewRow key={document.id} partnerId={partner.id} document={document} onChanged={reloadDocuments} />
          ))}
        </div>

        {canDecide ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">{t("partnersDecisionLabel")}</p>
            {!allApproved ? (
              <p className="mb-3 text-xs text-muted-foreground">{t("partnersDecisionHelpText")}</p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!allApproved}
                onClick={() => setConfirmDecision("approve")}
                title={!allApproved ? t("partnersApprovePartnerDisabledTitle") : undefined}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("partnersApprovePartnerButton")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDecision("reject")}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                {t("partnersRejectPartnerButton")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <PartnerContractSection
        partnerId={partner.id}
        initialContract={contract}
        initialHistory={billingHistory}
        initialUsage={usage}
        defaultTemplate={defaultContractTemplate}
      />

      <PartnerInvoicesSection partnerId={partner.id} initialInvoices={invoices} />

      <PartnerTeamSection partnerId={partner.id} initialMembers={team} initialInvitations={invitations} roles={roles} />

      <PartnerFormDialog open={editOpen} onClose={() => setEditOpen(false)} partner={editablePartner} roles={roles} />

      <ConfirmActionDialog
        open={confirmDecision === "approve"}
        onClose={closeDecisionConfirm}
        onConfirm={handleApprovePartner}
        title={`${t("partnersActivateConfirmTitleBefore")}${partner.name}${t("partnersActivateConfirmTitleAfter")}`}
        description={t("partnersActivateConfirmDescription")}
        confirmLabel={t("partnersApprovePartnerButton")}
        pendingLabel={t("partnersApprovingEllipsis")}
        pending={decisionPending}
      />

      <ConfirmActionDialog
        open={confirmDecision === "reject"}
        onClose={closeDecisionConfirm}
        onConfirm={handleRejectPartner}
        title={`${t("partnersRejectConfirmTitleBefore")}${partner.name}${t("partnersRejectConfirmTitleAfter")}`}
        description={t("partnersRejectConfirmDescription")}
        confirmLabel={t("partnersConfirmRejectionLabel")}
        pendingLabel={t("partnersRejectingEllipsis")}
        pending={decisionPending}
        confirmDisabled={decisionReason.trim().length < 5}
        variant="destructive"
      >
        <textarea
          value={decisionReason}
          onChange={(e) => setDecisionReason(e.target.value)}
          placeholder={t("partnersRejectPlaceholder")}
          rows={3}
          autoFocus
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </ConfirmActionDialog>

      <ConfirmActionDialog
        open={confirmSuspension === "suspend"}
        onClose={closeSuspensionConfirm}
        onConfirm={handleSuspend}
        title={`${t("partnersSuspendConfirmTitleBefore")}${partner.name}${t("partnersSuspendConfirmTitleAfter")}`}
        description={t("partnersSuspendConfirmDescription")}
        confirmLabel={t("partnersConfirmSuspensionLabel")}
        pendingLabel={t("partnersSuspendingEllipsis")}
        pending={suspensionPending}
        confirmDisabled={suspendReason.trim().length < 5}
        variant="destructive"
      >
        <textarea
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder={t("partnersSuspendReasonPlaceholder")}
          rows={3}
          autoFocus
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </ConfirmActionDialog>

      <ConfirmActionDialog
        open={confirmSuspension === "reactivate"}
        onClose={closeSuspensionConfirm}
        onConfirm={handleReactivate}
        title={`${t("partnersReactivateConfirmTitleBefore")}${partner.name}${t("partnersReactivateConfirmTitleAfter")}`}
        description={t("partnersReactivateConfirmDescription")}
        confirmLabel={t("partnersReactivateButton")}
        pendingLabel={t("partnersReactivatingEllipsis")}
        pending={suspensionPending}
      />
    </div>
  );
}
