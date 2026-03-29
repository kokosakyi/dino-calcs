import type { ModuleUtilizationRow } from './ModulePrintSummary';

const CARD_VARIANTS: Array<'moment' | 'shear' | 'tension'> = ['moment', 'shear', 'moment', 'shear', 'tension', 'moment'];
const CARD_ICONS = ['M', 'V', 'δ', 'Q', 'F', 'z'];

function formatPct(r: number): string {
  if (!Number.isFinite(r)) return '—';
  return `${(r * 100).toFixed(1)}%`;
}

/** Steel-style results panel: capacity cards for limit-state utilization (wood / concrete modules). */
export function ModuleOutcomeCards({ rows, heading = 'Limit state utilization' }: { rows: ModuleUtilizationRow[]; heading?: string }) {
  const allOk = rows.length > 0 && rows.every((r) => Number.isFinite(r.ratio) && r.ratio <= 1);

  return (
    <section className="results-panel module-outcome-results">
      <div className="results-header">
        <h2>{heading}</h2>
        <span className="results-count">{allOk ? 'All checks ≤ 100%' : 'Review limits over 100%'}</span>
      </div>
      <div className="capacity-cards-grid">
        {rows.map((row, i) => {
          const ok = Number.isFinite(row.ratio) && row.ratio <= 1;
          const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
          return (
            <div key={row.label} className={`capacity-card ${variant} module-outcome-card${ok ? '' : ' module-outcome-ng'}`}>
              <div className="capacity-icon" aria-hidden>
                {CARD_ICONS[i % CARD_ICONS.length]}
              </div>
              <div className="capacity-details">
                <span className="capacity-label">{row.label}</span>
                <span className="capacity-value">{formatPct(row.ratio)}</span>
                {row.description && <span className="capacity-note module-outcome-desc">{row.description}</span>}
                <span className={`module-outcome-status ${ok ? 'pass' : 'fail'}`}>{ok ? 'OK' : 'Check'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
