import { useEffect, useRef, useCallback } from 'react';
import {
  Anchor, ArrowDown, ArrowRightLeft, Trash2, Circle,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useModelStore } from '../../stores/modelStore';
import { useHistoryStore } from '../../utils/history';
import type { ComponentType } from 'react';

interface MenuItem {
  label: string;
  icon?: ComponentType<{ size?: number }>;
  onClick: () => void;
  danger?: boolean;
}

function MenuDivider() {
  return <div className="h-px my-1 bg-[var(--color-border)]/50" />;
}

export function ViewportContextMenu() {
  const ctx = useUIStore(s => s.contextMenu);
  const clearContextMenu = useUIStore(s => s.clearContextMenu);
  const setActiveTool = useUIStore(s => s.setActiveTool);
  const setSelectedNodes = useUIStore(s => s.setSelectedNodes);
  const setSelectedElements = useUIStore(s => s.setSelectedElements);
  const addNode = useModelStore(s => s.addNode);
  const removeNode = useModelStore(s => s.removeNode);
  const removeElement = useModelStore(s => s.removeElement);
  const supports = useModelStore(s => s.supports);
  const saveSnapshot = useHistoryStore(s => s.saveSnapshot);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => clearContextMenu(), [clearContextMenu]);

  useEffect(() => {
    if (!ctx) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [ctx, close]);

  if (!ctx) return null;

  const items: (MenuItem | 'divider')[] = [];

  if (ctx.nodeId) {
    const nodeId = ctx.nodeId;
    const hasSupport = supports.some(s => s.nodeId === nodeId);

    items.push({
      label: hasSupport ? 'Edit Support' : 'Add Support',
      icon: Anchor,
      onClick: () => {
        saveSnapshot();
        setActiveTool('support');
        setSelectedNodes([nodeId]);
      },
    });
    items.push({
      label: 'Add Point Load',
      icon: ArrowDown,
      onClick: () => {
        saveSnapshot();
        setActiveTool('pointLoad');
        setSelectedNodes([nodeId]);
      },
    });
    items.push('divider');
    items.push({
      label: 'Delete Node',
      icon: Trash2,
      danger: true,
      onClick: () => {
        saveSnapshot();
        removeNode(nodeId);
      },
    });
  } else if (ctx.elementId) {
    const elementId = ctx.elementId;

    items.push({
      label: 'Add Distributed Load',
      icon: ArrowRightLeft,
      onClick: () => {
        saveSnapshot();
        setActiveTool('distributedLoad');
        setSelectedElements([elementId]);
      },
    });
    items.push('divider');
    items.push({
      label: 'Delete Member',
      icon: Trash2,
      danger: true,
      onClick: () => {
        saveSnapshot();
        removeElement(elementId);
      },
    });
  } else if (ctx.worldPos) {
    const pos = ctx.worldPos;

    items.push({
      label: `Add Node at (${pos.x}, ${pos.y})`,
      icon: Circle,
      onClick: () => {
        saveSnapshot();
        addNode(pos.x, pos.y, pos.z);
      },
    });
  }

  if (items.length === 0) return null;

  const menuX = Math.min(ctx.x, window.innerWidth - 200);
  const menuY = Math.min(ctx.y, window.innerHeight - items.length * 36 - 20);

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-panel)] shadow-xl"
      style={{ left: menuX, top: menuY }}
    >
      {items.map((item, i) => {
        if (item === 'divider') return <MenuDivider key={`div-${i}`} />;
        return (
          <button
            key={item.label}
            onClick={() => { item.onClick(); close(); }}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm cursor-pointer transition-colors
              ${item.danger
                ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
              }`}
          >
            {item.icon && <item.icon size={14} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
