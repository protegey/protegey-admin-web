import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import { CreatePartnerForm } from "./CreatePartnerForm";

export const metadata: Metadata = {
  title: "Partners — Protegey Admin",
};

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  contactEmail: string | null;
  country: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  pending_verification: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  inactive: "bg-destructive/10 text-destructive",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function PartnersPage() {
  const partners = await apiFetch<Partner[]>("/partners");

  return (
    <div className="min-h-svh bg-background">
      <AppHeader active="partners" />

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Partners</h1>
          <p className="text-sm text-muted-foreground">
            Institutions onboarded onto Protegey — fintechs, banks, telcos and regulators.
          </p>
        </div>

        <CreatePartnerForm />

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Contact</th>
                <th className="px-4 py-2.5 font-medium">Country</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="px-4 py-2.5 text-foreground">{partner.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatLabel(partner.type)}</td>
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
                </tr>
              ))}
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No partners yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
