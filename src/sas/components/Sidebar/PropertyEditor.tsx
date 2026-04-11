import type { ReactNode } from 'react';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { useResultStore } from '../../stores/resultStore';

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <span className="text-[var(--color-text-muted)] text-sm w-14 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function NumInput({ value, onChange, step = 0.1 }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none focus:border-[var(--color-accent)]"
      step={step}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="accent-[var(--color-accent)] w-4 h-4"
      />
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
    </label>
  );
}

function SectionHeading({ title, onDelete }: { title: string; onDelete?: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--color-border)]/50">
      <span className="text-sm font-medium text-[var(--color-accent)]">{title}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-[var(--color-danger)] hover:underline cursor-pointer"
        >
          Delete
        </button>
      )}
    </div>
  );
}

function NodeEditor({ nodeId }: { nodeId: string }) {
  const getNode = useModelStore(s => s.getNode);
  const updateNode = useModelStore(s => s.updateNode);
  const removeNode = useModelStore(s => s.removeNode);
  const clearResults = useResultStore(s => s.clearResults);
  const node = getNode(nodeId);
  if (!node) return null;

  const handleUpdate = (updates: Partial<{ x: number; y: number; z: number }>) => {
    clearResults();
    updateNode(nodeId, updates);
  };

  return (
    <div>
      <SectionHeading title={`Node: ${node.id}`} onDelete={() => { clearResults(); removeNode(nodeId); }} />
      <FieldRow label="X"><NumInput value={node.x} onChange={v => handleUpdate({ x: v })} /></FieldRow>
      <FieldRow label="Y"><NumInput value={node.y} onChange={v => handleUpdate({ y: v })} /></FieldRow>
      <FieldRow label="Z"><NumInput value={node.z} onChange={v => handleUpdate({ z: v })} /></FieldRow>
    </div>
  );
}

function SupportEditor({ nodeId }: { nodeId: string }) {
  const getSupport = useModelStore(s => s.getSupport);
  const setSupport = useModelStore(s => s.setSupport);
  const removeSupport = useModelStore(s => s.removeSupport);
  const clearResults = useResultStore(s => s.clearResults);
  const support = getSupport(nodeId);
  if (!support) return null;

  const update = (key: string, val: boolean) => {
    clearResults();
    setSupport({ ...support, [key]: val });
  };

  return (
    <div>
      <SectionHeading title="Support" onDelete={() => { clearResults(); removeSupport(nodeId); }} />
      <div className="px-3 py-2 grid grid-cols-3 gap-2">
        <Toggle checked={support.dx} onChange={v => update('dx', v)} label="dx" />
        <Toggle checked={support.dy} onChange={v => update('dy', v)} label="dy" />
        <Toggle checked={support.dz} onChange={v => update('dz', v)} label="dz" />
        <Toggle checked={support.rx} onChange={v => update('rx', v)} label="rx" />
        <Toggle checked={support.ry} onChange={v => update('ry', v)} label="ry" />
        <Toggle checked={support.rz} onChange={v => update('rz', v)} label="rz" />
      </div>
    </div>
  );
}

function PointLoadEditor({ loadId }: { loadId: string }) {
  const pointLoads = useModelStore(s => s.pointLoads);
  const updatePointLoad = useModelStore(s => s.updatePointLoad);
  const removePointLoad = useModelStore(s => s.removePointLoad);
  const clearResults = useResultStore(s => s.clearResults);
  const pl = pointLoads.find(p => p.id === loadId);
  if (!pl) return null;

  const update = (key: string, val: number) => {
    clearResults();
    updatePointLoad(loadId, { [key]: val });
  };

  return (
    <div>
      <SectionHeading title={`Point Load: ${pl.id}`} onDelete={() => { clearResults(); removePointLoad(loadId); }} />
      <FieldRow label="Fx (N)"><NumInput value={pl.fx} onChange={v => update('fx', v)} step={1000} /></FieldRow>
      <FieldRow label="Fy (N)"><NumInput value={pl.fy} onChange={v => update('fy', v)} step={1000} /></FieldRow>
      <FieldRow label="Fz (N)"><NumInput value={pl.fz} onChange={v => update('fz', v)} step={1000} /></FieldRow>
      <FieldRow label="Mx"><NumInput value={pl.mx} onChange={v => update('mx', v)} step={100} /></FieldRow>
      <FieldRow label="My"><NumInput value={pl.my} onChange={v => update('my', v)} step={100} /></FieldRow>
      <FieldRow label="Mz"><NumInput value={pl.mz} onChange={v => update('mz', v)} step={100} /></FieldRow>
    </div>
  );
}

function ElementEditor({ elementId }: { elementId: string }) {
  const elements = useModelStore(s => s.elements);
  const sections = useModelStore(s => s.sections);
  const updateElement = useModelStore(s => s.updateElement);
  const removeElement = useModelStore(s => s.removeElement);
  const clearResults = useResultStore(s => s.clearResults);
  const elem = elements.find(e => e.id === elementId);
  if (!elem) return null;

  return (
    <div>
      <SectionHeading title={`Member: ${elem.id}`} onDelete={() => { clearResults(); removeElement(elementId); }} />
      <FieldRow label="Type">
        <select
          value={elem.type}
          onChange={e => { clearResults(); updateElement(elementId, { type: e.target.value as any }); }}
          className="w-full bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none"
        >
          <option value="spring">Spring</option>
          <option value="truss2d">Truss 2D</option>
          <option value="beam">Beam</option>
          <option value="frame2d">Frame 2D</option>
          <option value="frame3d">Frame 3D</option>
        </select>
      </FieldRow>
      <FieldRow label="Node I"><span className="text-sm text-[var(--color-text-primary)]">{elem.nodeI}</span></FieldRow>
      <FieldRow label="Node J"><span className="text-sm text-[var(--color-text-primary)]">{elem.nodeJ}</span></FieldRow>
      <FieldRow label="Section">
        <select
          value={elem.sectionId}
          onChange={e => { clearResults(); updateElement(elementId, { sectionId: e.target.value }); }}
          className="w-full bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] text-sm px-2 py-1.5 rounded border border-[var(--color-border)] outline-none"
        >
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </FieldRow>
    </div>
  );
}

function DistLoadEditor({ loadId }: { loadId: string }) {
  const distributedLoads = useModelStore(s => s.distributedLoads);
  const updateDistributedLoad = useModelStore(s => s.updateDistributedLoad);
  const removeDistributedLoad = useModelStore(s => s.removeDistributedLoad);
  const clearResults = useResultStore(s => s.clearResults);
  const dl = distributedLoads.find(d => d.id === loadId);
  if (!dl) return null;

  const update = (key: string, val: number) => {
    clearResults();
    updateDistributedLoad(loadId, { [key]: val });
  };

  return (
    <div>
      <SectionHeading title={`Dist. Load: ${dl.id}`} onDelete={() => { clearResults(); removeDistributedLoad(loadId); }} />
      <FieldRow label="wx1"><NumInput value={dl.wx1} onChange={v => update('wx1', v)} step={1000} /></FieldRow>
      <FieldRow label="wy1"><NumInput value={dl.wy1} onChange={v => update('wy1', v)} step={1000} /></FieldRow>
      <FieldRow label="wz1"><NumInput value={dl.wz1} onChange={v => update('wz1', v)} step={1000} /></FieldRow>
      <FieldRow label="wx2"><NumInput value={dl.wx2} onChange={v => update('wx2', v)} step={1000} /></FieldRow>
      <FieldRow label="wy2"><NumInput value={dl.wy2} onChange={v => update('wy2', v)} step={1000} /></FieldRow>
      <FieldRow label="wz2"><NumInput value={dl.wz2} onChange={v => update('wz2', v)} step={1000} /></FieldRow>
    </div>
  );
}

export function PropertyEditor() {
  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const supports = useModelStore(s => s.supports);
  const pointLoads = useModelStore(s => s.pointLoads);
  const distributedLoads = useModelStore(s => s.distributedLoads);

  if (selectedNodeIds.length === 1) {
    const nodeId = selectedNodeIds[0];
    const hasSupport = supports.some(s => s.nodeId === nodeId);
    const nodePointLoads = pointLoads.filter(pl => pl.nodeId === nodeId);

    return (
      <div className="max-h-80 overflow-y-auto">
        <NodeEditor nodeId={nodeId} />
        {hasSupport && <SupportEditor nodeId={nodeId} />}
        {nodePointLoads.map(pl => (
          <PointLoadEditor key={pl.id} loadId={pl.id} />
        ))}
      </div>
    );
  }

  if (selectedElementIds.length === 1) {
    const elemId = selectedElementIds[0];
    const elemDistLoads = distributedLoads.filter(dl => dl.elementId === elemId);

    return (
      <div className="max-h-80 overflow-y-auto">
        <ElementEditor elementId={elemId} />
        {elemDistLoads.map(dl => (
          <DistLoadEditor key={dl.id} loadId={dl.id} />
        ))}
      </div>
    );
  }

  if (selectedNodeIds.length > 1 || selectedElementIds.length > 1) {
    return (
      <div className="px-3 py-3 text-sm text-[var(--color-text-muted)]">
        {selectedNodeIds.length + selectedElementIds.length} items selected
      </div>
    );
  }

  return (
    <div className="px-3 py-3 text-sm text-[var(--color-text-muted)]">
      Select a node or member to edit properties
    </div>
  );
}
