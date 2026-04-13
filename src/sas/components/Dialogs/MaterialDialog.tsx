import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';
import { NumericField } from '../inputs/NumericField';

const matFieldClass =
  'flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]';

function Field({ label, value, onChange, unit }: { label: string; value: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-text-muted)] w-20">{label}</label>
      <NumericField value={value} onChange={onChange} className={matFieldClass} />
      <span className="text-xs text-[var(--color-text-muted)] w-10">{unit}</span>
    </div>
  );
}

export function MaterialDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const materials = useModelStore(s => s.materials);
  const addMaterial = useModelStore(s => s.addMaterial);
  const updateMaterial = useModelStore(s => s.updateMaterial);
  const removeMaterial = useModelStore(s => s.removeMaterial);

  const [name, setName] = useState('New Material');
  const [E, setE] = useState(200e9);
  const [G, setG] = useState(77e9);
  const [nu, setNu] = useState(0.3);
  const [density, setDensity] = useState(7850);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    addMaterial({ name, E, G, nu, density });
    setName('New Material');
  };

  const handleEdit = (id: string) => {
    const mat = materials.find(m => m.id === id);
    if (!mat) return;
    setEditingId(id);
    setName(mat.name);
    setE(mat.E);
    setG(mat.G);
    setNu(mat.nu);
    setDensity(mat.density);
  };

  const handleSave = () => {
    if (editingId) {
      updateMaterial(editingId, { name, E, G, nu, density });
      setEditingId(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-5 w-96 shadow-xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">Materials</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"><X size={16} /></button>
            </Dialog.Close>
          </div>

          <div className="space-y-1 mb-4 max-h-40 overflow-y-auto">
            {materials.map(m => (
              <div key={m.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[var(--color-bg-hover)] text-sm">
                <span className="text-[var(--color-text-secondary)] cursor-pointer" onClick={() => handleEdit(m.id)}>
                  {m.name} (E={( m.E / 1e9).toFixed(0)} GPa)
                </span>
                <button
                  onClick={() => removeMaterial(m.id)}
                  className="text-[var(--color-danger)] hover:underline text-xs cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] pt-3 space-y-2.5">
            <div className="text-sm text-[var(--color-text-muted)] font-medium">
              {editingId ? 'Edit Material' : 'Add Material'}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--color-text-muted)] w-20">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <Field label="E (Young's)" value={E} onChange={setE} unit="Pa" />
            <Field label="G (Shear)" value={G} onChange={setG} unit="Pa" />
            <Field label="ν (Poisson)" value={nu} onChange={setNu} unit="" />
            <Field label="Density" value={density} onChange={setDensity} unit="kg/m³" />

            <button
              onClick={editingId ? handleSave : handleAdd}
              className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              {editingId ? 'Save Changes' : <><Plus size={14} /> Add Material</>}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
