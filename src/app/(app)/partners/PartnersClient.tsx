"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { PartnerFormDialog, type EditablePartner } from "./PartnerFormDialog";
import { PartnerDocumentsDialog } from "./PartnerDocumentsDialog";

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
  createdAt: string;
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

export function PartnersClient({
  partners,
  page,
  totalPages,
  total,
}: {
  partners: Partner[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogPartner, setDialogPartner] = useState<EditablePartner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [docsPartner, setDocsPartner] = useState<{ id: string; name: string; status: string } | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);

  function openCreateDialog() {
    setDialogPartner(null);
    setDialogOpen(true);
  }

  function openEditDialog(partner: Partner) {
    setDialogPartner({
      id: partner.id,
      name: partner.name,
      type: partner.type,
      plan: partner.plan,
      contactEmail: partner.contactEmail,
      contactPhone: partner.contactPhone,
      country: partner.country,
      description: partner.description,
    });
    setDialogOpen(true);
  }

  function openDocumentsDialog(partner: Partner) {
    setDocsPartner({ id: partner.id, name: partner.name, status: partner.status });
    setDocsOpen(true);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/partners?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Partners</h1>
          <p className="text-sm text-muted-foreground">
            Institutions onboarded onto Protegey — fintechs, banks, telcos and regulators.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add partner
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Plan</th>
              <th className="px-4 py-2.5 font-medium">Contact</th>
              <th className="px-4 py-2.5 font-medium">Country</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td className="px-4 py-2.5 text-foreground">{partner.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatLabel(partner.type)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatLabel(partner.plan)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{partner.contactEmail ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{partner.country ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[partner.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {formatLabel(partner.status)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openDocumentsDialog(partner)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <FileText className="size-3.5" />
                      Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditDialog(partner)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {partners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No partners yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {page} of {totalPages} — {total} partner{total === 1 ? "" : "s"} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <PartnerFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} partner={dialogPartner} />
      <PartnerDocumentsDialog open={docsOpen} onClose={() => setDocsOpen(false)} partner={docsPartner} />
    </div>
  );
}
