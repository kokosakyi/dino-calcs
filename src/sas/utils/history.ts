import { create } from 'zustand';
import { useModelStore, type ModelSnapshot } from '../stores/modelStore';

interface HistoryState {
  past: ModelSnapshot[];
  future: ModelSnapshot[];
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  saveSnapshot: () => {
    const snapshot = useModelStore.getState().getSnapshot();
    set(s => ({
      past: [...s.past.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const current = useModelStore.getState().getSnapshot();
    const previous = past[past.length - 1];

    useModelStore.getState().loadModel(previous);

    set(s => ({
      past: s.past.slice(0, -1),
      future: [current, ...s.future],
    }));
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const current = useModelStore.getState().getSnapshot();
    const next = future[0];

    useModelStore.getState().loadModel(next);

    set(s => ({
      past: [...s.past, current],
      future: s.future.slice(1),
    }));
  },
}));
