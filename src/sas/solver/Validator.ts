import type { SASNode, Element, Support, Material, Section } from '../types/model';

export interface ValidationError {
  level: 'error' | 'warning';
  message: string;
}

export function validateModel(
  nodes: SASNode[],
  elements: Element[],
  supports: Support[],
  materials: Material[],
  sections: Section[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (nodes.length < 2) {
    errors.push({
      level: 'error',
      message: `Not enough nodes — you have ${nodes.length}. Use the Node tool (N) to place at least 2 nodes.`,
    });
  }

  if (elements.length < 1) {
    errors.push({
      level: 'error',
      message: 'No members defined. Use the Member tool (M) to connect two nodes with a structural element.',
    });
  }

  if (supports.length < 1) {
    errors.push({
      level: 'error',
      message: 'No supports defined. Select a node and use the Support tool to restrain it — without supports the structure has nothing holding it in place.',
    });
  }

  let totalRestraints = 0;
  for (const sup of supports) {
    if (sup.dx) totalRestraints++;
    if (sup.dy) totalRestraints++;
    if (sup.dz) totalRestraints++;
    if (sup.rx) totalRestraints++;
    if (sup.ry) totalRestraints++;
    if (sup.rz) totalRestraints++;
  }

  if (supports.length > 0 && totalRestraints === 0) {
    errors.push({
      level: 'error',
      message: 'Supports exist but no degrees of freedom are actually restrained. Edit each support and make sure at least the translational DOFs (dx, dy) are checked.',
    });
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (const elem of elements) {
    const nI = nodeMap.get(elem.nodeI);
    const nJ = nodeMap.get(elem.nodeJ);
    if (!nI || !nJ) {
      errors.push({
        level: 'error',
        message: `Member "${elem.id}" references a node that doesn't exist (${!nI ? elem.nodeI : elem.nodeJ}). This can happen if a node was deleted but the member wasn't.`,
      });
      continue;
    }
    const dx = nJ.x - nI.x;
    const dy = nJ.y - nI.y;
    const dz = nJ.z - nI.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-8) {
      errors.push({
        level: 'error',
        message: `Member "${elem.id}" has zero length — both ends are at the same location (${nI.x}, ${nI.y}, ${nI.z}). Move one of the nodes or delete this member.`,
      });
    }
  }

  for (const elem of elements) {
    const sec = sections.find(s => s.id === elem.sectionId);
    if (!sec) {
      errors.push({
        level: 'error',
        message: `Member "${elem.id}" is assigned to section "${elem.sectionId}" which doesn't exist. Open Sections and assign a valid section.`,
      });
    } else {
      const mat = materials.find(m => m.id === sec.materialId);
      if (!mat) {
        errors.push({
          level: 'warning',
          message: `Section "${sec.name}" references material "${sec.materialId}" which doesn't exist. Open Materials and check the assignment.`,
        });
      }
    }
  }

  const connectedNodes = new Set<string>();
  for (const elem of elements) {
    connectedNodes.add(elem.nodeI);
    connectedNodes.add(elem.nodeJ);
  }
  const floatingNodes = nodes.filter(n => !connectedNodes.has(n.id));
  if (floatingNodes.length > 0) {
    const ids = floatingNodes.map(n => n.id).join(', ');
    errors.push({
      level: 'warning',
      message: `${floatingNodes.length} floating node(s) not connected to any member: ${ids}. These will add DOFs but carry no stiffness, which may cause a singular matrix.`,
    });
  }

  const hasFrame2d = elements.some(e => e.type === 'frame2d');
  const hasFrame3d = elements.some(e => e.type === 'frame3d');
  if (hasFrame2d || hasFrame3d) {
    for (const sup of supports) {
      const hasRotation = sup.rx || sup.ry || sup.rz;
      const hasTranslation = sup.dx || sup.dy || sup.dz;
      if (hasTranslation && !hasRotation) {
        errors.push({
          level: 'warning',
          message: `Support at "${sup.nodeId}" restrains translation but no rotation. For frame elements, consider whether a moment restraint (rz) is also needed — a pinned support should only restrain dx and dy, while a fixed support should also restrain rz.`,
        });
      }
    }
  }

  return errors;
}
