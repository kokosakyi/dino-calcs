import { MathJax } from 'better-react-mathjax';
import type { ColumnDesignResult, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, utilizationPercent, checkSectionClass } from '../utils/steelDesign';

interface ColumnResultCardProps {
  result: ColumnDesignResult;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
  steelGrade: SteelGrade;
  bucklingAxis: 'strong' | 'weak';
}

export function ColumnResultCard({ result, rank, isSelected, onSelect, steelGrade, bucklingAxis }: ColumnResultCardProps) {
  const { section, Cr, axialUtilization, bucklingResult } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  const sectionClass = checkSectionClass(section, Fy);

  const rLabel = bucklingAxis === 'strong' ? 'r_x' : 'r_y';
  const rValue = bucklingAxis === 'strong' ? section.Rx : section.Ry;

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
          <span className="label">Area</span>
          <span className="value">{section.A} mm²</span>
        </div>
        <div className="property">
          <span className="label">
            <MathJax dynamic inline>{`\\(${rLabel}\\)`}</MathJax>
          </span>
          <span className="value">{rValue} mm</span>
        </div>
        <div className="property">
          <span className="label">KL/r</span>
          <span className="value">{formatNumber(bucklingResult.kLr, 1)}</span>
        </div>
        <div className="property class-indicator">
          <span className="label">Class</span>
          <span className={`value class-${sectionClass.overallClass}`}>{sectionClass.overallClass}</span>
        </div>
      </div>

      <div className="resistance-values">
        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(C_r\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Cr)} kN</div>
          <div className={`utilization-bar ${getUtilizationColor(axialUtilization)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(axialUtilization * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(axialUtilization)}</div>
        </div>
      </div>
    </div>
  );
}
