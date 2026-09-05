import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { CreateAdminDialogButton } from "./CreateAdminDialogButton";

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
  const [admins, roles] = await Promise.all([
    apiFetch<Admin[]>("/admins"),
    apiFetch<AssignableRole[]>("/roles?scope=core"),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Administrators</h1>
          <p className="text-sm text-muted-foreground">
            Protegey staff accounts with access to the admin panel.
          </p>
        </div>
        <CreateAdminDialogButton roles={roles} />
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Last login</th>
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
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
