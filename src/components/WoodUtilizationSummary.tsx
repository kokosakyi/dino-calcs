interface UtilRow {
  label: string;
  /** Demand/capacity or deflection ratio (≤ 1.0 OK) */
  ratio: number;
}

interface WoodUtilizationSummaryProps {
  title?: string;
  rows: UtilRow[];
}

function formatPct(r: number): string {
  if (!Number.isFinite(r)) return '—';
  return `${(r * 100).toFixed(1)}%`;
}

export function WoodUtilizationSummary({ title = 'Utilization', rows }: WoodUtilizationSummaryProps) {
  return (
    <div className="capacity-results-panel wood-utilization-summary">
      <h2>{title}</h2>
      <div className="wood-util-grid">
        {rows.map((row) => {
          const ok = Number.isFinite(row.ratio) && row.ratio <= 1;
          return (
            <div
              key={row.label}
              className={`wood-util-card ${ok ? 'wood-util-ok' : 'wood-util-ng'}`}
            >
              <span className="wood-util-label">{row.label}</span>
              <span className="wood-util-value">{formatPct(row.ratio)}</span>
              <span className="wood-util-badge">{ok ? 'OK' : 'Check'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
