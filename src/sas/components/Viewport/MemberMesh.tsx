import { useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useModelStore } from '../../stores/modelStore';
import { useUIStore } from '../../stores/uiStore';
import { Line } from '@react-three/drei';

function MemberLine({ id, nodeI, nodeJ }: { id: string; nodeI: string; nodeJ: string }) {
  const getNode = useModelStore(s => s.getNode);
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const toggleElementSelection = useUIStore(s => s.toggleElementSelection);
  const setSelectedElements = useUIStore(s => s.setSelectedElements);
  const setSelectedNodes = useUIStore(s => s.setSelectedNodes);
  const activeTool = useUIStore(s => s.activeTool);
  const setContextMenu = useUIStore(s => s.setContextMenu);
  const clearContextMenu = useUIStore(s => s.clearContextMenu);

  const nI = getNode(nodeI);
  const nJ = getNode(nodeJ);

  const isSelected = selectedElementIds.includes(id);

  const points = useMemo(() => {
    if (!nI || !nJ) return [new THREE.Vector3(), new THREE.Vector3()];
    return [
      new THREE.Vector3(nI.x, nI.y, nI.z),
      new THREE.Vector3(nJ.x, nJ.y, nJ.z),
    ];
  }, [nI, nJ]);

  const handlePointerDown = useCallback((e: any) => {
    if ((e.button ?? e.nativeEvent?.button) === 2) {
      e.stopPropagation();
      clearContextMenu();
      const cx = e.nativeEvent?.clientX ?? e.clientX ?? 0;
      const cy = e.nativeEvent?.clientY ?? e.clientY ?? 0;
      setSelectedElements([id]);
      setSelectedNodes([]);
      setContextMenu({ x: cx, y: cy, elementId: id });
    }
  }, [id, setSelectedElements, setSelectedNodes, setContextMenu, clearContextMenu]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (activeTool === 'select') {
      if (e.nativeEvent?.ctrlKey || e.ctrlKey) {
        toggleElementSelection(id);
      } else {
        setSelectedElements([id]);
        setSelectedNodes([]);
      }
    } else if (activeTool === 'distributedLoad') {
      setSelectedElements([id]);
    } else if (activeTool === 'support' || activeTool === 'pointLoad') {
      if (!nI || !nJ) return;
      const p = e.point as THREE.Vector3;
      const a = new THREE.Vector3(nI.x, nI.y, nI.z);
      const b = new THREE.Vector3(nJ.x, nJ.y, nJ.z);
      const nearer = p.distanceToSquared(a) <= p.distanceToSquared(b) ? nodeI : nodeJ;
      setSelectedNodes([nearer]);
    }
  }, [activeTool, id, nodeI, nodeJ, nI, nJ, toggleElementSelection, setSelectedElements, setSelectedNodes]);

  if (!nI || !nJ) return null;

  const color = isSelected ? '#ffa726' : '#78909c';

  return (
    <Line
      points={points}
      color={color}
      lineWidth={isSelected ? 3 : 2}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    />
  );
}

export function MemberMeshes() {
  const elements = useModelStore(s => s.elements);
  return (
    <>
      {elements.map(e => (
        <MemberLine key={e.id} id={e.id} nodeI={e.nodeI} nodeJ={e.nodeJ} />
      ))}
    </>
  );
}
