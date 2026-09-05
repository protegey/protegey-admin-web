"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PartnerFormDialog, type EditablePartner } from "./PartnerFormDialog";
import { deletePartnerAction } from "./actions";

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
  heading = "Partners",
  description = "Institutions onboarded onto Protegey — fintechs, banks, telcos and regulators.",
  illustration,
}: {
  partners: Partner[];
  page: number;
  totalPages: number;
  total: number;
  heading?: string;
  description?: string;
  illustration?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [dialogPartner, setDialogPartner] = useState<EditablePartner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [deletePending, setDeletePending] = useState(false);

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

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(nextPage: number) {
    updateParams((params) => params.set("page", String(nextPage)));
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams((params) => {
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletePending(true);
    const result = await deletePartnerAction(deleteTarget.id);
    setDeletePending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Partner deleted.");
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {illustration}
          <div>
            <h1 className="text-xl font-semibold text-foreground">{heading}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add partner
        </button>
      </div>

      <form onSubmit={submitSearch} className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone or country…"
            className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Search
        </button>
      </form>

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
                <td className="px-4 py-2.5 text-foreground">
                  <Link href={`/partners/${partner.id}`} className="hover:text-primary hover:underline">
                    {partner.name}
                  </Link>
                </td>
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
                    <Link
                      href={`/partners/${partner.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Eye className="size-3.5" />
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditDialog(partner)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(partner)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {partners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No partners found.
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
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this partner?"
        description="This removes the partner from every list and blocks their team from signing in. Records are kept for audit purposes."
        confirmPhrase={deleteTarget?.name ?? ""}
        pending={deletePending}
      />
    </div>
  );
}
