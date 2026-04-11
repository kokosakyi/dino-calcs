import { Matrix } from 'ml-matrix';
import type { StructuralElement } from './types';

export interface AssemblyResult {
  K: Matrix;
  F: number[];
  totalDofs: number;
  elements: StructuralElement[];
}

export function assembleGlobalSystem(
  elements: StructuralElement[],
  totalDofs: number,
  externalForces: number[],
): AssemblyResult {
  const K = Matrix.zeros(totalDofs, totalDofs);
  const F = [...externalForces];

  for (const elem of elements) {
    const kGlobal = elem.globalStiffnessMatrix();
    const dofs = elem.dofIndices;

    // Scatter element stiffness into global matrix
    for (let i = 0; i < dofs.length; i++) {
      for (let j = 0; j < dofs.length; j++) {
        const gi = dofs[i];
        const gj = dofs[j];
        if (gi < totalDofs && gj < totalDofs) {
          K.set(gi, gj, K.get(gi, gj) + kGlobal.get(i, j));
        }
      }
    }
  }

  return { K, F, totalDofs, elements };
}
