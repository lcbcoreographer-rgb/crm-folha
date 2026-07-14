import type { CountRow } from "@/app/lib/metrics";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`mt-1.5 text-2xl font-extrabold ${accent || "text-ink"}`}>{value}</p>
    </div>
  );
}

export function BarList({ title, rows }: { title: string; rows: CountRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</h3>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-ink-soft">Sem dados ainda.</p>}
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-ink">{row.label}</span>
              <span className="font-semibold text-forest-700">{row.value}</span>
            </div>
            <div className="h-2 rounded-full bg-paper-dim">
              <div
                className="h-2 rounded-full bg-forest-700"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyTrend({ title, rows }: { title: string; rows: CountRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const width = 100;
  const height = 34;
  const step = rows.length > 1 ? width / (rows.length - 1) : 0;
  const points = rows
    .map((row, i) => {
      const x = rows.length > 1 ? i * step : width / 2;
      const y = height - (row.value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-24 w-full overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-forest-700)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-ink-soft">
        {rows.map((row) => (
          <span key={row.label} className="flex-1 text-center first:text-left last:text-right">
            {row.label}
          </span>
        ))}
      </div>
    </div>
  );
}
