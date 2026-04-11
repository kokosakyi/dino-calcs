import { Matrix } from 'ml-matrix';
import type { StructuralElement } from '../types';
import type { DistributedLoad } from '../../types/model';

export class Frame2DElement implements StructuralElement {
  elementId: string;
  type = 'frame2d';
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode = 3;
  totalDof = 6;
  dofIndices: number[];

  E: number;
  A: number;
  I: number;
  L: number;
  cos: number;
  sin: number;

  constructor(
    elementId: string,
    nodeIIndex: number, nodeJIndex: number,
    E: number, A: number, I: number,
    x1: number, y1: number, x2: number, y2: number,
  ) {
    this.elementId = elementId;
    this.nodeIIndex = nodeIIndex;
    this.nodeJIndex = nodeJIndex;
    this.E = E;
    this.A = A;
    this.I = I;

    const dx = x2 - x1;
    const dy = y2 - y1;
    this.L = Math.sqrt(dx * dx + dy * dy);
    this.cos = dx / this.L;
    this.sin = dy / this.L;

    // 3 DOF per node: [dx, dy, rz]
    const iBase = nodeIIndex * 3;
    const jBase = nodeJIndex * 3;
    this.dofIndices = [iBase, iBase + 1, iBase + 2, jBase, jBase + 1, jBase + 2];
  }

  localStiffnessMatrix(): Matrix {
    const { E, A, I, L } = this;
    const L2 = L * L;
    const L3 = L * L * L;
    const EA_L = E * A / L;
    const EI_L3 = E * I / L3;
    const EI_L2 = E * I / L2;
    const EI_L = E * I / L;

    return new Matrix([
      [EA_L, 0, 0, -EA_L, 0, 0],
      [0, 12 * EI_L3, 6 * EI_L2, 0, -12 * EI_L3, 6 * EI_L2],
      [0, 6 * EI_L2, 4 * EI_L, 0, -6 * EI_L2, 2 * EI_L],
      [-EA_L, 0, 0, EA_L, 0, 0],
      [0, -12 * EI_L3, -6 * EI_L2, 0, 12 * EI_L3, -6 * EI_L2],
      [0, 6 * EI_L2, 2 * EI_L, 0, -6 * EI_L2, 4 * EI_L],
    ]);
  }

  transformationMatrix(): Matrix {
    const c = this.cos;
    const s = this.sin;
    return new Matrix([
      [c, s, 0, 0, 0, 0],
      [-s, c, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 0, 0, c, s, 0],
      [0, 0, 0, -s, c, 0],
      [0, 0, 0, 0, 0, 1],
    ]);
  }

  globalStiffnessMatrix(): Matrix {
    const T = this.transformationMatrix();
    const kLocal = this.localStiffnessMatrix();
    const Tt = T.transpose();
    return Tt.mmul(kLocal).mmul(T);
  }

  localFixedEndForces(loads: DistributedLoad[]): number[] {
    const result = [0, 0, 0, 0, 0, 0];
    for (const load of loads) {
      const wy = load.wy1;
      const wx = load.wx1;
      const L = this.L;

      result[1] += wy * L / 2;
      result[2] += wy * L * L / 12;
      result[4] += wy * L / 2;
      result[5] += -wy * L * L / 12;

      result[0] += wx * L / 2;
      result[3] += wx * L / 2;
    }
    return result;
  }

  equivalentNodalLoads(loads: DistributedLoad[]): number[] {
    const localFEF = this.localFixedEndForces(loads);
    const T = this.transformationMatrix();
    const Tt = T.transpose();
    const fLocal = Matrix.columnVector(localFEF);
    const fGlobal = Tt.mmul(fLocal);
    return fGlobal.getColumn(0);
  }

  recoverLocalForces(globalDisplacements: number[]): number[] {
    const T = this.transformationMatrix();
    const uGlobal = Matrix.columnVector(globalDisplacements);
    const uLocal = T.mmul(uGlobal);
    const kLocal = this.localStiffnessMatrix();
    const fLocal = kLocal.mmul(uLocal);
    return fLocal.getColumn(0);
  }
}
