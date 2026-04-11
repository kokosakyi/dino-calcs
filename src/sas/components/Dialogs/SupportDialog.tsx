import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { getDofPerNodeForModel } from '../../solver/dofScheme';

export function SupportDialog() {
  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const activeTool = useUIStore(s => s.activeTool);
  const setActiveTool = useUIStore(s => s.setActiveTool);
  const setSupport = useModelStore(s => s.setSupport);
  const removeSupport = useModelStore(s => s.removeSupport);
  const elements = useModelStore(s => s.elements);
  const supportAtNode = useModelStore(s =>
    selectedNodeIds[0] ? s.supports.find(sp => sp.nodeId === selectedNodeIds[0]) : undefined,
  );

  const nodeId = selectedNodeIds[0];
  const isOpen = activeTool === 'support' && !!nodeId;

  const dof = getDofPerNodeForModel(elements);
  const existing = supportAtNode;

  const [dx, setDx] = useState(true);
  const [dy, setDy] = useState(true);
  const [dz, setDz] = useState(false);
  const [rx, setRx] = useState(false);
  const [ry, setRy] = useState(false);
  const [rz, setRz] = useState(false);

  useEffect(() => {
    if (!nodeId || !isOpen) return;
    const ex = supportAtNode;
    if (ex) {
      setDx(ex.dx);
      setDy(ex.dy);
      setDz(ex.dz);
      setRx(ex.rx);
      setRy(ex.ry);
      setRz(ex.rz);
    } else {
      if (dof === 6) {
        setDx(true); setDy(true); setDz(true); setRx(false); setRy(false); setRz(false);
      } else if (dof === 3) {
        setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(true);
      } else if (dof === 2) {
        setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
      } else {
        setDx(true); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
      }
    }
  }, [nodeId, isOpen, dof, supportAtNode]);

  const applyPreset = (preset: 'fixed' | 'pinned' | 'rollerX' | 'rollerY') => {
    switch (preset) {
      case 'fixed':
        if (dof === 6) {
          setDx(true); setDy(true); setDz(true); setRx(true); setRy(true); setRz(true);
        } else if (dof === 3) {
          setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(true);
        } else if (dof === 2) {
          setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
        } else {
          setDx(true); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        }
        break;
      case 'pinned':
        if (dof === 6) {
          setDx(true); setDy(true); setDz(true); setRx(false); setRy(false); setRz(false);
        } else if (dof === 3) {
          setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
        } else if (dof === 2) {
          setDx(true); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
        } else {
          setDx(true); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        }
        break;
      case 'rollerX':
        if (dof === 6) {
          setDx(false); setDy(true); setDz(true); setRx(false); setRy(false); setRz(false);
        } else if (dof === 3) {
          setDx(false); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
        } else if (dof === 2) {
          setDx(false); setDy(true); setDz(false); setRx(false); setRy(false); setRz(false);
        } else {
          setDx(false); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        }
        break;
      case 'rollerY':
        if (dof === 6) {
          setDx(true); setDy(false); setDz(true); setRx(false); setRy(false); setRz(false);
        } else if (dof === 3) {
          setDx(true); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        } else if (dof === 2) {
          setDx(true); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        } else {
          setDx(false); setDy(false); setDz(false); setRx(false); setRy(false); setRz(false);
        }
        break;
    }
  };

  const handleApply = () => {
    if (!nodeId) return;
    if (!dx && !dy && !dz && !rx && !ry && !rz) {
      removeSupport(nodeId);
    } else {
      setSupport({ nodeId, dx, dy, dz, rx, ry, rz });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setActiveTool('select');
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-4 w-80 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-sm font-semibold text-[var(--color-text-primary)]">
              Support at {nodeId}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {dof === 3 && (
            <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-snug">
              2D frame members use translation X/Y and rotation Z (in-plane). Translation Z and rotations X/Y are not used by the solver.
            </p>
          )}

          <div className="flex gap-2 mb-3">
            {(['fixed', 'pinned', 'rollerX', 'rollerY'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => applyPreset(p)}
                className="flex-1 py-2 text-sm bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] rounded hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)] transition-colors cursor-pointer capitalize"
              >
                {p === 'rollerX' ? 'Roller X' : p === 'rollerY' ? 'Roller Y' : p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Translation X', val: dx, set: setDx },
              { label: 'Translation Y', val: dy, set: setDy },
              { label: 'Translation Z', val: dz, set: setDz },
              { label: 'Rotation X', val: rx, set: setRx },
              { label: 'Rotation Y', val: ry, set: setRy },
              { label: 'Rotation Z', val: rz, set: setRz },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={e => set(e.target.checked)}
                  className="accent-[var(--color-accent)]"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer"
            >
              Apply
            </button>
            {existing && (
              <button
                type="button"
                onClick={() => { removeSupport(nodeId); }}
                className="py-2 px-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)] rounded hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
