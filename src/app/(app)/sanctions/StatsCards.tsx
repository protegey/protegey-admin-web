"use client";

import { useLang } from "@/lib/i18n/LangProvider";

interface Props {
  stats: {
    total: number;
    active: number;
    delisted: number;
    byType: { type: string; count: number }[];
    bySource: { source: string; count: number }[];
  };
}

export function StatsCards({ stats }: Props) {
  const { t } = useLang();
  const byTypePerson = stats.byType.find((entry) => entry.type === "person")?.count ?? 0;
  const byTypeBusiness = stats.byType.find((entry) => entry.type === "business")?.count ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card label={t("sanctionsStatActive")} value={stats.active} />
      <Card label={t("sanctionsStatDelisted")} value={stats.delisted} />
      <Card label={t("sanctionsStatPersons")} value={byTypePerson} />
      <Card label={t("sanctionsStatBusinesses")} value={byTypeBusiness} />
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
