import type { Object3D } from 'three';
import { useModelStore } from '../../stores/modelStore';

/** Decorative only — do not steal raycasts from nodes/members underneath. */
const skipRaycast: Object3D['raycast'] = () => {};

function PinSupport({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, 0]} raycast={skipRaycast}>
        <coneGeometry args={[0.2, 0.35, 3]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
      <mesh position={[0, -0.22, 0]} raycast={skipRaycast}>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
    </group>
  );
}

function FixedSupport({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} raycast={skipRaycast}>
        <boxGeometry args={[0.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
      {/* Hatching lines */}
      {[-0.15, 0, 0.15].map((offset, i) => (
        <mesh key={i} position={[offset, -0.35, 0]} rotation={[0, 0, Math.PI / 6]} raycast={skipRaycast}>
          <boxGeometry args={[0.02, 0.15, 0.02]} />
          <meshStandardMaterial color="#4a8a4e" />
        </mesh>
      ))}
    </group>
  );
}

function RollerSupport({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={skipRaycast}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
      <mesh position={[0, -0.32, 0]} raycast={skipRaycast}>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#66bb6a" />
      </mesh>
    </group>
  );
}
function SupportGizmo({ nodeId }: { nodeId: string }) {
  const getNode = useModelStore(s => s.getNode);
  const getSupport = useModelStore(s => s.getSupport);

  const node = getNode(nodeId);
  const support = getSupport(nodeId);
  if (!node || !support) return null;

  const pos: [number, number, number] = [node.x, node.y, node.z];

  const isFixed = support.dx && support.dy && support.dz && support.rx && support.ry && support.rz;
  const isPin = support.dx && support.dy && support.dz && !support.rx && !support.ry && !support.rz;

  if (isFixed) return <FixedSupport position={pos} />;
  if (isPin) return <PinSupport position={pos} />;
  return <RollerSupport position={pos} />;
}

export function SupportGizmos() {
  const supports = useModelStore(s => s.supports);
  return (
    <>
      {supports.map(s => (
        <SupportGizmo key={s.nodeId} nodeId={s.nodeId} />
      ))}
    </>
  );
}
