import { MathJax } from 'better-react-mathjax';
import type { AngleDesignResult, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, utilizationPercent } from '../utils/steelDesign';

interface AngleResultCardProps {
  result: AngleDesignResult;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
  steelGrade: SteelGrade;
  designAxis: 'x' | 'y';
}

export function AngleResultCard({ result, rank, isSelected, onSelect, steelGrade, designAxis }: AngleResultCardProps) {
  const { section, Mrx, Mry, Vrx, Vry, momentUtilizationX, momentUtilizationY, shearUtilizationX, shearUtilizationY, deflectionUtilization } = result;

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
      
      <div className="placeholder-indicator">
        <span className="placeholder-tag">Simplified Formulas</span>
      </div>

      <div className="section-header">
        <h3>{section.Dsg}</h3>
        <span className="mass">{section.Mass} kg/m</span>
      </div>

      <div className="section-properties">
        <div className="property">
          <span className="label">Leg 1 (D)</span>
          <span className="value">{section.D} mm</span>
        </div>
        <div className="property">
          <span className="label">Leg 2 (B)</span>
          <span className="value">{section.B} mm</span>
        </div>
        <div className="property">
          <span className="label">Thickness</span>
          <span className="value">{section.T} mm</span>
        </div>
        <div className="property">
          <span className="label">
            <MathJax dynamic inline>{"\\(I_x\\)"}</MathJax>
          </span>
          <span className="value">{section.Ix} ×10⁶ mm⁴</span>
        </div>
        <div className="property">
          <span className="label">
            <MathJax dynamic inline>{"\\(I_y\\)"}</MathJax>
          </span>
          <span className="value">{section.Iy} ×10⁶ mm⁴</span>
        </div>
      </div>

      <div className="resistance-values">
        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(M_{r,x}\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Mrx)} kN·m</div>
          <div className={`utilization-bar ${getUtilizationColor(momentUtilizationX)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(momentUtilizationX * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(momentUtilizationX)}</div>
        </div>

        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(M_{r,y}\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Mry)} kN·m</div>
          <div className={`utilization-bar ${getUtilizationColor(momentUtilizationY)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(momentUtilizationY * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(momentUtilizationY)}</div>
        </div>

        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(V_{r,x}\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Vrx)} kN</div>
          <div className={`utilization-bar ${getUtilizationColor(shearUtilizationX)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(shearUtilizationX * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(shearUtilizationX)}</div>
        </div>

        <div className="resistance">
          <div className="resistance-label">
            <MathJax dynamic inline>{"\\(V_{r,y}\\)"}</MathJax>
          </div>
          <div className="resistance-value">{formatNumber(Vry)} kN</div>
          <div className={`utilization-bar ${getUtilizationColor(shearUtilizationY)}`}>
            <div
              className="utilization-fill"
              style={{ width: `${Math.min(shearUtilizationY * 100, 100)}%` }}
            />
          </div>
          <div className="utilization-text">{utilizationPercent(shearUtilizationY)}</div>
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
