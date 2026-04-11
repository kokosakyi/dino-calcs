import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus } from 'lucide-react';
import { useModelStore } from '../../stores/modelStore';

function Field({ label, value, onChange, unit }: { label: string; value: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-text-muted)] w-16">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
        step="any"
      />
      <span className="text-xs text-[var(--color-text-muted)] w-10">{unit}</span>
    </div>
  );
}

export function SectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sections = useModelStore(s => s.sections);
  const materials = useModelStore(s => s.materials);
  const addSection = useModelStore(s => s.addSection);
  const updateSection = useModelStore(s => s.updateSection);
  const removeSection = useModelStore(s => s.removeSection);

  const [name, setName] = useState('New Section');
  const [A, setA] = useState(5890e-6);
  const [Iy, setIy] = useState(45.5e-6);
  const [Iz, setIz] = useState(15.3e-6);
  const [J, setJ] = useState(0.3e-6);
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    addSection({ name, A, Iy, Iz, J, materialId });
    setName('New Section');
  };

  const handleEdit = (id: string) => {
    const sec = sections.find(s => s.id === id);
    if (!sec) return;
    setEditingId(id);
    setName(sec.name);
    setA(sec.A);
    setIy(sec.Iy);
    setIz(sec.Iz);
    setJ(sec.J);
    setMaterialId(sec.materialId);
  };

  const handleSave = () => {
    if (editingId) {
      updateSection(editingId, { name, A, Iy, Iz, J, materialId });
      setEditingId(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-lg p-5 w-96 shadow-xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">Sections</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"><X size={16} /></button>
            </Dialog.Close>
          </div>

          <div className="space-y-1 mb-4 max-h-40 overflow-y-auto">
            {sections.map(s => (
              <div key={s.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[var(--color-bg-hover)] text-sm">
                <span className="text-[var(--color-text-secondary)] cursor-pointer" onClick={() => handleEdit(s.id)}>
                  {s.name} (A={(s.A * 1e6).toFixed(0)} mm²)
                </span>
                <button
                  onClick={() => removeSection(s.id)}
                  className="text-[var(--color-danger)] hover:underline text-xs cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] pt-3 space-y-2.5">
            <div className="text-sm text-[var(--color-text-muted)] font-medium">
              {editingId ? 'Edit Section' : 'Add Section'}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--color-text-muted)] w-16">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--color-text-muted)] w-16">Material</label>
              <select
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}
                className="flex-1 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none"
              >
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <Field label="A" value={A} onChange={setA} unit="m²" />
            <Field label="Iy" value={Iy} onChange={setIy} unit="m⁴" />
            <Field label="Iz" value={Iz} onChange={setIz} unit="m⁴" />
            <Field label="J" value={J} onChange={setJ} unit="m⁴" />

            <button
              onClick={editingId ? handleSave : handleAdd}
              className="w-full py-2 text-sm bg-[var(--color-accent)] text-[var(--color-on-accent)] rounded font-medium hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              {editingId ? 'Save Changes' : <><Plus size={14} /> Add Section</>}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
