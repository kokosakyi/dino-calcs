import { MathJax } from 'better-react-mathjax';
import type { ChannelDesignResult, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, utilizationPercent, checkChannelSectionClass } from '../utils/steelDesign';

interface ChannelResultCardProps {
  result: ChannelDesignResult;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
  steelGrade: SteelGrade;
}

export function ChannelResultCard({ result, rank, isSelected, onSelect, steelGrade }: ChannelResultCardProps) {
  const { section, Mr, Vr, momentUtilization, shearUtilization, deflectionUtilization } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  const sectionClass = checkChannelSectionClass(section, Fy);

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
            <MathJax dynamic inline>{"\\(S_x\\)"}</MathJax>
          </span>
          <span className="value">{section.Sx} ×10³ mm³</span>
        </div>
        <div className="property class-indicator">
          <span className="label">Class</span>
          <span className={`value class-${sectionClass.overallClass}`}>{sectionClass.overallClass}</span>
        </div>
      </div>

      <div className="resistance-values">
        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(M_r\\)"}</MathJax>
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
            <MathJax dynamic inline>{"\\(V_r\\)"}</MathJax>
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
              <MathJax dynamic inline>{"\\(I_x\\)"}</MathJax>
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
