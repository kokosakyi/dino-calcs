import { useThree } from '@react-three/fiber';
import { useUIStore } from '../../stores/uiStore';
import type { ViewPreset } from '../../types/model';
import { useEffect } from 'react';

const VIEW_POSITIONS: Record<ViewPreset, [number, number, number]> = {
  front: [0, 0, 15],
  top: [0, 15, 0.01],
  right: [15, 0, 0],
  isometric: [10, 8, 10],
};

function ViewButton({ preset, label }: { preset: ViewPreset; label: string }) {
  const setViewPreset = useUIStore(s => s.setViewPreset);
  return (
    <button
      onClick={() => setViewPreset(preset)}
      className="px-2.5 py-1.5 text-xs bg-[var(--color-bg-panel)]/80 text-[var(--color-text-secondary)] rounded
        hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
    >
      {label}
    </button>
  );
}

function ViewPresetApplier() {
  const viewPreset = useUIStore(s => s.viewPreset);
  const { camera } = useThree();

  useEffect(() => {
    const pos = VIEW_POSITIONS[viewPreset];
    if (pos) {
      camera.position.set(...pos);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [viewPreset, camera]);

  return null;
}

export function ViewPresetButtons() {
  return (
    <>
      <div className="absolute top-2 left-2 flex gap-1 z-10">
        <ViewButton preset="front" label="Front" />
        <ViewButton preset="top" label="Top" />
        <ViewButton preset="right" label="Right" />
        <ViewButton preset="isometric" label="Iso" />
      </div>
    </>
  );
}

export { ViewPresetApplier };
