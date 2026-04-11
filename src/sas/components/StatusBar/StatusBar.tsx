import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { useResultStore } from '../../stores/resultStore';

export function StatusBar() {
  const nodes = useModelStore(s => s.nodes);
  const elements = useModelStore(s => s.elements);
  const activeTool = useUIStore(s => s.activeTool);
  const cursorWorldPos = useUIStore(s => s.cursorWorldPos);
  const isSolving = useResultStore(s => s.isSolving);
  const results = useResultStore(s => s.results);
  const snapToGrid = useUIStore(s => s.snapToGrid);
  const gridSpacing = useUIStore(s => s.gridSpacing);

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] select-none">
      <span>Tool: <span className="text-[var(--color-text-secondary)]">{activeTool}</span></span>
      <span>Nodes: <span className="text-[var(--color-text-secondary)]">{nodes.length}</span></span>
      <span>Members: <span className="text-[var(--color-text-secondary)]">{elements.length}</span></span>
      <span>
        Cursor: <span className="text-[var(--color-text-secondary)]">
          ({cursorWorldPos.x.toFixed(2)}, {cursorWorldPos.y.toFixed(2)}, {cursorWorldPos.z.toFixed(2)})
        </span>
      </span>
      <span>Grid: <span className="text-[var(--color-text-secondary)]">{gridSpacing}m</span></span>
      <span>Snap: <span className="text-[var(--color-text-secondary)]">{snapToGrid ? 'ON' : 'OFF'}</span></span>
      <div className="flex-1" />
      {isSolving && <span className="text-[var(--color-warning)]">Solving...</span>}
      {results && !isSolving && <span className="text-[var(--color-success)]">Solution ready</span>}
    </div>
  );
}
