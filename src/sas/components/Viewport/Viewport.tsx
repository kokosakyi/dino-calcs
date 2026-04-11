import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { SceneContent } from './SceneContent';
import { ViewPresetButtons, ViewPresetApplier } from './ViewPresetButtons';
import { useTheme } from '../../../context/ThemeContext';

export function Viewport() {
  const { theme } = useTheme();
  const clearColor = theme === 'dark' ? '#0a0f1a' : '#f8fafc';

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [10, 8, 10], fov: 50, near: 0.1, far: 10000 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(clearColor);
        }}
        key={theme}
      >
        <ambientLight intensity={theme === 'dark' ? 0.6 : 0.8} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} />
        <SceneContent />
        <ViewPresetApplier />
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport labelColor={theme === 'dark' ? 'white' : 'black'} axisHeadScale={0.8} />
        </GizmoHelper>
      </Canvas>
      <ViewPresetButtons />
    </div>
  );
}
