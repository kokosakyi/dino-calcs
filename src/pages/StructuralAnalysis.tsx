import { useEffect } from 'react';
import SasApp from '../sas/SasApp';
import '../sas/styles/globals.css';

/**
 * Full-screen SAS (Structural Analysis Software) workspace.
 * Routed outside the main sidebar layout so the 3D viewport can use the full window.
 */
export function StructuralAnalysis() {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div id="sas-root" className="fixed inset-0 z-[300]">
      <SasApp />
    </div>
  );
}
