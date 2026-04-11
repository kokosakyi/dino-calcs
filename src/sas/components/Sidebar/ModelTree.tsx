import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { useResultStore } from '../../stores/resultStore';
import {
  ChevronDown, ChevronRight, MapPin, GitCommitHorizontal,
  Anchor, ArrowDown, ArrowRightLeft, Box, Layers,
  Trash2, Pencil,
} from 'lucide-react';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: ComponentType<{ size?: number }>;
  onClick: () => void;
  danger?: boolean;
}

function ContextMenu({ x, y, items, onClose }: {
  x: number; y: number; items: ContextMenuItem[]; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-panel)] shadow-xl"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm cursor-pointer transition-colors
            ${item.danger
              ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          {item.icon && <item.icon size={14} />}
          {item.label}
        </button>
      ))}
    </div>
  );
}

function TreeSection({ title, icon: Icon, count, children, defaultOpen = true }: {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-border)]/40">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Icon size={14} className="text-[var(--color-text-muted)]" />
        <span className="flex-1 text-left">{title}</span>
        <span className="text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-panel)] px-1.5 py-0.5 rounded">
          {count}
        </span>
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

function TreeItem({ label, sublabel, selected, onClick, onContextMenu }: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  onContextMenu?: (e: ReactMouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`w-full text-left flex items-baseline gap-2 px-4 pl-8 py-1.5 text-sm truncate cursor-pointer transition-colors
        ${selected
          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
        }`}
    >
      <span className="truncate font-medium">{label}</span>
      {sublabel && (
        <span className="text-xs text-[var(--color-text-muted)] shrink-0">{sublabel}</span>
      )}
    </button>
  );
}

function fmtCoord(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function fmtSupport(s: { dx: boolean; dy: boolean; dz: boolean; rx: boolean; ry: boolean; rz: boolean }): string {
  const parts: string[] = [];
  if (s.dx) parts.push('dx');
  if (s.dy) parts.push('dy');
  if (s.dz) parts.push('dz');
  if (s.rx) parts.push('rx');
  if (s.ry) parts.push('ry');
  if (s.rz) parts.push('rz');
  return parts.join(', ');
}

function fmtForce(pl: { fx: number; fy: number; fz: number; mx: number; my: number; mz: number }): string {
  const parts: string[] = [];
  if (pl.fx) parts.push(`Fx=${pl.fx}`);
  if (pl.fy) parts.push(`Fy=${pl.fy}`);
  if (pl.fz) parts.push(`Fz=${pl.fz}`);
  if (pl.mx) parts.push(`Mx=${pl.mx}`);
  if (pl.my) parts.push(`My=${pl.my}`);
  if (pl.mz) parts.push(`Mz=${pl.mz}`);
  return parts.join(', ') || '(zero)';
}

export function ModelTree() {
  const nodes = useModelStore(s => s.nodes);
  const elements = useModelStore(s => s.elements);
  const supports = useModelStore(s => s.supports);
  const pointLoads = useModelStore(s => s.pointLoads);
  const distributedLoads = useModelStore(s => s.distributedLoads);
  const materials = useModelStore(s => s.materials);
  const sections = useModelStore(s => s.sections);
  const removeNode = useModelStore(s => s.removeNode);
  const removeElement = useModelStore(s => s.removeElement);
  const removeSupport = useModelStore(s => s.removeSupport);
  const removePointLoad = useModelStore(s => s.removePointLoad);
  const removeDistributedLoad = useModelStore(s => s.removeDistributedLoad);

  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const setSelectedNodes = useUIStore(s => s.setSelectedNodes);
  const setSelectedElements = useUIStore(s => s.setSelectedElements);
  const clearResults = useResultStore(s => s.clearResults);

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const closeMenu = useCallback(() => setCtxMenu(null), []);

  const handleDelete = (type: string, id: string) => {
    clearResults();
    switch (type) {
      case 'node': removeNode(id); break;
      case 'element': removeElement(id); break;
      case 'support': removeSupport(id); break;
      case 'pointLoad': removePointLoad(id); break;
      case 'distLoad': removeDistributedLoad(id); break;
    }
  };

  const nodeMenu = (e: ReactMouseEvent, nodeId: string) => {
    e.preventDefault();
    setSelectedNodes([nodeId]);
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Edit Properties', icon: Pencil, onClick: () => setSelectedNodes([nodeId]) },
        { label: 'Delete Node', icon: Trash2, onClick: () => handleDelete('node', nodeId), danger: true },
      ],
    });
  };

  const elemMenu = (e: ReactMouseEvent, elemId: string) => {
    e.preventDefault();
    setSelectedElements([elemId]);
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Edit Properties', icon: Pencil, onClick: () => setSelectedElements([elemId]) },
        { label: 'Delete Member', icon: Trash2, onClick: () => handleDelete('element', elemId), danger: true },
      ],
    });
  };

  const supportMenu = (e: ReactMouseEvent, nodeId: string) => {
    e.preventDefault();
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Edit Support', icon: Pencil, onClick: () => setSelectedNodes([nodeId]) },
        { label: 'Remove Support', icon: Trash2, onClick: () => handleDelete('support', nodeId), danger: true },
      ],
    });
  };

  const plMenu = (e: ReactMouseEvent, plId: string, nodeId: string) => {
    e.preventDefault();
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Edit Load', icon: Pencil, onClick: () => setSelectedNodes([nodeId]) },
        { label: 'Delete Load', icon: Trash2, onClick: () => handleDelete('pointLoad', plId), danger: true },
      ],
    });
  };

  const dlMenu = (e: ReactMouseEvent, dlId: string, elemId: string) => {
    e.preventDefault();
    setCtxMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Edit Load', icon: Pencil, onClick: () => setSelectedElements([elemId]) },
        { label: 'Delete Load', icon: Trash2, onClick: () => handleDelete('distLoad', dlId), danger: true },
      ],
    });
  };

  return (
    <div>
      <div className="px-3 py-3 text-base font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)]">
        Model Tree
      </div>

      <TreeSection title="Nodes" icon={MapPin} count={nodes.length}>
        {nodes.length === 0 && <EmptyHint text="No nodes defined" />}
        {nodes.map(n => (
          <TreeItem
            key={n.id}
            label={n.id}
            sublabel={`(${fmtCoord(n.x)}, ${fmtCoord(n.y)}, ${fmtCoord(n.z)})`}
            selected={selectedNodeIds.includes(n.id)}
            onClick={() => setSelectedNodes([n.id])}
            onContextMenu={(e) => nodeMenu(e, n.id)}
          />
        ))}
      </TreeSection>

      <TreeSection title="Members" icon={GitCommitHorizontal} count={elements.length}>
        {elements.length === 0 && <EmptyHint text="No members defined" />}
        {elements.map(e => (
          <TreeItem
            key={e.id}
            label={e.id}
            sublabel={`${e.nodeI} → ${e.nodeJ}  [${e.type}]`}
            selected={selectedElementIds.includes(e.id)}
            onClick={() => setSelectedElements([e.id])}
            onContextMenu={(ev) => elemMenu(ev, e.id)}
          />
        ))}
      </TreeSection>

      <TreeSection title="Supports" icon={Anchor} count={supports.length}>
        {supports.length === 0 && <EmptyHint text="No supports defined" />}
        {supports.map(s => (
          <TreeItem
            key={s.nodeId}
            label={s.nodeId}
            sublabel={fmtSupport(s)}
            selected={selectedNodeIds.includes(s.nodeId)}
            onClick={() => setSelectedNodes([s.nodeId])}
            onContextMenu={(e) => supportMenu(e, s.nodeId)}
          />
        ))}
      </TreeSection>

      <TreeSection title="Point Loads" icon={ArrowDown} count={pointLoads.length} defaultOpen={pointLoads.length > 0}>
        {pointLoads.length === 0 && <EmptyHint text="No point loads" />}
        {pointLoads.map(pl => (
          <TreeItem
            key={pl.id}
            label={`${pl.id} → ${pl.nodeId}`}
            sublabel={fmtForce(pl)}
            selected={selectedNodeIds.includes(pl.nodeId)}
            onClick={() => setSelectedNodes([pl.nodeId])}
            onContextMenu={(e) => plMenu(e, pl.id, pl.nodeId)}
          />
        ))}
      </TreeSection>

      <TreeSection title="Distributed Loads" icon={ArrowRightLeft} count={distributedLoads.length} defaultOpen={distributedLoads.length > 0}>
        {distributedLoads.length === 0 && <EmptyHint text="No distributed loads" />}
        {distributedLoads.map(dl => (
          <TreeItem
            key={dl.id}
            label={`${dl.id} → ${dl.elementId}`}
            sublabel={`wy=${dl.wy1}`}
            selected={selectedElementIds.includes(dl.elementId)}
            onClick={() => setSelectedElements([dl.elementId])}
            onContextMenu={(e) => dlMenu(e, dl.id, dl.elementId)}
          />
        ))}
      </TreeSection>

      <TreeSection title="Materials" icon={Box} count={materials.length} defaultOpen={false}>
        {materials.map(m => (
          <TreeItem
            key={m.id}
            label={m.name}
            sublabel={`E=${(m.E / 1e9).toFixed(0)} GPa`}
            selected={false}
            onClick={() => {}}
          />
        ))}
      </TreeSection>

      <TreeSection title="Sections" icon={Layers} count={sections.length} defaultOpen={false}>
        {sections.map(s => (
          <TreeItem
            key={s.id}
            label={s.name}
            sublabel={`A=${(s.A * 1e6).toFixed(0)} mm²`}
            selected={false}
            onClick={() => {}}
          />
        ))}
      </TreeSection>

      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={closeMenu} />}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="px-8 py-2 text-sm text-[var(--color-text-muted)] italic">{text}</div>
  );
}
