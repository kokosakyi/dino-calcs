import type { ReactNode } from 'react';

interface WoodCalculationSectionProps {
  title?: string;
  children: ReactNode;
}

/**
 * Consistent wrapper for O86 wood calculator MathJax solution steps.
 */
export function WoodCalculationSection({ title = 'Solution steps', children }: WoodCalculationSectionProps) {
  return (
    <section className="input-panel wood-calculation-steps">
      <h2>{title}</h2>
      <div className="wood-calculation-steps-body">{children}</div>
    </section>
  );
}

interface WoodCalcStepProps {
  label: string;
  children: ReactNode;
}

export function WoodCalcStep({ label, children }: WoodCalcStepProps) {
  return (
    <div className="wood-calc-step">
      <span className="wood-calc-step-label">{label}</span>
      <div className="wood-calc-step-content">{children}</div>
    </div>
  );
}
