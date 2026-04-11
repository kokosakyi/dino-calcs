import { useState, useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Viewport } from './components/Viewport/Viewport';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { RightSidebar } from './components/Sidebar/RightSidebar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { SupportDialog } from './components/Dialogs/SupportDialog';
import { PointLoadDialog, DistributedLoadDialog } from './components/Dialogs/LoadDialog';
import { MaterialDialog } from './components/Dialogs/MaterialDialog';
import { SectionDialog } from './components/Dialogs/SectionDialog';
import { useUIStore } from './stores/uiStore';
import { useModelStore } from './stores/modelStore';
import { useHistoryStore } from './utils/history';

export default function SasApp() {
  const showLeftPanel = useUIStore((s) => s.showLeftPanel);
  const showRightPanel = useUIStore((s) => s.showRightPanel);
  const setActiveTool = useUIStore((s) => s.setActiveTool);

  const [matDialogOpen, setMatDialogOpen] = useState(false);
  const [secDialogOpen, setSecDialogOpen] = useState(false);

  const handleDelete = useCallback(() => {
    const { selectedNodeIds, selectedElementIds, clearSelection } = useUIStore.getState();
    const { removeNode, removeElement } = useModelStore.getState();
    for (const id of selectedElementIds) removeElement(id);
    for (const id of selectedNodeIds) removeNode(id);
    clearSelection();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          setActiveTool('node');
          break;
        case 'm':
          setActiveTool('member');
          break;
        case 's':
          if (!e.ctrlKey) setActiveTool('select');
          break;
        case 'escape':
          setActiveTool('select');
          break;
        case 'delete':
        case 'backspace':
          handleDelete();
          break;
        case 'z':
          if (e.ctrlKey && !e.shiftKey) useHistoryStore.getState().undo();
          if (e.ctrlKey && e.shiftKey) useHistoryStore.getState().redo();
          break;
        case 'y':
          if (e.ctrlKey) useHistoryStore.getState().redo();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveTool, handleDelete]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar
        onOpenMaterials={() => setMatDialogOpen(true)}
        onOpenSections={() => setSecDialogOpen(true)}
      />
      <div className="flex flex-1 min-h-0">
        {showLeftPanel && <LeftSidebar />}
        <div className="flex-1 relative min-w-0">
          <Viewport />
        </div>
        {showRightPanel && <RightSidebar />}
      </div>
      <StatusBar />

      <SupportDialog />
      <PointLoadDialog />
      <DistributedLoadDialog />
      <MaterialDialog open={matDialogOpen} onClose={() => setMatDialogOpen(false)} />
      <SectionDialog open={secDialogOpen} onClose={() => setSecDialogOpen(false)} />
    </div>
  );
}
