import { Matrix } from 'ml-matrix';
import type { StructuralElement } from '../types';
import type { DistributedLoad } from '../../types/model';

export class BeamElement implements StructuralElement {
  elementId: string;
  type = 'beam';
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode = 2;
  totalDof = 4;
  dofIndices: number[];

  E: number;
  I: number;
  L: number;

  constructor(
    elementId: string,
    nodeIIndex: number, nodeJIndex: number,
    E: number, I: number, L: number,
  ) {
    this.elementId = elementId;
    this.nodeIIndex = nodeIIndex;
    this.nodeJIndex = nodeJIndex;
    this.E = E;
    this.I = I;
    this.L = L;

    // Beam DOFs: [dy_i, rz_i, dy_j, rz_j]
    const iBase = nodeIIndex * 2;
    const jBase = nodeJIndex * 2;
    this.dofIndices = [iBase, iBase + 1, jBase, jBase + 1];
  }

  localStiffnessMatrix(): Matrix {
    const EI = this.E * this.I;
    const L = this.L;
    const L2 = L * L;
    const L3 = L * L * L;

    return new Matrix([
      [12 * EI / L3, 6 * EI / L2, -12 * EI / L3, 6 * EI / L2],
      [6 * EI / L2, 4 * EI / L, -6 * EI / L2, 2 * EI / L],
      [-12 * EI / L3, -6 * EI / L2, 12 * EI / L3, -6 * EI / L2],
      [6 * EI / L2, 2 * EI / L, -6 * EI / L2, 4 * EI / L],
    ]);
  }

  transformationMatrix(): Matrix {
    return Matrix.eye(4);
  }

  globalStiffnessMatrix(): Matrix {
    return this.localStiffnessMatrix();
  }

  localFixedEndForces(loads: DistributedLoad[]): number[] {
    const result = [0, 0, 0, 0];
    for (const load of loads) {
      const w = load.wy1;
      const L = this.L;
      result[0] += w * L / 2;
      result[1] += w * L * L / 12;
      result[2] += w * L / 2;
      result[3] += -w * L * L / 12;
    }
    return result;
  }

  equivalentNodalLoads(loads: DistributedLoad[]): number[] {
    return this.localFixedEndForces(loads);
  }

  recoverLocalForces(globalDisplacements: number[]): number[] {
    const kLocal = this.localStiffnessMatrix();
    const u = Matrix.columnVector(globalDisplacements);
    const f = kLocal.mmul(u);
    return f.getColumn(0);
  }
}
