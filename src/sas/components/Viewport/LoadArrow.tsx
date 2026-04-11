import * as THREE from 'three';
import { useModelStore } from '../../stores/modelStore';
import { Line, Html } from '@react-three/drei';

const LOAD_SCALE = 0.0003;
const MIN_ARROW_LEN = 0.2;
const DEFAULT_UP = new THREE.Vector3(0, 1, 0);

function PointLoadArrow({ nodeId, fx, fy, fz }: { nodeId: string; fx: number; fy: number; fz: number }) {
  const getNode = useModelStore(s => s.getNode);
  const node = getNode(nodeId);
  if (!node) return null;

  const components = [
    { val: fx, dir: new THREE.Vector3(1, 0, 0), label: 'Fx' },
    { val: fy, dir: new THREE.Vector3(0, 1, 0), label: 'Fy' },
    { val: fz, dir: new THREE.Vector3(0, 0, 1), label: 'Fz' },
  ];

  return (
    <group position={[node.x, node.y, node.z]}>
      {components.map(({ val, dir, label }) => {
        if (Math.abs(val) < 1e-10) return null;
        const len = Math.max(Math.abs(val) * LOAD_SCALE, MIN_ARROW_LEN);
        const sign = val > 0 ? 1 : -1;
        const arrowDir = dir.clone().multiplyScalar(sign);
        const tip = new THREE.Vector3(0, 0, 0);
        const tail = arrowDir.clone().multiplyScalar(-len);

        const quat = new THREE.Quaternion().setFromUnitVectors(DEFAULT_UP, arrowDir);
        const euler = new THREE.Euler().setFromQuaternion(quat);

        return (
          <group key={label}>
            <Line
              points={[tail, tip]}
              color="#ef5350"
              lineWidth={2}
            />
            <mesh position={tip.toArray()} rotation={euler}>
              <coneGeometry args={[0.05, 0.12, 8]} />
              <meshStandardMaterial color="#ef5350" />
            </mesh>
            <Html position={tail.toArray()} center style={{ pointerEvents: 'none' }}>
              <span className="text-[10px] text-[var(--color-load)] whitespace-nowrap">
                {label}={val.toFixed(1)}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function DistLoadArrows({ elementId, wy1, wy2 }: { elementId: string; wy1: number; wy2: number }) {
  const getNode = useModelStore(s => s.getNode);
  const elements = useModelStore(s => s.elements);
  const elem = elements.find(e => e.id === elementId);
  if (!elem) return null;

  const nI = getNode(elem.nodeI);
  const nJ = getNode(elem.nodeJ);
  if (!nI || !nJ) return null;

  const numArrows = 8;
  const arrows = [];
  for (let i = 0; i <= numArrows; i++) {
    const t = i / numArrows;
    const w = wy1 + (wy2 - wy1) * t;
    if (Math.abs(w) < 1e-10) continue;
    const x = nI.x + (nJ.x - nI.x) * t;
    const y = nI.y + (nJ.y - nI.y) * t;
    const z = nI.z + (nJ.z - nI.z) * t;
    const len = Math.max(Math.abs(w) * LOAD_SCALE, MIN_ARROW_LEN);
    const sign = w > 0 ? 1 : -1;
    const arrowDir = new THREE.Vector3(0, sign, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(DEFAULT_UP, arrowDir);
    const euler = new THREE.Euler().setFromQuaternion(quat);

    arrows.push(
      <group key={i} position={[x, y, z]}>
        <Line
          points={[
            new THREE.Vector3(0, -sign * len, 0),
            new THREE.Vector3(0, 0, 0),
          ]}
          color="#ef5350"
          lineWidth={1.5}
        />
        <mesh rotation={euler}>
          <coneGeometry args={[0.035, 0.09, 6]} />
          <meshStandardMaterial color="#ef5350" />
        </mesh>
      </group>
    );
  }

  return <>{arrows}</>;
}

export function LoadArrows() {
  const pointLoads = useModelStore(s => s.pointLoads);
  const distributedLoads = useModelStore(s => s.distributedLoads);

  return (
    <>
      {pointLoads.map(pl => (
        <PointLoadArrow key={pl.id} nodeId={pl.nodeId} fx={pl.fx} fy={pl.fy} fz={pl.fz} />
      ))}
      {distributedLoads.map(dl => (
        <DistLoadArrows key={dl.id} elementId={dl.elementId} wy1={dl.wy1} wy2={dl.wy2} />
      ))}
    </>
  );
}
