import { Matrix } from 'ml-matrix';
import type { StructuralElement } from '../types';
import type { DistributedLoad } from '../../types/model';

export class Truss2DElement implements StructuralElement {
  elementId: string;
  type = 'truss2d';
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode = 2;
  totalDof = 4;
  dofIndices: number[];

  E: number;
  A: number;
  L: number;
  cos: number;
  sin: number;

  constructor(
    elementId: string,
    nodeIIndex: number, nodeJIndex: number,
    E: number, A: number,
    x1: number, y1: number, x2: number, y2: number,
  ) {
    this.elementId = elementId;
    this.nodeIIndex = nodeIIndex;
    this.nodeJIndex = nodeJIndex;
    this.E = E;
    this.A = A;

    const dx = x2 - x1;
    const dy = y2 - y1;
    this.L = Math.sqrt(dx * dx + dy * dy);
    this.cos = dx / this.L;
    this.sin = dy / this.L;

    const iBase = nodeIIndex * 2;
    const jBase = nodeJIndex * 2;
    this.dofIndices = [iBase, iBase + 1, jBase, jBase + 1];
  }

  localStiffnessMatrix(): Matrix {
    const k = (this.E * this.A) / this.L;
    return new Matrix([
      [k, 0, -k, 0],
      [0, 0, 0, 0],
      [-k, 0, k, 0],
      [0, 0, 0, 0],
    ]);
  }

  transformationMatrix(): Matrix {
    const c = this.cos;
    const s = this.sin;
    return new Matrix([
      [c, s, 0, 0],
      [-s, c, 0, 0],
      [0, 0, c, s],
      [0, 0, -s, c],
    ]);
  }

  globalStiffnessMatrix(): Matrix {
    const T = this.transformationMatrix();
    const kLocal = this.localStiffnessMatrix();
    const Tt = T.transpose();
    return Tt.mmul(kLocal).mmul(T);
  }

  localFixedEndForces(_loads: DistributedLoad[]): number[] {
    return [0, 0, 0, 0];
  }

  equivalentNodalLoads(_loads: DistributedLoad[]): number[] {
    return [0, 0, 0, 0];
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
