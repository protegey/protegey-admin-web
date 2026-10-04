"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export type InvoiceStatus = "sent" | "paid" | "overdue";

export interface InvoiceLineItem {
  description: string;
  detail: string | null;
  quantity: number | null;
  unitPrice: string | null;
  amount: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partnerId: string;
  billToName: string;
  billToEmail: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: InvoiceLineItem[];
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalDue: string;
  usageIncluded: string;
  usageConsumed: string;
  usageOverage: string;
  usageBonusApplied: string;
  status: InvoiceStatus;
  paidAt: string | null;
  paymentReference: string | null;
  markedPaidByUserId: string | null;
  createdAt: string;
}

export interface ActionResult<T = undefined> {
  error?: string;
  success?: boolean;
  data?: T;
}

export async function getPartnerInvoices(partnerId: string): Promise<Invoice[]> {
  return apiFetch<Invoice[]>(`/partners/${partnerId}/invoices`);
}

export async function getPartnerInvoice(partnerId: string, invoiceId: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/partners/${partnerId}/invoices/${invoiceId}`);
}

export async function generateInvoiceAction(partnerId: string, billToEmailOverride?: string): Promise<ActionResult<Invoice>> {
  const lang = await getLang();
  try {
    const invoice = await apiFetch<Invoice>(`/partners/${partnerId}/invoices`, {
      method: "POST",
      body: billToEmailOverride ? { billToEmailOverride } : {},
    });
    return { success: true, data: invoice };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
}

export async function sendInvoiceReminderAction(partnerId: string, invoiceId: string, toEmailOverride?: string): Promise<ActionResult> {
  const lang = await getLang();
  try {
    await apiFetch(`/partners/${partnerId}/invoices/${invoiceId}/reminder`, {
      method: "POST",
      body: toEmailOverride ? { toEmailOverride } : {},
    });
    return { success: true };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
}

/** Records the invoice as paid and triggers a one-time payment-confirmation email (with the
 * now-stamped PDF attached) to the partner — see InvoiceDeliveryService.markAsPaid. */
export async function markInvoicePaidAction(
  partnerId: string,
  invoiceId: string,
  input: { paymentReference?: string; paidAt?: string },
): Promise<ActionResult<Invoice>> {
  const lang = await getLang();
  try {
    const invoice = await apiFetch<Invoice>(`/partners/${partnerId}/invoices/${invoiceId}/mark-paid`, {
      method: "PATCH",
      body: input,
    });
    return { success: true, data: invoice };
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : t(lang, "somethingWentWrongMessage") };
  }
}
