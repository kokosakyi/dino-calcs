import { create } from 'zustand';
import type {
  SASNode, Element, Material, Section, Support,
  PointLoad, DistributedLoad, LoadCase,
} from '../types/model';

let nodeCounter = 0;
let elementCounter = 0;
let materialCounter = 0;
let sectionCounter = 0;
let loadCounter = 0;
let loadCaseCounter = 0;

function genId(prefix: string, counter: number): string {
  return `${prefix}_${counter}`;
}

interface ModelState {
  nodes: SASNode[];
  elements: Element[];
  materials: Material[];
  sections: Section[];
  supports: Support[];
  pointLoads: PointLoad[];
  distributedLoads: DistributedLoad[];
  loadCases: LoadCase[];

  addNode: (x: number, y: number, z: number) => SASNode;
  updateNode: (id: string, updates: Partial<SASNode>) => void;
  removeNode: (id: string) => void;
  getNode: (id: string) => SASNode | undefined;

  addElement: (type: Element['type'], nodeI: string, nodeJ: string, sectionId: string) => Element;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;

  addMaterial: (mat: Omit<Material, 'id'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  removeMaterial: (id: string) => void;

  addSection: (sec: Omit<Section, 'id'>) => Section;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;

  setSupport: (support: Support) => void;
  removeSupport: (nodeId: string) => void;
  getSupport: (nodeId: string) => Support | undefined;

  addPointLoad: (load: Omit<PointLoad, 'id'>) => PointLoad;
  updatePointLoad: (id: string, updates: Partial<PointLoad>) => void;
  removePointLoad: (id: string) => void;

  addDistributedLoad: (load: Omit<DistributedLoad, 'id'>) => DistributedLoad;
  updateDistributedLoad: (id: string, updates: Partial<DistributedLoad>) => void;
  removeDistributedLoad: (id: string) => void;

  addLoadCase: (name: string) => LoadCase;
  removeLoadCase: (id: string) => void;

  clearModel: () => void;
  loadModel: (data: ModelSnapshot) => void;
  getSnapshot: () => ModelSnapshot;
}

export interface ModelSnapshot {
  nodes: SASNode[];
  elements: Element[];
  materials: Material[];
  sections: Section[];
  supports: Support[];
  pointLoads: PointLoad[];
  distributedLoads: DistributedLoad[];
  loadCases: LoadCase[];
}

const DEFAULT_MATERIALS: Material[] = [
  { id: 'mat_default_steel', name: 'Steel', E: 200e9, G: 77e9, nu: 0.3, density: 7850 },
  { id: 'mat_default_aluminum', name: 'Aluminum', E: 69e9, G: 26e9, nu: 0.33, density: 2700 },
  { id: 'mat_default_concrete', name: 'Concrete', E: 30e9, G: 12.5e9, nu: 0.2, density: 2400 },
  { id: 'mat_default_timber', name: 'Timber', E: 12e9, G: 0.75e9, nu: 0.35, density: 600 },
];

const DEFAULT_SECTIONS: Section[] = [
  { id: 'sec_default_1', name: 'W200x46', A: 5890e-6, Iy: 45.5e-6, Iz: 15.3e-6, J: 0.3e-6, materialId: 'mat_default_steel' },
  { id: 'sec_default_2', name: 'W310x97', A: 12300e-6, Iy: 222e-6, Iz: 72.2e-6, J: 1.16e-6, materialId: 'mat_default_steel' },
];

const DEFAULT_LOAD_CASE: LoadCase = { id: 'lc_1', name: 'Load Case 1' };

export const useModelStore = create<ModelState>((set, get) => ({
  nodes: [],
  elements: [],
  materials: [...DEFAULT_MATERIALS],
  sections: [...DEFAULT_SECTIONS],
  supports: [],
  pointLoads: [],
  distributedLoads: [],
  loadCases: [DEFAULT_LOAD_CASE],

  addNode: (x, y, z) => {
    const node: SASNode = { id: genId('n', ++nodeCounter), x, y, z };
    set(s => ({ nodes: [...s.nodes, node] }));
    return node;
  },
  updateNode: (id, updates) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),
  removeNode: (id) => set(s => ({
    nodes: s.nodes.filter(n => n.id !== id),
    elements: s.elements.filter(e => e.nodeI !== id && e.nodeJ !== id),
    supports: s.supports.filter(sp => sp.nodeId !== id),
    pointLoads: s.pointLoads.filter(pl => pl.nodeId !== id),
  })),
  getNode: (id) => get().nodes.find(n => n.id === id),

  addElement: (type, nodeI, nodeJ, sectionId) => {
    const elem: Element = { id: genId('e', ++elementCounter), type, nodeI, nodeJ, sectionId };
    set(s => ({ elements: [...s.elements, elem] }));
    return elem;
  },
  updateElement: (id, updates) => set(s => ({
    elements: s.elements.map(e => e.id === id ? { ...e, ...updates } : e)
  })),
  removeElement: (id) => set(s => ({
    elements: s.elements.filter(e => e.id !== id),
    distributedLoads: s.distributedLoads.filter(dl => dl.elementId !== id),
  })),

  addMaterial: (mat) => {
    const material: Material = { ...mat, id: genId('mat', ++materialCounter) };
    set(s => ({ materials: [...s.materials, material] }));
    return material;
  },
  updateMaterial: (id, updates) => set(s => ({
    materials: s.materials.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  removeMaterial: (id) => set(s => ({
    materials: s.materials.filter(m => m.id !== id)
  })),

  addSection: (sec) => {
    const section: Section = { ...sec, id: genId('sec', ++sectionCounter) };
    set(s => ({ sections: [...s.sections, section] }));
    return section;
  },
  updateSection: (id, updates) => set(s => ({
    sections: s.sections.map(sec => sec.id === id ? { ...sec, ...updates } : sec)
  })),
  removeSection: (id) => set(s => ({
    sections: s.sections.filter(sec => sec.id !== id)
  })),

  setSupport: (support) => set(s => {
    const existing = s.supports.findIndex(sp => sp.nodeId === support.nodeId);
    if (existing >= 0) {
      const updated = [...s.supports];
      updated[existing] = support;
      return { supports: updated };
    }
    return { supports: [...s.supports, support] };
  }),
  removeSupport: (nodeId) => set(s => ({
    supports: s.supports.filter(sp => sp.nodeId !== nodeId)
  })),
  getSupport: (nodeId) => get().supports.find(sp => sp.nodeId === nodeId),

  addPointLoad: (load) => {
    const pl: PointLoad = { ...load, id: genId('pl', ++loadCounter) };
    set(s => ({ pointLoads: [...s.pointLoads, pl] }));
    return pl;
  },
  updatePointLoad: (id, updates) => set(s => ({
    pointLoads: s.pointLoads.map(pl => pl.id === id ? { ...pl, ...updates } : pl)
  })),
  removePointLoad: (id) => set(s => ({
    pointLoads: s.pointLoads.filter(pl => pl.id !== id)
  })),

  addDistributedLoad: (load) => {
    const dl: DistributedLoad = { ...load, id: genId('dl', ++loadCounter) };
    set(s => ({ distributedLoads: [...s.distributedLoads, dl] }));
    return dl;
  },
  updateDistributedLoad: (id, updates) => set(s => ({
    distributedLoads: s.distributedLoads.map(dl => dl.id === id ? { ...dl, ...updates } : dl)
  })),
  removeDistributedLoad: (id) => set(s => ({
    distributedLoads: s.distributedLoads.filter(dl => dl.id !== id)
  })),

  addLoadCase: (name) => {
    const lc: LoadCase = { id: genId('lc', ++loadCaseCounter), name };
    set(s => ({ loadCases: [...s.loadCases, lc] }));
    return lc;
  },
  removeLoadCase: (id) => set(s => ({
    loadCases: s.loadCases.filter(lc => lc.id !== id),
    pointLoads: s.pointLoads.filter(pl => pl.loadCaseId !== id),
    distributedLoads: s.distributedLoads.filter(dl => dl.loadCaseId !== id),
  })),

  clearModel: () => {
    nodeCounter = 0; elementCounter = 0;
    loadCounter = 0; loadCaseCounter = 0;
    set({
      nodes: [], elements: [], supports: [],
      pointLoads: [], distributedLoads: [],
      materials: [...DEFAULT_MATERIALS],
      sections: [...DEFAULT_SECTIONS],
      loadCases: [{ ...DEFAULT_LOAD_CASE }],
    });
  },

  loadModel: (data) => set({ ...data }),

  getSnapshot: () => {
    const s = get();
    return {
      nodes: s.nodes, elements: s.elements, materials: s.materials,
      sections: s.sections, supports: s.supports,
      pointLoads: s.pointLoads, distributedLoads: s.distributedLoads,
      loadCases: s.loadCases,
    };
  },
}));
