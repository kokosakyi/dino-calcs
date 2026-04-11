import { useMemo } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { useResultStore } from '../../stores/resultStore';
import { useTheme } from '../../../context/ThemeContext';
import type { ResultView, StationResult } from '../../types/model';

const DIAGRAM_COLORS: Record<string, { dark: string; light: string }> = {
  axial:   { dark: '#ff9800', light: '#e65100' },
  shear:   { dark: '#2196f3', light: '#0d47a1' },
  moment:  { dark: '#e91e63', light: '#880e4f' },
  torsion: { dark: '#9c27b0', light: '#6a1b9a' },
};

const UNIT_MAP: Record<string, { unit: string; divisor: number }> = {
  axial:   { unit: 'kN', divisor: 1000 },
  shear:   { unit: 'kN', divisor: 1000 },
  moment:  { unit: 'kN·m', divisor: 1000 },
  torsion: { unit: 'kN·m', divisor: 1000 },
};

function getValueAtStation(station: StationResult, view: ResultView): number {
  switch (view) {
    case 'axial': return station.N;
    case 'shear': return station.Vy;
    case 'moment': return station.Mz;
    case 'torsion': return station.T;
    default: return 0;
  }
}

interface MaxLabel {
  position: THREE.Vector3;
  value: number;
  displayValue: string;
}

function MemberDiagram({ elementId, view, scale }: { elementId: string; view: ResultView; scale: number }) {
  const nodes = useModelStore(s => s.nodes);
  const elements = useModelStore(s => s.elements);
  const results = useResultStore(s => s.results);
  const { theme } = useTheme();

  const { geometry, outlinePoints, maxLabel } = useMemo(() => {
    const empty = { geometry: null, outlinePoints: null as THREE.Vector3[] | null, maxLabel: null as MaxLabel | null };
    if (!results) return empty;

    const elem = elements.find(e => e.id === elementId);
    if (!elem) return empty;

    const memberResult = results.memberForces.find(m => m.elementId === elementId);
    if (!memberResult || memberResult.stations.length < 2) return empty;

    const nI = nodes.find(n => n.id === elem.nodeI);
    const nJ = nodes.find(n => n.id === elem.nodeJ);
    if (!nI || !nJ) return empty;

    const startPos = new THREE.Vector3(nI.x, nI.y, nI.z);
    const endPos = new THREE.Vector3(nJ.x, nJ.y, nJ.z);
    const memberDir = endPos.clone().sub(startPos);
    const memberLen = memberDir.length();
    if (memberLen < 1e-10) return empty;
    memberDir.normalize();

    let perpDir: THREE.Vector3;
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(memberDir.dot(up)) > 0.99) {
      perpDir = new THREE.Vector3(1, 0, 0);
    } else {
      perpDir = up.clone().cross(memberDir).normalize().cross(memberDir).normalize();
    }

    const vertices: number[] = [];
    const indices: number[] = [];
    const stations = memberResult.stations;
    const outline: THREE.Vector3[] = [];

    const { unit, divisor } = UNIT_MAP[view] || { unit: '', divisor: 1 };
    let maxAbsVal = 0;
    let maxIdx = 0;

    for (let i = 0; i < stations.length; i++) {
      const rawVal = getValueAtStation(stations[i], view);
      if (Math.abs(rawVal) > Math.abs(maxAbsVal)) {
        maxAbsVal = rawVal;
        maxIdx = i;
      }
    }

    for (let i = 0; i < stations.length; i++) {
      const t = stations[i].x / memberLen;
      const val = getValueAtStation(stations[i], view) * scale * 0.001;
      const basePoint = startPos.clone().lerp(endPos, t);
      const diagramPoint = basePoint.clone().add(perpDir.clone().multiplyScalar(val));

      vertices.push(basePoint.x, basePoint.y, basePoint.z);
      vertices.push(diagramPoint.x, diagramPoint.y, diagramPoint.z);
      outline.push(diagramPoint);

      if (i < stations.length - 1) {
        const bi = i * 2;
        indices.push(bi, bi + 1, bi + 2);
        indices.push(bi + 1, bi + 3, bi + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const maxLabelData: MaxLabel | null = Math.abs(maxAbsVal) > 1e-6 ? {
      position: outline[maxIdx],
      value: maxAbsVal,
      displayValue: `${(maxAbsVal / divisor).toFixed(2)} ${unit}`,
    } : null;

    return { geometry: geo, outlinePoints: outline, maxLabel: maxLabelData };
  }, [results, elementId, view, scale, nodes, elements]);

  if (!geometry) return null;

  const colors = DIAGRAM_COLORS[view] || { dark: '#fff', light: '#000' };
  const color = theme === 'dark' ? colors.dark : colors.light;

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {outlinePoints && outlinePoints.length >= 2 && (
        <Line points={outlinePoints} color={color} lineWidth={2} />
      )}
      {maxLabel && (
        <Html position={maxLabel.position} center distanceFactor={20} style={{ pointerEvents: 'none' }}>
          <div
            className="px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap"
            style={{
              background: theme === 'dark' ? 'rgba(30,30,58,0.9)' : 'rgba(255,255,255,0.9)',
              color: color,
              border: `1px solid ${color}`,
            }}
          >
            {maxLabel.displayValue}
          </div>
        </Html>
      )}
    </group>
  );
}

export function ForceDiagrams() {
  const resultView = useUIStore(s => s.resultView);
  const diagramScale = useUIStore(s => s.diagramScale);
  const results = useResultStore(s => s.results);
  const elements = useModelStore(s => s.elements);

  if (!results || resultView === 'none' || resultView === 'deformed' || resultView === 'reactions') return null;

  return (
    <>
      {elements.map(elem => (
        <MemberDiagram key={elem.id} elementId={elem.id} view={resultView} scale={diagramScale} />
      ))}
    </>
  );
}
