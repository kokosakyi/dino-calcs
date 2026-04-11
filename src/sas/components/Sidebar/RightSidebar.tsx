import { useResultStore } from '../../stores/resultStore';
import { useUIStore } from '../../stores/uiStore';
import { ResultSummary } from './ResultSummary';
import { SingleMemberChart } from '../Results/SingleMemberChart';
import { AlertTriangle, Info } from 'lucide-react';

function ScaleSlider({ label, value, onChange, min = 1, max = 500, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="px-4 py-3 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
        <span className="text-sm font-mono text-[var(--color-text-secondary)]">{Number(value).toFixed(step < 1 ? 1 : 0)}x</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-accent)] h-1.5"
      />
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  const lines = message.split('\n').filter(Boolean);

  return (
    <div className="m-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-danger)]/10 border-b border-[var(--color-danger)]/20">
        <AlertTriangle size={14} className="text-[var(--color-danger)] shrink-0" />
        <span className="text-sm font-medium text-[var(--color-danger)]">Analysis Failed</span>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[var(--color-danger)] mt-0.5 shrink-0">•</span>
            <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FORCE_VIEWS = ['axial', 'shear', 'moment', 'torsion'] as const;

export function RightSidebar() {
  const results = useResultStore(s => s.results);
  const solverError = useResultStore(s => s.solverError);
  const resultView = useUIStore(s => s.resultView);
  const deformationScale = useUIStore(s => s.deformationScale);
  const setDeformationScale = useUIStore(s => s.setDeformationScale);
  const diagramScale = useUIStore(s => s.diagramScale);
  const setDiagramScale = useUIStore(s => s.setDiagramScale);

  const showDiagramScale = results && FORCE_VIEWS.includes(resultView as any);

  return (
    <div className="w-72 bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] flex flex-col overflow-hidden select-none">
      <div className="px-4 py-3 text-base font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)]">
        Results
      </div>

      {solverError && <ErrorDisplay message={solverError} />}

      {results && resultView === 'deformed' && (
        <ScaleSlider
          label="Deformation Scale"
          value={deformationScale}
          onChange={setDeformationScale}
        />
      )}

      {showDiagramScale && (
        <ScaleSlider
          label="Diagram Scale"
          value={diagramScale}
          onChange={setDiagramScale}
          min={0.1}
          max={10}
          step={0.1}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {results ? (
          <>
            <ResultSummary />
            <div className="border-t border-[var(--color-border)]">
              <SingleMemberChart />
            </div>
          </>
        ) : !solverError ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center gap-3">
            <Info size={24} className="text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              No results yet. Build a model and click <strong className="text-[var(--color-text-secondary)]">Solve</strong> to run the analysis.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
