import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getPartnerDocuments, type PartnerDocument } from "../documents-actions";
import { PartnerDetailClient } from "./PartnerDetailClient";

export const metadata: Metadata = {
  title: "Partner details — Protegey Admin",
};

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
  rejectionReason: string | null;
  createdAt: string;
  activatedAt: string | null;
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [partner, documents] = await Promise.all([
    apiFetch<Partner>(`/partners/${id}`),
    getPartnerDocuments(id) as Promise<PartnerDocument[]>,
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        href="/partners"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to partners
      </Link>
      <PartnerDetailClient partner={partner} documents={documents} />
    </div>
  );
}
