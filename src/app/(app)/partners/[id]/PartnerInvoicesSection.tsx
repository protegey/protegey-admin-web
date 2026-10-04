"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Send, CircleCheck } from "lucide-react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { useLang } from "@/lib/i18n/LangProvider";
import type { StringKey } from "@/lib/i18n/strings";
import {
  generateInvoiceAction,
  sendInvoiceReminderAction,
  markInvoicePaidAction,
  type Invoice,
  type InvoiceStatus,
} from "./invoice-actions";

const inputClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  sent: "bg-amber-500/10 text-amber-600",
  paid: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL_KEYS: Record<InvoiceStatus, StringKey> = {
  sent: "invoiceStatusSent",
  paid: "invoiceStatusPaid",
  overdue: "invoiceStatusOverdue",
};

function isInvoiceOverdue(invoice: Invoice): boolean {
  return invoice.status === "sent" && new Date(invoice.dueDate) < new Date();
}

export function PartnerInvoicesSection({ partnerId, initialInvoices }: { partnerId: string; initialInvoices: Invoice[] }) {
  const { t, lang } = useLang();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [invoices, setInvoices] = useState(initialInvoices);
  const [generating, setGenerating] = useState(false);
  const [reminderPendingId, setReminderPendingId] = useState<string | null>(null);
  const [markPaidTarget, setMarkPaidTarget] = useState<Invoice | null>(null);
  const [markPaidPending, setMarkPaidPending] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateInvoiceAction(partnerId);
    setGenerating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setInvoices((prev) => [result.data!, ...prev]);
      toast.success(t("invoiceGeneratedToast"));
    }
  }

  async function handleSendReminder(invoiceId: string) {
    setReminderPendingId(invoiceId);
    const result = await sendInvoiceReminderAction(partnerId, invoiceId);
    setReminderPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("invoiceReminderSentToast"));
  }

  async function handleMarkPaid() {
    if (!markPaidTarget) return;
    setMarkPaidPending(true);
    const result = await markInvoicePaidAction(partnerId, markPaidTarget.id, {
      paymentReference: paymentReference.trim() || undefined,
    });
    setMarkPaidPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.data) {
      setInvoices((prev) => prev.map((invoice) => (invoice.id === result.data!.id ? result.data! : invoice)));
      toast.success(t("invoiceMarkedPaidToast"));
    }
    setMarkPaidTarget(null);
    setPaymentReference("");
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("invoicesSectionTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("invoicesSectionHint")}</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <FileText className="size-4" />
          {generating ? t("invoiceGeneratingEllipsis") : t("invoiceGenerateButton")}
        </button>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">{t("invoicesEmptyState")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t("invoiceColNumber")}</th>
                <th className="px-3 py-2 font-medium">{t("invoiceColPeriod")}</th>
                <th className="px-3 py-2 font-medium">{t("invoiceColTotal")}</th>
                <th className="px-3 py-2 font-medium">{t("invoiceColDueDate")}</th>
                <th className="px-3 py-2 font-medium">{t("invoiceColStatus")}</th>
                <th className="px-3 py-2 font-medium text-right">{t("partnersActionsColumn")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => {
                const overdue = isInvoiceOverdue(invoice);
                return (
                  <tr key={invoice.id}>
                    <td className="px-3 py-2.5 font-mono text-xs text-foreground">{invoice.invoiceNumber}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {new Date(invoice.billingPeriodStart).toLocaleDateString(locale)} – {new Date(invoice.billingPeriodEnd).toLocaleDateString(locale)}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {Number(invoice.totalDue).toLocaleString(locale, { minimumFractionDigits: 2 })} {invoice.currency}
                    </td>
                    <td className={`px-3 py-2.5 text-xs ${overdue ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
                      {new Date(invoice.dueDate).toLocaleDateString(locale)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? STATUS_STYLES.overdue : STATUS_STYLES[invoice.status]}`}>
                        {t(overdue ? STATUS_LABEL_KEYS.overdue : STATUS_LABEL_KEYS[invoice.status])}
                      </span>
                      {invoice.status === "paid" && invoice.paidAt ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {t("invoicePaidOnPrefix")}
                          {new Date(invoice.paidAt).toLocaleDateString(locale)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-2">
                        {invoice.status !== "paid" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendReminder(invoice.id)}
                              disabled={reminderPendingId === invoice.id}
                              title={t("invoiceSendReminderButton")}
                              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                            >
                              <Send className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setMarkPaidTarget(invoice)}
                              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                              <CircleCheck className="size-3.5" />
                              {t("invoiceMarkPaidButton")}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("invoiceAlreadyPaidLabel")}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmActionDialog
        open={markPaidTarget !== null}
        onClose={() => {
          setMarkPaidTarget(null);
          setPaymentReference("");
        }}
        onConfirm={handleMarkPaid}
        title={t("invoiceMarkPaidConfirmTitle")}
        description={markPaidTarget ? `${markPaidTarget.invoiceNumber} — ${Number(markPaidTarget.totalDue).toLocaleString(locale)} ${markPaidTarget.currency}` : undefined}
        confirmLabel={t("invoiceMarkPaidButton")}
        pendingLabel={t("invoiceMarkingPaidEllipsis")}
        pending={markPaidPending}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("invoicePaymentReferenceLabel")}</span>
          <input
            className={inputClass}
            placeholder={t("invoicePaymentReferencePlaceholder")}
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />
        </label>
        <p className="text-[11px] text-muted-foreground">{t("invoiceMarkPaidEmailNotice")}</p>
      </ConfirmActionDialog>
    </div>
  );
}
