import { Matrix, solve } from 'ml-matrix';

export interface PartitionedSystem {
  Kff: Matrix;
  Kfr: Matrix;
  Krf: Matrix;
  Krr: Matrix;
  Ff: number[];
  Fr: number[];
  Ur: number[];
  freeDofs: number[];
  restrainedDofs: number[];
}

export function partitionSystem(
  K: Matrix,
  F: number[],
  restrainedDofSet: Set<number>,
  prescribedDisplacements: Map<number, number>,
  totalDofs: number,
): PartitionedSystem {
  const freeDofs: number[] = [];
  const restrainedDofs: number[] = [];

  for (let i = 0; i < totalDofs; i++) {
    if (restrainedDofSet.has(i)) {
      restrainedDofs.push(i);
    } else {
      freeDofs.push(i);
    }
  }

  const nf = freeDofs.length;
  const nr = restrainedDofs.length;

  const Kff = Matrix.zeros(nf, nf);
  const Kfr = Matrix.zeros(nf, nr);
  const Krf = Matrix.zeros(nr, nf);
  const Krr = Matrix.zeros(nr, nr);
  const Ff = new Array(nf).fill(0);
  const Fr = new Array(nr).fill(0);
  const Ur = new Array(nr).fill(0);

  for (let i = 0; i < nf; i++) {
    Ff[i] = F[freeDofs[i]];
    for (let j = 0; j < nf; j++) {
      Kff.set(i, j, K.get(freeDofs[i], freeDofs[j]));
    }
    for (let j = 0; j < nr; j++) {
      Kfr.set(i, j, K.get(freeDofs[i], restrainedDofs[j]));
    }
  }

  for (let i = 0; i < nr; i++) {
    Fr[i] = F[restrainedDofs[i]];
    Ur[i] = prescribedDisplacements.get(restrainedDofs[i]) ?? 0;
    for (let j = 0; j < nf; j++) {
      Krf.set(i, j, K.get(restrainedDofs[i], freeDofs[j]));
    }
    for (let j = 0; j < nr; j++) {
      Krr.set(i, j, K.get(restrainedDofs[i], restrainedDofs[j]));
    }
  }

  return { Kff, Kfr, Krf, Krr, Ff, Fr, Ur, freeDofs, restrainedDofs };
}

export function solvePartitioned(system: PartitionedSystem): {
  displacements: number[];
  reactions: number[];
} {
  const { Kff, Kfr, Ff, Fr, Ur, Krf, Krr, freeDofs, restrainedDofs } = system;
  const nf = freeDofs.length;
  const nr = restrainedDofs.length;

  // Ff_eff = Ff - Kfr * Ur
  const UrMatrix = Matrix.columnVector(Ur);
  const KfrUr = nr > 0 ? Kfr.mmul(UrMatrix) : Matrix.zeros(nf, 1);
  const Ff_eff = Ff.map((f, i) => f - KfrUr.get(i, 0));

  // Solve Kff * Uf = Ff_eff
  const Ff_matrix = Matrix.columnVector(Ff_eff);
  let Uf: Matrix;

  if (nf === 0) {
    Uf = Matrix.zeros(0, 1);
  } else {
    Uf = solve(Kff, Ff_matrix);
  }

  // Reactions = Krf·Uf + Krr·Ur − F_applied_at_restrained
  let reactions: number[];
  if (nr > 0 && nf > 0) {
    const KrfUf = Krf.mmul(Uf);
    const KrrUr = Krr.mmul(UrMatrix);
    reactions = Array.from({ length: nr }, (_, i) =>
      KrfUf.get(i, 0) + KrrUr.get(i, 0) - Fr[i]);
  } else if (nr > 0) {
    const KrrUr = Krr.mmul(UrMatrix);
    reactions = Array.from({ length: nr }, (_, i) =>
      KrrUr.get(i, 0) - Fr[i]);
  } else {
    reactions = [];
  }

  // Assemble full displacement vector
  const totalDofs = freeDofs.length + restrainedDofs.length;
  const displacements = new Array(totalDofs).fill(0);
  for (let i = 0; i < nf; i++) {
    displacements[freeDofs[i]] = Uf.get(i, 0);
  }
  for (let i = 0; i < nr; i++) {
    displacements[restrainedDofs[i]] = Ur[i];
  }

  return { displacements, reactions };
}
