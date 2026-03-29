import { useCallback, type ReactNode } from 'react';

export interface ModuleUtilizationRow {
  label: string;
  ratio: number;
  description?: string;
}

function formatUtilPct(r: number): string {
  if (!Number.isFinite(r)) return '—';
  return `${(r * 100).toFixed(1)}%`;
}

/** Utilization summary in steel-style table form (screen + print). */
export function ModuleUtilizationTable({ rows }: { rows: ModuleUtilizationRow[] }) {
  return (
    <div className="summary-section properties-table properties-table-print module-utilization-table">
      <h3>Utilization</h3>
      <table>
        <tbody>
          {rows.map((row) => {
            const ok = Number.isFinite(row.ratio) && row.ratio <= 1;
            const notes =
              row.description !== undefined
                ? `${row.description} (${ok ? 'OK' : 'Check'})`
                : ok
                  ? 'OK'
                  : 'Check';
            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{formatUtilPct(row.ratio)}</td>
                <td>{notes}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ModulePrintSummaryProps {
  printTitle: string;
  standardLine: string;
  footerLeft: string;
  footerRight: string;
  children: ReactNode;
}

/** Print-to-PDF shell matching steel DesignSummary (print-actions, print-container, design-summary-print). */
export function ModulePrintSummary({ printTitle, standardLine, footerLeft, footerRight, children }: ModulePrintSummaryProps) {
  const handlePrint = useCallback(() => {
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  return (
    <div className="design-summary">
      <div className="print-actions">
        <button type="button" className="print-btn" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print to PDF
        </button>
      </div>

      <div className="print-container">
        <div className="print-header">
          <h1>{printTitle}</h1>
          <p className="subtitle">{standardLine}</p>
          <p className="project-info">
            Generated:{' '}
            {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="design-summary-print">
          {children}
          <div className="print-footer">
            <span>{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
