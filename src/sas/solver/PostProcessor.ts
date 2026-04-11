import type { StructuralElement } from './types';
import type { StationResult, MemberResult, DistributedLoad } from '../types/model';

const NUM_STATIONS = 21;

export function recoverMemberForces(
  elements: StructuralElement[],
  globalDisplacements: number[],
  distributedLoads: Map<string, DistributedLoad[]>,
  memberLengths: Map<string, number>,
): MemberResult[] {
  const results: MemberResult[] = [];

  for (const elem of elements) {
    const dofs = elem.dofIndices;
    const elemDisp = dofs.map(d => globalDisplacements[d]);
    const localForces = elem.recoverLocalForces(elemDisp);

    const distLoads = distributedLoads.get(elem.elementId) || [];
    const localFEF = elem.localFixedEndForces(distLoads);

    // Member end forces = K*u_local − equivalent_nodal_loads_local
    // The FEF are in the direction of the applied load; the actual member end
    // forces (what the nodes provide to the element) are the opposite.
    const endForces = localForces.map((f, i) => f - (localFEF[i] || 0));

    const L = memberLengths.get(elem.elementId) || 1;
    const stations = computeStations(elem, endForces, distLoads, L);

    results.push({
      elementId: elem.elementId,
      iEndForces: endForces.slice(0, endForces.length / 2),
      jEndForces: endForces.slice(endForces.length / 2),
      stations,
    });
  }

  return results;
}

function computeStations(
  elem: StructuralElement,
  endForces: number[],
  distLoads: DistributedLoad[],
  L: number,
): StationResult[] {
  const stations: StationResult[] = [];
  const dofPN = elem.dofPerNode;

  for (let s = 0; s < NUM_STATIONS; s++) {
    const x = (s / (NUM_STATIONS - 1)) * L;

    let N = 0, Vy = 0, Vz = 0, T = 0, My = 0, Mz = 0;

    if (dofPN === 1) {
      N = endForces[0];
    } else if (dofPN === 2 && elem.type === 'truss2d') {
      N = -endForces[0];
    } else if (dofPN === 2 && elem.type === 'beam') {
      // Beam: endForces = [V_i, M_i, V_j, M_j]
      const Vi = endForces[0];
      const Mi = endForces[1];
      let wy = 0;
      for (const dl of distLoads) wy += dl.wy1;

      Vy = Vi + wy * x;
      // Sagging-positive convention: negate Mi
      Mz = -Mi + Vi * x + 0.5 * wy * x * x;
    } else if (dofPN === 3) {
      // Frame 2D: endForces = [N_i, V_i, M_i, N_j, V_j, M_j]
      const Ni = endForces[0];
      const Vi = endForces[1];
      const Mi = endForces[2];

      let wx = 0, wy = 0;
      for (const dl of distLoads) {
        wx += dl.wx1;
        wy += dl.wy1;
      }

      N = -(Ni + wx * x);
      Vy = Vi + wy * x;
      // Sagging-positive: negate Mi
      Mz = -Mi + Vi * x + 0.5 * wy * x * x;
    } else if (dofPN === 6) {
      // Frame 3D: endForces = [N_i, Vy_i, Vz_i, T_i, My_i, Mz_i, ...]
      const Ni = endForces[0];
      const Vyi = endForces[1];
      const Vzi = endForces[2];
      const Ti = endForces[3];
      const Myi = endForces[4];
      const Mzi = endForces[5];

      let wx = 0, wy = 0, wz = 0;
      for (const dl of distLoads) {
        wx += dl.wx1;
        wy += dl.wy1;
        wz += dl.wz1;
      }

      N = -(Ni + wx * x);
      Vy = Vyi + wy * x;
      Vz = Vzi + wz * x;
      T = Ti;
      // x-z plane bending about y: My = Myi + Vzi·x + ½wz·x²
      My = Myi + Vzi * x + 0.5 * wz * x * x;
      // x-y plane bending about z (sagging-positive): negate Mzi
      Mz = -Mzi + Vyi * x + 0.5 * wy * x * x;
    }

    stations.push({ x, N, Vy, Vz, T, My, Mz });
  }

  return stations;
}
