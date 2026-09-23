"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Pencil, Search, Eye } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { PartnerFormDialog, type EditablePartner } from "./PartnerFormDialog";
import type { AssignableRole } from "./actions";
import { useLang } from "@/lib/i18n/LangProvider";
import type { StringKey } from "@/lib/i18n/strings";

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

const STATUS_LABEL_KEYS: Record<string, StringKey> = {
  pending_verification: "partnersStatusPendingVerification",
  pending: "partnersStatusPending",
  active: "partnersStatusActive",
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

export function PartnersClient({
  partners,
  page,
  totalPages,
  total,
  heading,
  description,
  illustration,
  initialStatus = "all",
  roles,
}: {
  partners: Partner[];
  page: number;
  totalPages: number;
  total: number;
  heading: string;
  description: string;
  illustration?: React.ReactNode;
  initialStatus?: string;
  roles: AssignableRole[];
}) {
  const { t } = useLang();
  const statusLabel = (status: string) => {
    const key = STATUS_LABEL_KEYS[status];
    return key ? t(key) : formatLabel(status);
  };
  const typeLabel = (type: string) => {
    const key = TYPE_LABEL_KEYS[type];
    return key ? t(key) : formatLabel(type);
  };
  const STATUS_OPTIONS = [
    { value: "all", label: t("partnersStatusAll") },
    { value: "pending_verification", label: t("partnersStatusPendingVerification") },
    { value: "pending", label: t("partnersStatusPending") },
    { value: "active", label: t("partnersStatusActive") },
    { value: "suspended", label: t("partnersStatusSuspended") },
    { value: "inactive", label: t("partnersStatusInactive") },
    { value: "rejected", label: t("partnersStatusRejected") },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(
    initialStatus ?? searchParams.get("status") ?? "all",
  );
  const [dialogPartner, setDialogPartner] = useState<EditablePartner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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

  function handleStatusChange(next: string) {
    setStatusFilter(next);
    updateParams((params) => {
      if (next && next !== "all") {
        params.set("status", next);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
    });
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
          {t("partnersAddButton")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="flex max-w-sm flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("partnersSearchPlaceholder")}
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t("searchLabel")}
          </button>
        </form>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          {t("partnersStatusLabel")}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative overflow-hidden rounded-md border border-border">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <div className="flex items-center gap-2">
              <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <span className="text-sm text-muted-foreground">{t("partnersLoadingLabel")}</span>
            </div>
          </div>
        )}
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t("partnersNameColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersTypeColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersPlanWord")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersContactColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersCountryColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersCreatedColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t("partnersStatusLabel")}</th>
              <th className="px-4 py-2.5 font-medium text-right">{t("partnersActionsColumn")}</th>
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
                <td className="px-4 py-2.5 text-muted-foreground">{typeLabel(partner.type)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatLabel(partner.plan)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <div>{partner.contactEmail ?? "—"}</div>
                  {partner.contactPhone ? <div className="text-xs">{partner.contactPhone}</div> : null}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{partner.country ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[partner.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {statusLabel(partner.status)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/partners/${partner.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Eye className="size-3.5" />
                      {t("partnersViewButton")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditDialog(partner)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-3.5" />
                      {t("editButton")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {partners.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  {t("partnersEmptyMessage")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        itemLabel={t("partnersWord")}
        onPageChange={goToPage}
      />

      <PartnerFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} partner={dialogPartner} roles={roles} />
    </div>
  );
}
