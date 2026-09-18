import type { Metadata } from "next";
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

export interface AssignableRole {
  id: string;
  name: string;
  displayName: string;
}

export default async function AdminsPage() {
  const [admins, roles, invitations, lang] = await Promise.all([
    apiFetch<Admin[]>("/admins"),
    apiFetch<AssignableRole[]>("/roles?scope=core"),
    getPendingAdminInvitations(),
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

      {invitations.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t(lang, "adminsPendingInvitationColumn")}</th>
                <th className="px-4 py-2.5 font-medium">{t(lang, "adminsRoleColumn")}</th>
                <th className="px-4 py-2.5 font-medium text-right">{t(lang, "adminsActionsColumn")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((invitation) => (
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

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsNameColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsEmailColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsRoleColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsStatusColumn")}</th>
              <th className="px-4 py-2.5 font-medium">{t(lang, "adminsLastLoginColumn")}</th>
              <th className="px-4 py-2.5 font-medium text-right">{t(lang, "adminsActionsColumn")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin) => (
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
    </div>
  );
}
