import { Matrix } from 'ml-matrix';
import type { DistributedLoad } from '../types/model';

export interface StructuralElement {
  elementId: string;
  type: string;
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode: number;
  totalDof: number;
  dofIndices: number[];
  localStiffnessMatrix(): Matrix;
  transformationMatrix(): Matrix;
  globalStiffnessMatrix(): Matrix;
  equivalentNodalLoads(loads: DistributedLoad[]): number[];
  localFixedEndForces(loads: DistributedLoad[]): number[];
  recoverLocalForces(globalDisplacements: number[]): number[];
}
