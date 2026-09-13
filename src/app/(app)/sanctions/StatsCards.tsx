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
  const byTypePerson = stats.byType.find((t) => t.type === "person")?.count ?? 0;
  const byTypeBusiness = stats.byType.find((t) => t.type === "business")?.count ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card label="Active" value={stats.active} />
      <Card label="Delisted" value={stats.delisted} />
      <Card label="Persons" value={byTypePerson} />
      <Card label="Businesses" value={byTypeBusiness} />
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
