import { create } from 'zustand';
import type { AnalysisResults } from '../types/model';

interface ResultState {
  results: AnalysisResults | null;
  isSolving: boolean;
  solverError: string | null;
  setResults: (r: AnalysisResults) => void;
  setSolving: (v: boolean) => void;
  setSolverError: (err: string | null) => void;
  clearResults: () => void;
}

export const useResultStore = create<ResultState>((set) => ({
  results: null,
  isSolving: false,
  solverError: null,
  setResults: (r) => set({ results: r, isSolving: false, solverError: null }),
  setSolving: (v) => set({ isSolving: v, solverError: v ? null : undefined }),
  setSolverError: (err) => set({ solverError: err, isSolving: false }),
  clearResults: () => set({ results: null, solverError: null }),
}));
