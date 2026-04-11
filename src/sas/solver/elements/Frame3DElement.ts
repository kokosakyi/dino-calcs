import { Matrix } from 'ml-matrix';
import type { StructuralElement } from '../types';
import type { DistributedLoad } from '../../types/model';

export class Frame3DElement implements StructuralElement {
  elementId: string;
  type = 'frame3d';
  nodeIIndex: number;
  nodeJIndex: number;
  dofPerNode = 6;
  totalDof = 12;
  dofIndices: number[];

  E: number;
  G: number;
  A: number;
  Iy: number;
  Iz: number;
  J: number;
  L: number;

  private dirCos: number[];

  constructor(
    elementId: string,
    nodeIIndex: number, nodeJIndex: number,
    E: number, G: number, A: number, Iy: number, Iz: number, J: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
  ) {
    this.elementId = elementId;
    this.nodeIIndex = nodeIIndex;
    this.nodeJIndex = nodeJIndex;
    this.E = E;
    this.G = G;
    this.A = A;
    this.Iy = Iy;
    this.Iz = Iz;
    this.J = J;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    this.L = Math.sqrt(dx * dx + dy * dy + dz * dz);

    this.dirCos = this.computeDirectionCosines(dx, dy, dz);

    const iBase = nodeIIndex * 6;
    const jBase = nodeJIndex * 6;
    this.dofIndices = [];
    for (let i = 0; i < 6; i++) this.dofIndices.push(iBase + i);
    for (let i = 0; i < 6; i++) this.dofIndices.push(jBase + i);
  }

  private computeDirectionCosines(dx: number, dy: number, dz: number): number[] {
    const L = this.L;
    const lx = dx / L, ly = dy / L, lz = dz / L;

    // Local x-axis = member direction
    // Local y and z axes via cross product with global Y (or Z if member is vertical)
    let rx: number[], ry: number[], rz: number[];
    rx = [lx, ly, lz];

    const tol = 1e-6;
    if (Math.abs(lx) < tol && Math.abs(lz) < tol) {
      // Member is vertical, use global X as reference
      const refZ = [1, 0, 0];
      ry = cross(refZ, rx);
      normalize(ry);
      rz = cross(rx, ry);
      normalize(rz);
    } else {
      const refY = [0, 1, 0];
      rz = cross(rx, refY);
      normalize(rz);
      ry = cross(rz, rx);
      normalize(ry);
    }

    return [...rx, ...ry, ...rz];
  }

  localStiffnessMatrix(): Matrix {
    const { E, G, A, Iy, Iz, J, L } = this;
    const L2 = L * L;
    const L3 = L * L * L;

    const EA_L = E * A / L;
    const GJ_L = G * J / L;
    const EIz_L3 = E * Iz / L3;
    const EIz_L2 = E * Iz / L2;
    const EIz_L = E * Iz / L;
    const EIy_L3 = E * Iy / L3;
    const EIy_L2 = E * Iy / L2;
    const EIy_L = E * Iy / L;

    const k = Matrix.zeros(12, 12);

    // Axial
    k.set(0, 0, EA_L);   k.set(0, 6, -EA_L);
    k.set(6, 0, -EA_L);  k.set(6, 6, EA_L);

    // Bending about z-axis (in x-y plane)
    k.set(1, 1, 12 * EIz_L3);   k.set(1, 5, 6 * EIz_L2);    k.set(1, 7, -12 * EIz_L3);  k.set(1, 11, 6 * EIz_L2);
    k.set(5, 1, 6 * EIz_L2);    k.set(5, 5, 4 * EIz_L);     k.set(5, 7, -6 * EIz_L2);   k.set(5, 11, 2 * EIz_L);
    k.set(7, 1, -12 * EIz_L3);  k.set(7, 5, -6 * EIz_L2);   k.set(7, 7, 12 * EIz_L3);   k.set(7, 11, -6 * EIz_L2);
    k.set(11, 1, 6 * EIz_L2);   k.set(11, 5, 2 * EIz_L);    k.set(11, 7, -6 * EIz_L2);  k.set(11, 11, 4 * EIz_L);

    // Bending about y-axis (in x-z plane)
    k.set(2, 2, 12 * EIy_L3);   k.set(2, 4, -6 * EIy_L2);   k.set(2, 8, -12 * EIy_L3);  k.set(2, 10, -6 * EIy_L2);
    k.set(4, 2, -6 * EIy_L2);   k.set(4, 4, 4 * EIy_L);     k.set(4, 8, 6 * EIy_L2);    k.set(4, 10, 2 * EIy_L);
    k.set(8, 2, -12 * EIy_L3);  k.set(8, 4, 6 * EIy_L2);    k.set(8, 8, 12 * EIy_L3);   k.set(8, 10, 6 * EIy_L2);
    k.set(10, 2, -6 * EIy_L2);  k.set(10, 4, 2 * EIy_L);    k.set(10, 8, 6 * EIy_L2);   k.set(10, 10, 4 * EIy_L);

    // Torsion
    k.set(3, 3, GJ_L);   k.set(3, 9, -GJ_L);
    k.set(9, 3, -GJ_L);  k.set(9, 9, GJ_L);

    return k;
  }

  transformationMatrix(): Matrix {
    const dc = this.dirCos;
    const r = [
      [dc[0], dc[1], dc[2]],
      [dc[3], dc[4], dc[5]],
      [dc[6], dc[7], dc[8]],
    ];

    const T = Matrix.zeros(12, 12);
    for (let block = 0; block < 4; block++) {
      const offset = block * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          T.set(offset + i, offset + j, r[i][j]);
        }
      }
    }
    return T;
  }

  globalStiffnessMatrix(): Matrix {
    const T = this.transformationMatrix();
    const kLocal = this.localStiffnessMatrix();
    const Tt = T.transpose();
    return Tt.mmul(kLocal).mmul(T);
  }

  localFixedEndForces(loads: DistributedLoad[]): number[] {
    const result = new Array(12).fill(0);
    for (const load of loads) {
      const L = this.L;
      const wy = load.wy1;
      const wz = load.wz1;
      const wx = load.wx1;

      result[0] += wx * L / 2;
      result[6] += wx * L / 2;

      result[1] += wy * L / 2;
      result[5] += wy * L * L / 12;
      result[7] += wy * L / 2;
      result[11] += -wy * L * L / 12;

      result[2] += wz * L / 2;
      result[4] += -wz * L * L / 12;
      result[8] += wz * L / 2;
      result[10] += wz * L * L / 12;
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

function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: number[]): void {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len > 1e-12) {
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
  }
}
