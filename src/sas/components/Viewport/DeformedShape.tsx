import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { useResultStore } from '../../stores/resultStore';

export function DeformedShape() {
  const resultView = useUIStore(s => s.resultView);
  const scale = useUIStore(s => s.deformationScale);
  const results = useResultStore(s => s.results);
  const nodes = useModelStore(s => s.nodes);
  const elements = useModelStore(s => s.elements);

  const deformedLines = useMemo(() => {
    if (resultView !== 'deformed' || !results) return [];

    const dispMap = new Map<string, { dx: number; dy: number; dz: number }>();
    for (const nd of results.nodalDisplacements) {
      dispMap.set(nd.nodeId, { dx: nd.dx, dy: nd.dy, dz: nd.dz });
    }

    return elements.map(elem => {
      const nI = nodes.find(n => n.id === elem.nodeI);
      const nJ = nodes.find(n => n.id === elem.nodeJ);
      if (!nI || !nJ) return null;

      const dI = dispMap.get(elem.nodeI) || { dx: 0, dy: 0, dz: 0 };
      const dJ = dispMap.get(elem.nodeJ) || { dx: 0, dy: 0, dz: 0 };

      const pI = new THREE.Vector3(
        nI.x + dI.dx * scale,
        nI.y + dI.dy * scale,
        nI.z + dI.dz * scale,
      );
      const pJ = new THREE.Vector3(
        nJ.x + dJ.dx * scale,
        nJ.y + dJ.dy * scale,
        nJ.z + dJ.dz * scale,
      );

      return { id: elem.id, points: [pI, pJ] };
    }).filter(Boolean) as { id: string; points: THREE.Vector3[] }[];
  }, [resultView, results, scale, nodes, elements]);

  if (resultView !== 'deformed' || !results) return null;

  return (
    <>
      {/* Ghost of original */}
      {elements.map(elem => {
        const nI = nodes.find(n => n.id === elem.nodeI);
        const nJ = nodes.find(n => n.id === elem.nodeJ);
        if (!nI || !nJ) return null;
        return (
          <Line
            key={`orig_${elem.id}`}
            points={[
              new THREE.Vector3(nI.x, nI.y, nI.z),
              new THREE.Vector3(nJ.x, nJ.y, nJ.z),
            ]}
            color="#555"
            lineWidth={1}
            dashed
            dashSize={0.2}
            gapSize={0.1}
          />
        );
      })}
      {/* Deformed shape */}
      {deformedLines.map(line => (
        <Line
          key={`def_${line.id}`}
          points={line.points}
          color="#4fc3f7"
          lineWidth={2.5}
        />
      ))}
    </>
  );
}
