import { Grid as DreiGrid } from '@react-three/drei';
import { useUIStore } from '../../stores/uiStore';

export function Grid() {
  const gridVisible = useUIStore(s => s.gridVisible);
  const gridSpacing = useUIStore(s => s.gridSpacing);

  if (!gridVisible) return null;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <DreiGrid
        args={[100, 100]}
        cellSize={gridSpacing}
        cellThickness={0.6}
        cellColor="#2a2a4a"
        sectionSize={gridSpacing * 5}
        sectionThickness={1.2}
        sectionColor="#3a3a5a"
        fadeDistance={80}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  );
}
