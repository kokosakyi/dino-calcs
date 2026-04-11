import { Matrix } from 'ml-matrix';
import type { StructuralElement } from '../types';
import type { DistributedLoad } from '../../types/model';

export class SpringElement implements StructuralElement {
  elementId: string;
  type = 'spring';
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode = 1;
  totalDof = 2;
  dofIndices: number[];
  k: number;

  constructor(elementId: string, nodeIIndex: number, nodeJIndex: number, k: number) {
    this.elementId = elementId;
    this.nodeIIndex = nodeIIndex;
    this.nodeJIndex = nodeJIndex;
    this.k = k;
    // For springs, we use only the X-translation DOF at each node
    this.dofIndices = [nodeIIndex, nodeJIndex];
  }

  localStiffnessMatrix(): Matrix {
    return new Matrix([
      [this.k, -this.k],
      [-this.k, this.k],
    ]);
  }

  transformationMatrix(): Matrix {
    return Matrix.eye(2);
  }

  globalStiffnessMatrix(): Matrix {
    return this.localStiffnessMatrix();
  }

  localFixedEndForces(_loads: DistributedLoad[]): number[] {
    return [0, 0];
  }

  equivalentNodalLoads(_loads: DistributedLoad[]): number[] {
    return [0, 0];
  }

  recoverLocalForces(globalDisplacements: number[]): number[] {
    const u1 = globalDisplacements[0];
    const u2 = globalDisplacements[1];
    const f = this.k * (u2 - u1);
    return [-f, f];
  }
}
