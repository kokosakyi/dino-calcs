import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { useModelStore } from '../../stores/modelStore';
import { useResultStore } from '../../stores/resultStore';
import { useUIStore } from '../../stores/uiStore';
import { useTheme } from '../../../context/ThemeContext';

const REACT_SCALE = 0.0003;
const MIN_ARROW_LEN = 0.25;
const ARROW_COLOR = '#4caf50';

function ReactionAtNode({ nodeId, fx, fy, fz, mx, my, mz }: {
  nodeId: string; fx: number; fy: number; fz: number;
  mx: number; my: number; mz: number;
}) {
  const getNode = useModelStore(s => s.getNode);
  const { theme } = useTheme();
  const node = getNode(nodeId);
  if (!node) return null;

  const forces = [
    { val: fx, dir: new THREE.Vector3(1, 0, 0), label: 'Rx' },
    { val: fy, dir: new THREE.Vector3(0, 1, 0), label: 'Ry' },
    { val: fz, dir: new THREE.Vector3(0, 0, 1), label: 'Rz' },
  ];

  const moments = [
    { val: mx, label: 'Mx' },
    { val: my, label: 'My' },
    { val: mz, label: 'Mz' },
  ];

  const defaultUp = new THREE.Vector3(0, 1, 0);

  return (
    <group position={[node.x, node.y, node.z]}>
      {forces.map(({ val, dir, label }) => {
        if (Math.abs(val) < 1e-6) return null;
        const len = Math.max(Math.abs(val) * REACT_SCALE, MIN_ARROW_LEN);
        const sign = val > 0 ? 1 : -1;
        const arrowDir = dir.clone().multiplyScalar(sign);
        const tip = arrowDir.clone().multiplyScalar(len);
        const tail = new THREE.Vector3(0, 0, 0);

        const quat = new THREE.Quaternion().setFromUnitVectors(defaultUp, arrowDir);
        const euler = new THREE.Euler().setFromQuaternion(quat);

        return (
          <group key={label}>
            <Line points={[tail, tip]} color={ARROW_COLOR} lineWidth={2.5} />
            <mesh position={tip.toArray()} rotation={euler}>
              <coneGeometry args={[0.06, 0.15, 8]} />
              <meshStandardMaterial color={ARROW_COLOR} />
            </mesh>
            <Html position={tip.toArray()} center style={{ pointerEvents: 'none' }}>
              <div
                className="px-1 py-0.5 rounded text-[10px] font-mono whitespace-nowrap"
                style={{
                  background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
                  color: ARROW_COLOR,
                  border: `1px solid ${ARROW_COLOR}`,
                }}
              >
                {label}={(val / 1000).toFixed(2)} kN
              </div>
            </Html>
          </group>
        );
      })}

      {moments.map(({ val, label }) => {
        if (Math.abs(val) < 1e-6) return null;
        return (
          <Html key={label} position={[0, -0.3, 0]} center style={{ pointerEvents: 'none' }}>
            <div
              className="px-1 py-0.5 rounded text-[10px] font-mono whitespace-nowrap"
              style={{
                background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
                color: '#66bb6a',
                border: '1px solid #66bb6a',
              }}
            >
              {label}={(val / 1000).toFixed(2)} kN·m
            </div>
          </Html>
        );
      })}
    </group>
  );
}

export function ReactionArrows() {
  const results = useResultStore(s => s.results);
  const resultView = useUIStore(s => s.resultView);

  if (!results || resultView !== 'reactions') return null;

  return (
    <>
      {results.reactions.map(r => (
        <ReactionAtNode
          key={r.nodeId}
          nodeId={r.nodeId}
          fx={r.fx} fy={r.fy} fz={r.fz}
          mx={r.mx} my={r.my} mz={r.mz}
        />
      ))}
    </>
  );
}
