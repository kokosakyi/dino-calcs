import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { Html } from '@react-three/drei';
import { useCallback } from 'react';

function NodeSphere({ id, x, y, z }: { id: string; x: number; y: number; z: number }) {
  const selectedNodeIds = useUIStore(s => s.selectedNodeIds);
  const toggleNodeSelection = useUIStore(s => s.toggleNodeSelection);
  const setSelectedNodes = useUIStore(s => s.setSelectedNodes);
  const activeTool = useUIStore(s => s.activeTool);
  const memberStartNodeId = useUIStore(s => s.memberStartNodeId);
  const setMemberStartNodeId = useUIStore(s => s.setMemberStartNodeId);
  const addElement = useModelStore(s => s.addElement);
  const defaultElementType = useUIStore(s => s.defaultElementType);
  const activeSectionId = useUIStore(s => s.activeSectionId);

  const isSelected = selectedNodeIds.includes(id);
  const isMemberStart = memberStartNodeId === id;

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();

    if (activeTool === 'select') {
      if (e.nativeEvent?.ctrlKey || e.ctrlKey) {
        toggleNodeSelection(id);
      } else {
        setSelectedNodes([id]);
      }
    } else if (activeTool === 'member') {
      if (!memberStartNodeId) {
        setMemberStartNodeId(id);
      } else if (memberStartNodeId !== id) {
        addElement(defaultElementType, memberStartNodeId, id, activeSectionId);
        setMemberStartNodeId(id);
      }
    } else if (activeTool === 'support' || activeTool === 'pointLoad') {
      setSelectedNodes([id]);
    }
  }, [activeTool, id, memberStartNodeId, toggleNodeSelection, setSelectedNodes,
      setMemberStartNodeId, addElement, defaultElementType, activeSectionId]);

  const color = isMemberStart ? '#ffa726' : isSelected ? '#ffa726' : '#4fc3f7';

  return (
    <group position={[x, y, z]}>
      <mesh
        onPointerDown={e => { e.stopPropagation(); }}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {isSelected && (
        <Html distanceFactor={15} center style={{ pointerEvents: 'none' }}>
          <div className="bg-[var(--color-bg-panel)]/90 text-[var(--color-text-primary)] text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
            {id} ({x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)})
          </div>
        </Html>
      )}
    </group>
  );
}

export function NodeMeshes() {
  const nodes = useModelStore(s => s.nodes);
  return (
    <>
      {nodes.map(n => (
        <NodeSphere key={n.id} id={n.id} x={n.x} y={n.y} z={n.z} />
      ))}
    </>
  );
}
