import type { Metadata } from "next";
import { ScreeningClient } from "./ScreeningClient";

export const metadata: Metadata = {
  title: "Screening — Protegey Admin",
};

export default function ScreeningPage() {
  return <ScreeningClient />;
}
