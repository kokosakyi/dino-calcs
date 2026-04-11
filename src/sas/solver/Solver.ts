import { useModelStore } from '../stores/modelStore';
import { useResultStore } from '../stores/resultStore';
import { assembleGlobalSystem } from './Assembler';
import { partitionSystem, solvePartitioned } from './BoundaryConditions';
import { recoverMemberForces } from './PostProcessor';
import { validateModel } from './Validator';
import { getDofPerNode } from './dofScheme';
import { SpringElement } from './elements/SpringElement';
import { Truss2DElement } from './elements/Truss2DElement';
import { BeamElement } from './elements/BeamElement';
import { Frame2DElement } from './elements/Frame2DElement';
import { Frame3DElement } from './elements/Frame3DElement';
import type { StructuralElement } from './types';
import type { AnalysisResults, NodalResult, ReactionResult, DistributedLoad } from '../types/model';

export function runAnalysis() {
  const modelState = useModelStore.getState();
  const resultState = useResultStore.getState();

  const { nodes, elements, supports, materials, sections, pointLoads, distributedLoads } = modelState;

  resultState.setSolving(true);

  try {
    // Validate
    const errors = validateModel(nodes, elements, supports, materials, sections);
    const criticalErrors = errors.filter(e => e.level === 'error');
    if (criticalErrors.length > 0) {
      resultState.setSolverError(criticalErrors.map(e => e.message).join('\n'));
      return;
    }

    // Determine DOF scheme from element types
    const dofPerNode = getDofPerNode(elements.map(e => e.type));
    const nodeIndexMap = new Map<string, number>();
    nodes.forEach((n, i) => nodeIndexMap.set(n.id, i));
    const totalDofs = nodes.length * dofPerNode;

    // Build structural elements
    const structElements: StructuralElement[] = [];
    const memberLengths = new Map<string, number>();

    for (const elem of elements) {
      const nI = nodes.find(n => n.id === elem.nodeI)!;
      const nJ = nodes.find(n => n.id === elem.nodeJ)!;
      const sec = sections.find(s => s.id === elem.sectionId);
      const mat = sec ? materials.find(m => m.id === sec.materialId) : undefined;

      if (!sec || !mat) continue;

      const iIdx = nodeIndexMap.get(elem.nodeI)!;
      const jIdx = nodeIndexMap.get(elem.nodeJ)!;

      const dx = nJ.x - nI.x;
      const dy = nJ.y - nI.y;
      const dz = nJ.z - nI.z;
      const L = Math.sqrt(dx * dx + dy * dy + dz * dz);
      memberLengths.set(elem.id, L);

      let se: StructuralElement;

      switch (elem.type) {
        case 'spring': {
          const k = mat.E * sec.A / L;
          se = new SpringElement(elem.id, iIdx * dofPerNode, jIdx * dofPerNode, k);
          break;
        }
        case 'truss2d':
          se = new Truss2DElement(elem.id, iIdx, jIdx, mat.E, sec.A, nI.x, nI.y, nJ.x, nJ.y);
          break;
        case 'beam':
          se = new BeamElement(elem.id, iIdx, jIdx, mat.E, sec.Iz, L);
          break;
        case 'frame2d':
          se = new Frame2DElement(elem.id, iIdx, jIdx, mat.E, sec.A, sec.Iz, nI.x, nI.y, nJ.x, nJ.y);
          break;
        case 'frame3d':
          se = new Frame3DElement(
            elem.id, iIdx, jIdx,
            mat.E, mat.G, sec.A, sec.Iy, sec.Iz, sec.J,
            nI.x, nI.y, nI.z, nJ.x, nJ.y, nJ.z,
          );
          break;
        default:
          continue;
      }

      structElements.push(se);
    }

    // Assemble external force vector from point loads
    const F = new Array(totalDofs).fill(0);
    for (const pl of pointLoads) {
      const nIdx = nodeIndexMap.get(pl.nodeId);
      if (nIdx === undefined) continue;
      const base = nIdx * dofPerNode;

      if (dofPerNode === 1) {
        F[base] += pl.fx;
      } else if (dofPerNode === 2) {
        F[base] += pl.fx;
        F[base + 1] += pl.fy;
      } else if (dofPerNode === 3) {
        F[base] += pl.fx;
        F[base + 1] += pl.fy;
        F[base + 2] += pl.mz;
      } else if (dofPerNode === 6) {
        F[base] += pl.fx;
        F[base + 1] += pl.fy;
        F[base + 2] += pl.fz;
        F[base + 3] += pl.mx;
        F[base + 4] += pl.my;
        F[base + 5] += pl.mz;
      }
    }

    // Add equivalent nodal loads from distributed loads
    const distLoadMap = new Map<string, DistributedLoad[]>();
    for (const dl of distributedLoads) {
      if (!distLoadMap.has(dl.elementId)) distLoadMap.set(dl.elementId, []);
      distLoadMap.get(dl.elementId)!.push(dl);
    }

    for (const se of structElements) {
      const dls = distLoadMap.get(se.elementId) || [];
      if (dls.length > 0) {
        const enl = se.equivalentNodalLoads(dls);
        const dofs = se.dofIndices;
        for (let i = 0; i < dofs.length; i++) {
          F[dofs[i]] += enl[i];
        }
      }
    }

    // Assemble global stiffness
    const { K } = assembleGlobalSystem(structElements, totalDofs, F);

    // Build restrained DOF set
    const restrainedDofs = new Set<number>();
    const prescribedDisp = new Map<number, number>();

    for (const sup of supports) {
      const nIdx = nodeIndexMap.get(sup.nodeId);
      if (nIdx === undefined) continue;
      const base = nIdx * dofPerNode;

      if (dofPerNode === 1) {
        if (sup.dx) { restrainedDofs.add(base); prescribedDisp.set(base, 0); }
      } else if (dofPerNode === 2) {
        if (sup.dx) { restrainedDofs.add(base); prescribedDisp.set(base, 0); }
        if (sup.dy) { restrainedDofs.add(base + 1); prescribedDisp.set(base + 1, 0); }
      } else if (dofPerNode === 3) {
        if (sup.dx) { restrainedDofs.add(base); prescribedDisp.set(base, 0); }
        if (sup.dy) { restrainedDofs.add(base + 1); prescribedDisp.set(base + 1, 0); }
        if (sup.rz) { restrainedDofs.add(base + 2); prescribedDisp.set(base + 2, 0); }
      } else if (dofPerNode === 6) {
        if (sup.dx) { restrainedDofs.add(base); prescribedDisp.set(base, 0); }
        if (sup.dy) { restrainedDofs.add(base + 1); prescribedDisp.set(base + 1, 0); }
        if (sup.dz) { restrainedDofs.add(base + 2); prescribedDisp.set(base + 2, 0); }
        if (sup.rx) { restrainedDofs.add(base + 3); prescribedDisp.set(base + 3, 0); }
        if (sup.ry) { restrainedDofs.add(base + 4); prescribedDisp.set(base + 4, 0); }
        if (sup.rz) { restrainedDofs.add(base + 5); prescribedDisp.set(base + 5, 0); }
      }
    }

    // Partition and solve
    const partitioned = partitionSystem(K, F, restrainedDofs, prescribedDisp, totalDofs);
    const { displacements, reactions } = solvePartitioned(partitioned);

    // Check for NaN in results
    const hasNaNDisp = displacements.some(v => !isFinite(v));
    const hasNaNReact = reactions.some(v => !isFinite(v));
    if (hasNaNDisp || hasNaNReact) {
      const hints: string[] = ['The solver produced invalid numbers (NaN or Infinity).'];

      const nFree = partitioned.freeDofs.length;
      const nRestrained = partitioned.restrainedDofs.length;
      hints.push(`DOF summary: ${totalDofs} total, ${nRestrained} restrained, ${nFree} free.`);

      if (nRestrained < 3 && dofPerNode === 3) {
        hints.push('For 2D frames you typically need at least 3 restrained DOFs to prevent rigid-body motion. Add more support restraints.');
      }

      const allZeroF = F.every(v => v === 0);
      if (allZeroF) {
        hints.push('The force vector is entirely zero — no loads are being applied. Check that your loads reference correct node/element IDs and that force values are nonzero.');
      }

      for (const se of structElements) {
        if (!isFinite((se as any).L) || (se as any).L === 0) {
          hints.push(`Member "${se.elementId}" has zero or undefined length — check that its two nodes are at different positions.`);
        }
      }

      resultState.setSolverError(hints.join('\n'));
      return;
    }

    // Build nodal results
    const nodalDisplacements: NodalResult[] = nodes.map((n, i) => {
      const base = i * dofPerNode;
      return {
        nodeId: n.id,
        dx: displacements[base] || 0,
        dy: dofPerNode >= 2 ? displacements[base + 1] || 0 : 0,
        dz: dofPerNode >= 3 && dofPerNode !== 3 ? displacements[base + 2] || 0 : 0,
        rx: dofPerNode === 6 ? displacements[base + 3] || 0 : 0,
        ry: dofPerNode === 6 ? displacements[base + 4] || 0 : 0,
        rz: dofPerNode === 3 ? displacements[base + 2] || 0 :
            dofPerNode === 6 ? displacements[base + 5] || 0 : 0,
      };
    });

    // Build reaction results
    const reactionResults: ReactionResult[] = [];
    for (const sup of supports) {
      const nIdx = nodeIndexMap.get(sup.nodeId);
      if (nIdx === undefined) continue;
      const base = nIdx * dofPerNode;

      const rr: ReactionResult = { nodeId: sup.nodeId, fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 };

      for (let i = 0; i < reactions.length; i++) {
        const dof = partitioned.restrainedDofs[i];
        const offset = dof - base;
        if (offset < 0 || offset >= dofPerNode) continue;

        if (dofPerNode === 1) {
          if (offset === 0) rr.fx = reactions[i];
        } else if (dofPerNode === 2) {
          if (offset === 0) rr.fx = reactions[i];
          if (offset === 1) rr.fy = reactions[i];
        } else if (dofPerNode === 3) {
          if (offset === 0) rr.fx = reactions[i];
          if (offset === 1) rr.fy = reactions[i];
          if (offset === 2) rr.mz = reactions[i];
        } else if (dofPerNode === 6) {
          if (offset === 0) rr.fx = reactions[i];
          if (offset === 1) rr.fy = reactions[i];
          if (offset === 2) rr.fz = reactions[i];
          if (offset === 3) rr.mx = reactions[i];
          if (offset === 4) rr.my = reactions[i];
          if (offset === 5) rr.mz = reactions[i];
        }
      }

      reactionResults.push(rr);
    }

    // Recover member forces
    const memberForces = recoverMemberForces(structElements, displacements, distLoadMap, memberLengths);

    const analysisResults: AnalysisResults = {
      nodalDisplacements,
      memberForces,
      reactions: reactionResults,
    };

    resultState.setResults(analysisResults);
  } catch (err: any) {
    const raw = err.message || String(err);
    resultState.setSolverError(friendlyError(raw));
  }
}

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes('singular') || lower.includes('not invertible') || lower.includes('nan')) {
    return 'The stiffness matrix is singular — the structure is unstable or a mechanism.\n\nCommon causes:\n• Not enough supports to prevent rigid-body movement\n• A pinned connection where a fixed support is needed\n• Collinear nodes with no lateral restraint\n• A member with zero stiffness in one direction\n\nCheck your supports and make sure the structure is fully constrained.';
  }

  if (lower.includes('out of range') || lower.includes('index') || lower.includes('undefined is not')) {
    return 'An internal indexing error occurred — this usually means a node or element reference is broken.\n\nTry:\n• Clearing the model and rebuilding it\n• Checking that all members connect to existing nodes\n• Removing and re-adding any recently edited supports or loads';
  }

  if (lower.includes('memory') || lower.includes('allocation')) {
    return 'The model is too large for the browser to handle. Try reducing the number of nodes and members, or closing other browser tabs to free memory.';
  }

  return `An unexpected error occurred during analysis:\n\n"${raw}"\n\nThis may be a bug — try simplifying the model to isolate the issue.`;
}
