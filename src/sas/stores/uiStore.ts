import { create } from 'zustand';
import type { ActiveTool, ViewPreset, ResultView, ElementType } from '../types/model';

interface UIState {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;

  selectedNodeIds: string[];
  selectedElementIds: string[];
  setSelectedNodes: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;

  gridSpacing: number;
  setGridSpacing: (s: number) => void;
  gridVisible: boolean;
  setGridVisible: (v: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  snapToNode: boolean;
  setSnapToNode: (v: boolean) => void;

  viewPreset: ViewPreset;
  setViewPreset: (v: ViewPreset) => void;

  resultView: ResultView;
  setResultView: (v: ResultView) => void;
  deformationScale: number;
  setDeformationScale: (s: number) => void;
  diagramScale: number;
  setDiagramScale: (s: number) => void;

  defaultElementType: ElementType;
  setDefaultElementType: (t: ElementType) => void;

  activeSectionId: string;
  setActiveSectionId: (id: string) => void;

  activeLoadCaseId: string;
  setActiveLoadCaseId: (id: string) => void;

  memberStartNodeId: string | null;
  setMemberStartNodeId: (id: string | null) => void;

  showLeftPanel: boolean;
  showRightPanel: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;

  cursorWorldPos: { x: number; y: number; z: number };
  setCursorWorldPos: (pos: { x: number; y: number; z: number }) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool, memberStartNodeId: null }),

  selectedNodeIds: [],
  selectedElementIds: [],
  setSelectedNodes: (ids) => set({ selectedNodeIds: ids }),
  setSelectedElements: (ids) => set({ selectedElementIds: ids }),
  toggleNodeSelection: (id) => set(s => ({
    selectedNodeIds: s.selectedNodeIds.includes(id)
      ? s.selectedNodeIds.filter(i => i !== id)
      : [...s.selectedNodeIds, id]
  })),
  toggleElementSelection: (id) => set(s => ({
    selectedElementIds: s.selectedElementIds.includes(id)
      ? s.selectedElementIds.filter(i => i !== id)
      : [...s.selectedElementIds, id]
  })),
  clearSelection: () => set({ selectedNodeIds: [], selectedElementIds: [] }),

  gridSpacing: 1,
  setGridSpacing: (s) => set({ gridSpacing: s }),
  gridVisible: true,
  setGridVisible: (v) => set({ gridVisible: v }),
  snapToGrid: true,
  setSnapToGrid: (v) => set({ snapToGrid: v }),
  snapToNode: true,
  setSnapToNode: (v) => set({ snapToNode: v }),

  viewPreset: 'isometric',
  setViewPreset: (v) => set({ viewPreset: v }),

  resultView: 'none',
  setResultView: (v) => set({ resultView: v }),
  deformationScale: 50,
  setDeformationScale: (s) => set({ deformationScale: s }),
  diagramScale: 1,
  setDiagramScale: (s) => set({ diagramScale: s }),

  defaultElementType: 'frame2d',
  setDefaultElementType: (t) => set({ defaultElementType: t }),

  activeSectionId: 'sec_default_1',
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  activeLoadCaseId: 'lc_1',
  setActiveLoadCaseId: (id) => set({ activeLoadCaseId: id }),

  memberStartNodeId: null,
  setMemberStartNodeId: (id) => set({ memberStartNodeId: id }),

  showLeftPanel: true,
  showRightPanel: true,
  toggleLeftPanel: () => set(s => ({ showLeftPanel: !s.showLeftPanel })),
  toggleRightPanel: () => set(s => ({ showRightPanel: !s.showRightPanel })),

  cursorWorldPos: { x: 0, y: 0, z: 0 },
  setCursorWorldPos: (pos) => set({ cursorWorldPos: pos }),
}));
