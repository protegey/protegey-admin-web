import type { Metadata } from "next";
import { getPlatformSettings } from "./actions";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings — Protegey Admin",
};

export default async function SettingsPage() {
  const settings = await getPlatformSettings();
  return <SettingsClient initialSettings={settings} />;
}
