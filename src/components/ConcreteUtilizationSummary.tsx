interface UtilRow {
  label: string;
  ratio: number;
  description?: string;
}

interface ConcreteUtilizationSummaryProps {
  title?: string;
  rows: UtilRow[];
}

function formatPct(r: number): string {
  if (!Number.isFinite(r)) return '—';
  return `${(r * 100).toFixed(1)}%`;
}

export function ConcreteUtilizationSummary({ title = 'Utilization', rows }: ConcreteUtilizationSummaryProps) {
  return (
    <div className="capacity-results-panel concrete-utilization-summary">
      <h2>{title}</h2>
      <div className="concrete-util-grid">
        {rows.map((row) => {
          const ok = Number.isFinite(row.ratio) && row.ratio <= 1;
          return (
            <div
              key={row.label}
              className={`concrete-util-card ${ok ? 'concrete-util-ok' : 'concrete-util-ng'}`}
            >
              <span className="concrete-util-label">{row.label}</span>
              <span className="concrete-util-value">{formatPct(row.ratio)}</span>
              {row.description && <span className="concrete-util-desc">{row.description}</span>}
              <span className="concrete-util-badge">{ok ? 'OK' : 'Check'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
