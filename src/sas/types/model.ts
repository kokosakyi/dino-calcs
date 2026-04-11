export interface SASNode {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface Support {
  nodeId: string;
  dx: boolean;
  dy: boolean;
  dz: boolean;
  rx: boolean;
  ry: boolean;
  rz: boolean;
}

export type ElementType = 'spring' | 'truss2d' | 'beam' | 'frame2d' | 'frame3d';

export interface Element {
  id: string;
  type: ElementType;
  nodeI: string;
  nodeJ: string;
  sectionId: string;
  releases?: {
    iEnd: { dx: boolean; dy: boolean; dz: boolean; rx: boolean; ry: boolean; rz: boolean };
    jEnd: { dx: boolean; dy: boolean; dz: boolean; rx: boolean; ry: boolean; rz: boolean };
  };
}

export interface Material {
  id: string;
  name: string;
  E: number;    // Young's modulus (Pa)
  G: number;    // Shear modulus (Pa)
  nu: number;   // Poisson's ratio
  density: number; // kg/m^3
}

export interface Section {
  id: string;
  name: string;
  A: number;    // Cross-section area (m^2)
  Iy: number;   // Moment of inertia about local y (m^4)
  Iz: number;   // Moment of inertia about local z (m^4)
  J: number;    // Torsion constant (m^4)
  materialId: string;
}

export interface PointLoad {
  id: string;
  nodeId: string;
  fx: number;
  fy: number;
  fz: number;
  mx: number;
  my: number;
  mz: number;
  loadCaseId: string;
}

export interface DistributedLoad {
  id: string;
  elementId: string;
  wx1: number; wy1: number; wz1: number;
  wx2: number; wy2: number; wz2: number;
  loadCaseId: string;
}

export interface LoadCase {
  id: string;
  name: string;
}

export interface NodalResult {
  nodeId: string;
  dx: number; dy: number; dz: number;
  rx: number; ry: number; rz: number;
}

export interface StationResult {
  x: number;     // distance from i-end
  N: number;     // axial
  Vy: number;    // shear y
  Vz: number;    // shear z
  T: number;     // torsion
  My: number;    // moment about y
  Mz: number;    // moment about z
}

export interface MemberResult {
  elementId: string;
  iEndForces: number[];
  jEndForces: number[];
  stations: StationResult[];
}

export interface ReactionResult {
  nodeId: string;
  fx: number; fy: number; fz: number;
  mx: number; my: number; mz: number;
}

export interface AnalysisResults {
  nodalDisplacements: NodalResult[];
  memberForces: MemberResult[];
  reactions: ReactionResult[];
}

export type ActiveTool = 'select' | 'node' | 'member' | 'support' | 'pointLoad' | 'distributedLoad' | 'pan';

export type ViewPreset = 'front' | 'top' | 'right' | 'isometric';

export type ResultView = 'none' | 'deformed' | 'axial' | 'shear' | 'moment' | 'torsion' | 'reactions';
