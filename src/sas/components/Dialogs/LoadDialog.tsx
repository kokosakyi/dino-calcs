import { useState } from 'react';
import { X } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { NumericField } from '../inputs/NumericField';

const loadNumClass =
  'flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]';

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-text-muted)] w-8">{label}</label>
      <NumericField value={value} onChange={onChange} className={loadNumClass} />
    </div>
  );
}

export function PointLoadDialog() {
  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const activeTool = useUIStore(s => s.activeTool);
  const activeLoadCaseId = useUIStore(s => s.activeLoadCaseId);
  const setSelectedNodes = useUIStore(s => s.setSelectedNodes);
  const addPointLoad = useModelStore(s => s.addPointLoad);

  const nodeId = selectedNodeIds[0];
  const isOpen = activeTool === 'pointLoad' && !!nodeId;

  const [fx, setFx] = useState(0);
  const [fy, setFy] = useState(-10000);
  const [fz, setFz] = useState(0);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const [mz, setMz] = useState(0);

  const handleApply = () => {
    if (!nodeId) return;
    addPointLoad({ nodeId, fx, fy, fz, mx, my, mz, loadCaseId: activeLoadCaseId });
    setSelectedNodes([]);
  };

  const handleClose = () => {
    setSelectedNodes([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-4 w-72 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          Point Load at {nodeId}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="text-sm text-[var(--color-text-muted)] mb-1">Forces (N)</div>
        <NumField label="Fx" value={fx} onChange={setFx} />
        <NumField label="Fy" value={fy} onChange={setFy} />
        <NumField label="Fz" value={fz} onChange={setFz} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-[var(--color-text-muted)] mb-1">Moments (N·m)</div>
        <NumField label="Mx" value={mx} onChange={setMx} />
        <NumField label="My" value={my} onChange={setMy} />
        <NumField label="Mz" value={mz} onChange={setMz} />
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer"
      >
        Apply Load
      </button>

      <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-snug">
        Click another node to add a load, or press Esc to exit.
      </p>
    </div>
  );
}

export function DistributedLoadDialog() {
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const activeTool = useUIStore(s => s.activeTool);
  const activeLoadCaseId = useUIStore(s => s.activeLoadCaseId);
  const setSelectedElements = useUIStore(s => s.setSelectedElements);
  const addDistributedLoad = useModelStore(s => s.addDistributedLoad);

  const elementId = selectedElementIds[0];
  const isOpen = activeTool === 'distributedLoad' && !!elementId;

  const [wy1, setWy1] = useState(-5000);
  const [wy2, setWy2] = useState(-5000);
  const [wx1, setWx1] = useState(0);
  const [wx2, setWx2] = useState(0);

  const handleApply = () => {
    if (!elementId) return;
    addDistributedLoad({
      elementId,
      wx1, wy1, wz1: 0,
      wx2, wy2, wz2: 0,
      loadCaseId: activeLoadCaseId,
    });
    setSelectedElements([]);
  };

  const handleClose = () => {
    setSelectedElements([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-4 w-72 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          Distributed Load on {elementId}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-[var(--color-text-muted)]">Start (i-end) (N/m)</div>
        <NumField label="wx" value={wx1} onChange={setWx1} />
        <NumField label="wy" value={wy1} onChange={setWy1} />
        <div className="text-sm text-[var(--color-text-muted)] mt-2">End (j-end) (N/m)</div>
        <NumField label="wx" value={wx2} onChange={setWx2} />
        <NumField label="wy" value={wy2} onChange={setWy2} />
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer"
      >
        Apply Load
      </button>

      <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-snug">
        Click another member to add a load, or press Esc to exit.
      </p>
    </div>
  );
}
