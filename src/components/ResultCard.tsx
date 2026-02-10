import { MathJax } from 'better-react-mathjax';
import type { DesignResult, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, utilizationPercent, checkSectionClass } from '../utils/steelDesign';

interface ResultCardProps {
  result: DesignResult;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
  steelGrade: SteelGrade;
  lateralSupport: 'continuous' | 'unsupported';
}

export function ResultCard({ result, rank, isSelected, onSelect, steelGrade, lateralSupport }: ResultCardProps) {
  const { section, Mr, Vr, momentUtilization, shearUtilization, deflectionUtilization } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  const sectionClass = checkSectionClass(section, Fy);

  // For continuous lateral support, Class 3 uses Sx instead of Zx
  const isClass3Continuous = sectionClass.overallClass === 3 && lateralSupport === 'continuous';
  const modulusLabel = isClass3Continuous ? 'S_x' : 'Z_x';
  const modulusValue = isClass3Continuous ? section.Sx : section.Zx;

  const getUtilizationColor = (util: number) => {
    if (util <= 0.7) return 'utilization-low';
    if (util <= 0.9) return 'utilization-medium';
    return 'utilization-high';
  };

  return (
    <div
      className={`result-card ${isSelected ? 'selected' : ''} ${rank === 1 ? 'optimal' : ''}`}
      onClick={onSelect}
    >
      {rank === 1 && <div className="optimal-badge">Most Economical</div>}

      <div className="section-header">
        <h3>{section.Dsg}</h3>
        <span className="mass">{section.Mass} kg/m</span>
      </div>

      <div className="section-properties">
        <div className="property">
          <span className="label">Depth</span>
          <span className="value">{section.D} mm</span>
        </div>
        <div className="property">
          <span className="label">Width</span>
          <span className="value">{section.B} mm</span>
        </div>
        <div className="property">
          <span className="label">
            <MathJax inline>{`\\(${modulusLabel}\\)`}</MathJax>
          </span>
          <span className="value">{modulusValue} ×10³ mm³</span>
        </div>
        {isClass3Continuous && (
          <div className="property class-indicator">
            <span className="label">Class</span>
            <span className="value class-3">3</span>
          </div>
        )}
      </div>

      <div className="resistance-values">
        <div className="resistance">
          <div className="resistance-label">
            <MathJax inline>{"\\(M_r\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Mr)} kN·m</div>
          <div className={`utilization-bar ${getUtilizationColor(momentUtilization)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(momentUtilization * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(momentUtilization)}</div>
        </div>

        <div className="resistance">
          <div className="resistance-label">
            <MathJax inline>{"\\(V_r\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Vr)} kN</div>
          <div className={`utilization-bar ${getUtilizationColor(shearUtilization)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(shearUtilization * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(shearUtilization)}</div>
        </div>

        {deflectionUtilization !== undefined && (
          <div className="resistance">
            <div className="resistance-label">
              <MathJax inline>{"\\(I_x\\)"}</MathJax>
            </div>
            <div className="resistance-value">{section.Ix} ×10⁶ mm⁴</div>
            <div className={`utilization-bar ${getUtilizationColor(deflectionUtilization)}`}>
              <div
                className="utilization-fill"
                style={{ width: `${Math.min(deflectionUtilization * 100, 100)}%` }}
              />
            </div>
            <div className="utilization-text">{utilizationPercent(deflectionUtilization)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
