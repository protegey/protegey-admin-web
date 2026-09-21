import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { CreateAdminDialogButton } from "./CreateAdminDialogButton";
import { ResendAdminInvitationButton } from "./ResendAdminInvitationButton";
import { EditAdminInvitationDialogButton } from "./EditAdminInvitationDialogButton";
import { AdminActions } from "./AdminActions";
import { getPendingAdminInvitations } from "./actions";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";

export const metadata: Metadata = {
  title: "Administrators — Protegey Admin",
};

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: { name: string; displayName: string }[];
}

interface PaginatedAdmins {
  data: Admin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignableRole {
  id: string;
  name: string;
  displayName: string;
}

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; invitationPage?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const invitationPage = Math.max(1, Number(params.invitationPage) || 1);
  const [admins, roles, invitations, lang] = await Promise.all([
    apiFetch<PaginatedAdmins>(`/admins?page=${page}&limit=20`),
    apiFetch<AssignableRole[]>("/roles?scope=core"),
    getPendingAdminInvitations(invitationPage),
    getLang(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t(lang, "adminsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t(lang, "adminsSubtitle")}</p>
        </div>
        <CreateAdminDialogButton roles={roles} />
      </div>

      {invitations.data.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t(lang, "adminsPendingInvitationColumn")}</th>
                <th className="px-4 py-2.5 font-medium">{t(lang, "adminsRoleColumn")}</th>
                <th className="px-4 py-2.5 font-medium">{t(lang, "adminsInvitationExpiresColumn")}</th>
                <th className="px-4 py-2.5 font-medium text-right">{t(lang, "adminsActionsColumn")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.data.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-foreground">
                      {invitation.firstName} {invitation.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{invitation.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {invitation.roles.map((role) => role.displayName).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-2">
                      <EditAdminInvitationDialogButton invitation={invitation} roles={roles} />
                      <ResendAdminInvitationButton invitationId={invitation.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {invitations.totalPages > 1 ? (
        <Pagination page={invitations.page} totalPages={invitations.totalPages} total={invitations.total} param="invitationPage" otherParam="page" otherPage={page} lang={lang} />
      ) : null}

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsNameColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsEmailColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsRoleColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsStatusColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsLastLoginColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsCreatedColumn")}</th>
              <th className="px-4 py-2.5 font-medium text-right">{t(lang, "adminsActionsColumn")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.data.map((admin) => (
              <tr key={admin.id}>
                <td className="px-4 py-2.5 text-foreground">
                  {admin.firstName} {admin.lastName}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {admin.roles.map((role) => role.displayName).join(", ")}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      admin.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {admin.isActive ? t(lang, "adminsStatusActive") : t(lang, "adminsStatusInactive")}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : t(lang, "neverLabel")}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end">
                    <AdminActions userId={admin.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {admins.totalPages > 1 ? (
        <Pagination page={admins.page} totalPages={admins.totalPages} total={admins.total} param="page" otherParam="invitationPage" otherPage={invitationPage} lang={lang} />
      ) : null}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  param,
  otherParam,
  otherPage,
  lang,
}: {
  page: number;
  totalPages: number;
  total: number;
  param: string;
  otherParam: string;
  otherPage: number;
  lang: "en" | "fr";
}) {
  const href = (nextPage: number) => `?${param}=${nextPage}&${otherParam}=${otherPage}`;
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <p>{t(lang, "pageWord")} {page} {t(lang, "ofWord")} {totalPages} — {total}</p>
      <div className="flex gap-2">
        <Link aria-disabled={page <= 1} href={href(Math.max(1, page - 1))} className={`flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}>
          <ChevronLeft className="size-4" /> {t(lang, "previousPageButton")}
        </Link>
        <Link aria-disabled={page >= totalPages} href={href(Math.min(totalPages, page + 1))} className={`flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}>
          {t(lang, "nextPageButton")} <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
