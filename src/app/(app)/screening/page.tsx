import type { Metadata } from "next";
import { getPartnerOptions } from "@/lib/partner-options";
import { ScreeningClient } from "./ScreeningClient";

export const metadata: Metadata = {
  title: "Screening — Protegey Admin",
};

export default async function ScreeningPage() {
  const partners = await getPartnerOptions();
  return <ScreeningClient partners={partners} />;
}
