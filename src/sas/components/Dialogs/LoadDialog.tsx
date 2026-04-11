import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-text-muted)] w-8">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
        step="100"
      />
    </div>
  );
}

export function PointLoadDialog() {
  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const activeTool = useUIStore(s => s.activeTool);
  const activeLoadCaseId = useUIStore(s => s.activeLoadCaseId);
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
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-4 w-72 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-sm font-semibold text-[var(--color-text-primary)]">
              Point Load at {nodeId}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer">
                <X size={16} />
              </button>
            </Dialog.Close>
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
            onClick={handleApply}
            className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer"
          >
            Apply Load
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DistributedLoadDialog() {
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const activeTool = useUIStore(s => s.activeTool);
  const activeLoadCaseId = useUIStore(s => s.activeLoadCaseId);
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
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-4 w-72 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-sm font-semibold text-[var(--color-text-primary)]">
              Distributed Load on {elementId}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer">
                <X size={16} />
              </button>
            </Dialog.Close>
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
            onClick={handleApply}
            className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer"
          >
            Apply Load
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
