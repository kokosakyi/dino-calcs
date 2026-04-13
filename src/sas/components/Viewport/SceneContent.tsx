import { useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Grid } from './Grid';
import { NodeMeshes } from './NodeMesh';
import { MemberMeshes } from './MemberMesh';
import { SupportGizmos } from './SupportGizmo';
import { LoadArrows } from './LoadArrow';
import { DeformedShape } from './DeformedShape';
import { ForceDiagrams } from './ForceDiagram';
import { ReactionArrows } from './ReactionArrows';
import { useUIStore } from '../../stores/uiStore';
import { useModelStore } from '../../stores/modelStore';

export function SceneContent() {
  const { raycaster } = useThree();
  const activeTool = useUIStore(s => s.activeTool);
  const snapToGrid = useUIStore(s => s.snapToGrid);
  const gridSpacing = useUIStore(s => s.gridSpacing);
  const setCursorWorldPos = useUIStore(s => s.setCursorWorldPos);
  const setContextMenu = useUIStore(s => s.setContextMenu);
  const clearContextMenu = useUIStore(s => s.clearContextMenu);
  const addNode = useModelStore(s => s.addNode);
  const addElement = useModelStore(s => s.addElement);
  const defaultElementType = useUIStore(s => s.defaultElementType);
  const activeSectionId = useUIStore(s => s.activeSectionId);
  const memberStartNodeId = useUIStore(s => s.memberStartNodeId);
  const setMemberStartNodeId = useUIStore(s => s.setMemberStartNodeId);
  const clearSelection = useUIStore(s => s.clearSelection);

  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const intersection = useRef(new THREE.Vector3());

  const snapPoint = useCallback((point: THREE.Vector3) => {
    if (!snapToGrid) return point;
    const s = gridSpacing;
    return new THREE.Vector3(
      Math.round(point.x / s) * s,
      Math.round(point.y / s) * s,
      Math.round(point.z / s) * s,
    );
  }, [snapToGrid, gridSpacing]);

  const handlePointerMove = useCallback((e: THREE.Event & { point?: THREE.Vector3 }) => {
    // @ts-expect-error -- R3F pointer event typing
    const pointer = e.pointer || e;
    if (!pointer) return;
    raycaster.ray.intersectPlane(groundPlane.current, intersection.current);
    const snapped = snapPoint(intersection.current);
    setCursorWorldPos({ x: snapped.x, y: snapped.y, z: snapped.z });
  }, [raycaster, snapPoint, setCursorWorldPos]);

  const handlePointerDown = useCallback((e: any) => {
    if ((e.button ?? e.nativeEvent?.button) === 2) {
      e.stopPropagation();
      clearContextMenu();
      raycaster.ray.intersectPlane(groundPlane.current, intersection.current);
      const snapped = snapPoint(intersection.current);
      const cx = e.nativeEvent?.clientX ?? e.clientX ?? 0;
      const cy = e.nativeEvent?.clientY ?? e.clientY ?? 0;
      setContextMenu({
        x: cx,
        y: cy,
        worldPos: {
          x: parseFloat(snapped.x.toFixed(4)),
          y: parseFloat(snapped.y.toFixed(4)),
          z: parseFloat(snapped.z.toFixed(4)),
        },
      });
    }
  }, [raycaster, snapPoint, setContextMenu, clearContextMenu]);

  const handlePlaneClick = useCallback((e: any) => {
    e.stopPropagation();
    raycaster.ray.intersectPlane(groundPlane.current, intersection.current);
    const snapped = snapPoint(intersection.current);

    if (activeTool === 'node') {
      addNode(
        parseFloat(snapped.x.toFixed(4)),
        parseFloat(snapped.y.toFixed(4)),
        parseFloat(snapped.z.toFixed(4)),
      );
    } else if (activeTool === 'member' && !memberStartNodeId) {
      const node = addNode(
        parseFloat(snapped.x.toFixed(4)),
        parseFloat(snapped.y.toFixed(4)),
        parseFloat(snapped.z.toFixed(4)),
      );
      setMemberStartNodeId(node.id);
    } else if (activeTool === 'member' && memberStartNodeId) {
      const node = addNode(
        parseFloat(snapped.x.toFixed(4)),
        parseFloat(snapped.y.toFixed(4)),
        parseFloat(snapped.z.toFixed(4)),
      );
      addElement(defaultElementType, memberStartNodeId, node.id, activeSectionId);
      setMemberStartNodeId(node.id);
    } else if (activeTool === 'select') {
      clearSelection();
    }
  }, [activeTool, snapPoint, addNode, addElement, memberStartNodeId,
      setMemberStartNodeId, defaultElementType, activeSectionId, raycaster, clearSelection]);

  return (
    <>
      <Grid />
      {/* Invisible XY picking plane at z=0 */}
      <mesh
        position={[0, 0, 0]}
        onClick={handlePlaneClick}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <NodeMeshes />
      <MemberMeshes />
      <SupportGizmos />
      <LoadArrows />
      <DeformedShape />
      <ForceDiagrams />
      <ReactionArrows />
    </>
  );
}
