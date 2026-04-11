import type { ElementType } from '../types/model';

/** DOFs per node used by the linear solver (must match `Solver.ts` assembly). */
export function getDofPerNode(elementTypes: ElementType[]): number {
  const types = new Set(elementTypes);
  if (types.has('frame3d')) return 6;
  if (types.has('frame2d')) return 3;
  if (types.has('beam')) return 2;
  if (types.has('truss2d')) return 2;
  return 1;
}

/** When the model is empty, assume Frame 2D (matches default member type in the UI). */
export function getDofPerNodeForModel(elements: { type: ElementType }[]): number {
  if (elements.length === 0) return 3;
  return getDofPerNode(elements.map(e => e.type));
}
