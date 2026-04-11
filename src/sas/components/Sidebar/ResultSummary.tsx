import { useResultStore } from '../../stores/resultStore';
import { useState } from 'react';

function TableTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm transition-colors cursor-pointer
        ${active
          ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
        }`}
    >
      {label}
    </button>
  );
}

function fmt(value: number, decimals = 4): string {
  if (Math.abs(value) < 1e-10) return '0.0000';
  if (Math.abs(value) >= 1e4 || Math.abs(value) < 0.01) return value.toExponential(3);
  return value.toFixed(decimals);
}

export function ResultSummary() {
  const results = useResultStore(s => s.results);
  const [activeTab, setActiveTab] = useState<'displacements' | 'forces' | 'reactions'>('displacements');

  if (!results) return null;

  return (
    <div>
      <div className="flex border-b border-[var(--color-border)]">
        <TableTab label="Displacements" active={activeTab === 'displacements'} onClick={() => setActiveTab('displacements')} />
        <TableTab label="Forces" active={activeTab === 'forces'} onClick={() => setActiveTab('forces')} />
        <TableTab label="Reactions" active={activeTab === 'reactions'} onClick={() => setActiveTab('reactions')} />
      </div>

      <div className="overflow-auto text-xs font-mono">
        {activeTab === 'displacements' && (
          <table className="w-full">
            <thead>
              <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="px-2 py-1 text-left">Node</th>
                <th className="px-2 py-1 text-right">dx (mm)</th>
                <th className="px-2 py-1 text-right">dy (mm)</th>
                <th className="px-2 py-1 text-right">rz (mrad)</th>
              </tr>
            </thead>
            <tbody>
              {results.nodalDisplacements.map(nd => (
                <tr key={nd.nodeId} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)]">
                  <td className="px-2 py-0.5 text-[var(--color-text-secondary)]">{nd.nodeId}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(nd.dx * 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(nd.dy * 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(nd.rz * 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'forces' && (
          <table className="w-full">
            <thead>
              <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="px-2 py-1 text-left">Member</th>
                <th className="px-2 py-1 text-right">N (kN)</th>
                <th className="px-2 py-1 text-right">V (kN)</th>
                <th className="px-2 py-1 text-right">M (kN·m)</th>
              </tr>
            </thead>
            <tbody>
              {results.memberForces.map(mf => (
                <tr key={mf.elementId} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)]">
                  <td className="px-2 py-0.5 text-[var(--color-text-secondary)]">{mf.elementId}</td>
                  <td className="px-2 py-0.5 text-right">{fmt((mf.iEndForces[0] ?? 0) / 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt((mf.iEndForces[1] ?? 0) / 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt((mf.iEndForces[2] ?? 0) / 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'reactions' && (
          <table className="w-full">
            <thead>
              <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="px-2 py-1 text-left">Node</th>
                <th className="px-2 py-1 text-right">Fx (kN)</th>
                <th className="px-2 py-1 text-right">Fy (kN)</th>
                <th className="px-2 py-1 text-right">Mz (kN·m)</th>
              </tr>
            </thead>
            <tbody>
              {results.reactions.map(r => (
                <tr key={r.nodeId} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)]">
                  <td className="px-2 py-0.5 text-[var(--color-text-secondary)]">{r.nodeId}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(r.fx / 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(r.fy / 1000)}</td>
                  <td className="px-2 py-0.5 text-right">{fmt(r.mz / 1000)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
