import { useCallback } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { AngleDesignResult, SteelGrade, DeflectionResult } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, calculateActualDeflection } from '../utils/steelDesign';

interface AngleDesignSummaryProps {
  result: AngleDesignResult;
  factoredMoment: number;
  factoredShear: number;
  steelGrade: SteelGrade;
  designAxis: 'x' | 'y';
  deflectionResult?: DeflectionResult;
  span?: number;
  udlSLS?: number;
}

export function AngleDesignSummary({ result, factoredMoment, factoredShear, steelGrade, designAxis, deflectionResult, span, udlSLS }: AngleDesignSummaryProps) {
  const { section, Mrx, Mry, Vrx, Vry } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  
  const Sxx = parseFloat(section.Sx) * 1000;
  const Syy = parseFloat(section.Sy) * 1000;
  const A = parseFloat(section.A);
  const Ix = parseFloat(section.Ix);

  // Calculate actual deflection if we have the necessary data
  const actualDeflection = (span && udlSLS) ? calculateActualDeflection(udlSLS, span, Ix) : undefined;

  const handlePrint = useCallback(() => {
    setTimeout(() => {
      window.print();
    }, 100);
  }, []);

  return (
    <div className="design-summary">
      <div className="print-actions">
        <button className="print-btn" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print to PDF
        </button>
      </div>

      <div className="print-container">
        <div className="print-header">
          <h1>Angle Section Design Calculation</h1>
          <p className="subtitle">Preliminary Design Using Simplified Formulas</p>
          <p className="project-info">Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="placeholder-warning">
            <strong>⚠️ IMPORTANT:</strong> This calculation uses simplified placeholder formulas for preliminary design only. Replace with accurate CSA S16-19 formulas for final design.
          </div>
        </div>

        <div className="design-summary-print">
          <h2>Design Summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Design Inputs & Section Properties</h3>
            <p className="section-designation-line">Selected Section: <strong>{section.Dsg}</strong> <span className="imperial-designation">(Imperial: {section.Ds_i})</span></p>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Applied Loads</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Factored Moment (<MathJax dynamic inline>{"\\(M_f\\)"}</MathJax>)</td>
                      <td>{formatNumber(factoredMoment)} kN·m</td>
                    </tr>
                    <tr>
                      <td>Factored Shear (<MathJax dynamic inline>{"\\(V_f\\)"}</MathJax>)</td>
                      <td>{formatNumber(factoredShear)} kN</td>
                    </tr>
                    {span && (
                      <tr>
                        <td>Span Length (L)</td>
                        <td>{formatNumber(span, 0)} mm</td>
                      </tr>
                    )}
                    {udlSLS && (
                      <tr>
                        <td>Service Load (<MathJax dynamic inline>{"\\(w_s\\)"}</MathJax>)</td>
                        <td>{formatNumber(udlSLS, 2)} kN/m</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Material Properties</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Steel Grade</td>
                      <td>{steelGrade}</td>
                    </tr>
                    <tr>
                      <td>Yield Strength (<MathJax dynamic inline>{"\\(F_y\\)"}</MathJax>)</td>
                      <td>{Fy} MPa</td>
                    </tr>
                    <tr>
                      <td>Modulus of Elasticity (E)</td>
                      <td>200,000 MPa</td>
                    </tr>
                    <tr>
                      <td>Design Axis</td>
                      <td>{designAxis.toUpperCase()}-axis</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="input-group">
                <h4>Design Parameters</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Section Type</td>
                      <td>Single Angle (L)</td>
                    </tr>
                    {deflectionResult && span && (
                      <tr>
                        <td>Deflection Limit</td>
                        <td>L/{Math.round((span || 0) / deflectionResult.allowableDeflection)}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Resistance Factor (<MathJax dynamic inline>{"\\(\\phi\\)"}</MathJax>)</td>
                      <td>0.9</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Geometric Properties</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Leg 1 (d)</td>
                      <td>{section.D} mm</td>
                    </tr>
                    <tr>
                      <td>Leg 2 (b)</td>
                      <td>{section.B} mm</td>
                    </tr>
                    <tr>
                      <td>Thickness (t)</td>
                      <td>{section.T} mm</td>
                    </tr>
                    <tr>
                      <td>Area (A)</td>
                      <td>{section.A} mm²</td>
                    </tr>
                    <tr>
                      <td>Mass</td>
                      <td>{section.Mass} kg/m</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="input-group">
                <h4>Section Moduli</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(S_x\\)"}</MathJax> (Elastic)</td>
                      <td>{section.Sx} ×10³ mm³</td>
                    </tr>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(S_y\\)"}</MathJax> (Elastic)</td>
                      <td>{section.Sy} ×10³ mm³</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Moments of Inertia</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(I_x\\)"}</MathJax></td>
                      <td>{section.Ix} ×10⁶ mm⁴</td>
                    </tr>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(I_y\\)"}</MathJax></td>
                      <td>{section.Iy} ×10⁶ mm⁴</td>
                    </tr>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(r_x\\)"}</MathJax></td>
                      <td>{section.Rx} mm</td>
                    </tr>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(r_y\\)"}</MathJax></td>
                      <td>{section.Ry} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h3>Moment Resistance (Placeholder Formula)</h3>
            <p className="support-type">Simplified calculation using elastic section modulus</p>
            
            <div className="equation-block">
              <h4>X-Axis Bending</h4>
              <MathJax dynamic>
                {`\\[M_{r,x} = \\phi S_x F_y\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[M_{r,x} = 0.9 \\times ${formatNumber(Sxx, 0)} \\text{ mm}^3 \\times ${Fy} \\text{ MPa}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[M_{r,x} = ${formatNumber(Mrx)} \\text{ kN·m}\\]`}
              </MathJax>
            </div>

            <div className="equation-block">
              <h4>Y-Axis Bending</h4>
              <MathJax dynamic>
                {`\\[M_{r,y} = \\phi S_y F_y\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[M_{r,y} = 0.9 \\times ${formatNumber(Syy, 0)} \\text{ mm}^3 \\times ${Fy} \\text{ MPa}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[M_{r,y} = ${formatNumber(Mry)} \\text{ kN·m}\\]`}
              </MathJax>
            </div>

            <div className={`check-result ${designAxis === 'x' ? (factoredMoment <= Mrx ? 'pass' : 'fail') : (factoredMoment <= Mry ? 'pass' : 'fail')}`}>
              <MathJax dynamic inline>
                {designAxis === 'x' 
                  ? `\\(M_f = ${formatNumber(factoredMoment)} \\text{ kN·m} ${factoredMoment <= Mrx ? '\\leq' : '>'} M_{r,x} = ${formatNumber(Mrx)} \\text{ kN·m}\\)`
                  : `\\(M_f = ${formatNumber(factoredMoment)} \\text{ kN·m} ${factoredMoment <= Mry ? '\\leq' : '>'} M_{r,y} = ${formatNumber(Mry)} \\text{ kN·m}\\)`
                }
              </MathJax>
              <span className="check-icon">{(designAxis === 'x' ? factoredMoment <= Mrx : factoredMoment <= Mry) ? '✓' : '✗'}</span>
            </div>
          </div>

          <div className="summary-section">
            <h3>Shear Resistance (Placeholder Formula)</h3>
            <p className="support-type">Simplified calculation using half area approximation</p>
            
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[V_r = \\phi \\times \\frac{A}{2} \\times 0.66 F_y\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_{r,x} = 0.9 \\times \\frac{${formatNumber(A, 0)}}{2} \\times 0.66 \\times ${Fy} / 1000\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_{r,x} = ${formatNumber(Vrx)} \\text{ kN}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_{r,y} = ${formatNumber(Vry)} \\text{ kN}\\]`}
              </MathJax>
            </div>

            <div className={`check-result ${designAxis === 'x' ? (factoredShear <= Vrx ? 'pass' : 'fail') : (factoredShear <= Vry ? 'pass' : 'fail')}`}>
              <MathJax dynamic inline>
                {designAxis === 'x'
                  ? `\\(V_f = ${formatNumber(factoredShear)} \\text{ kN} ${factoredShear <= Vrx ? '\\leq' : '>'} V_{r,x} = ${formatNumber(Vrx)} \\text{ kN}\\)`
                  : `\\(V_f = ${formatNumber(factoredShear)} \\text{ kN} ${factoredShear <= Vry ? '\\leq' : '>'} V_{r,y} = ${formatNumber(Vry)} \\text{ kN}\\)`
                }
              </MathJax>
              <span className="check-icon">{(designAxis === 'x' ? factoredShear <= Vrx : factoredShear <= Vry) ? '✓' : '✗'}</span>
            </div>
          </div>

          {deflectionResult && span && udlSLS && actualDeflection !== undefined && (
            <div className="summary-section">
              <h3>Deflection Check (Serviceability)</h3>
              <p className="support-type">Simply supported beam with uniformly distributed load</p>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[\\delta_{max} = \\frac{5 w_s L^4}{384 E I_x}\\]`}
                </MathJax>
                <div className="parameter-values">
                  <p>where:</p>
                  <MathJax dynamic inline>{`\\(w_s = ${formatNumber(udlSLS, 2)} \\text{ kN/m}\\)`}</MathJax>,{' '}
                  <MathJax dynamic inline>{`\\(L = ${formatNumber(span, 0)} \\text{ mm}\\)`}</MathJax>,{' '}
                  <MathJax dynamic inline>{`\\(E = 200{,}000 \\text{ MPa}\\)`}</MathJax>,{' '}
                  <MathJax dynamic inline>{`\\(I_x = ${section.Ix} \\times 10^6 \\text{ mm}^4\\)`}</MathJax>
                </div>
                <MathJax dynamic>
                  {`\\[\\delta_{actual} = ${formatNumber(actualDeflection, 2)} \\text{ mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[\\delta_{allowable} = \\frac{L}{${Math.round(span / deflectionResult.allowableDeflection)}} = ${formatNumber(deflectionResult.allowableDeflection, 2)} \\text{ mm}\\]`}
                </MathJax>
              </div>
              <div className={`check-result ${actualDeflection <= deflectionResult.allowableDeflection ? 'pass' : 'fail'}`}>
                <MathJax dynamic inline>{`\\(\\delta_{actual} = ${formatNumber(actualDeflection, 2)} \\text{ mm} ${actualDeflection <= deflectionResult.allowableDeflection ? '\\leq' : '>'} \\delta_{allowable} = ${formatNumber(deflectionResult.allowableDeflection, 2)} \\text{ mm}\\)`}</MathJax>
                <span className="check-icon">{actualDeflection <= deflectionResult.allowableDeflection ? '✓' : '✗'}</span>
              </div>
              <div className="deflection-ratio">
                <span>Actual deflection ratio: L/{formatNumber(span / actualDeflection, 0)}</span>
              </div>
            </div>
          )}

          <div className="summary-section properties-table properties-table-print">
            <h3>Section Properties</h3>
            <table>
              <tbody>
                <tr>
                  <td>Leg 1 (d)</td>
                  <td>{section.D} mm</td>
                  <td>Leg 2 (b)</td>
                  <td>{section.B} mm</td>
                </tr>
                <tr>
                  <td>Thickness (t)</td>
                  <td>{section.T} mm</td>
                  <td>Area (A)</td>
                  <td>{section.A} mm²</td>
                </tr>
                <tr>
                  <td><MathJax dynamic inline>{"\\(I_x\\)"}</MathJax></td>
                  <td>{section.Ix} ×10⁶ mm⁴</td>
                  <td><MathJax dynamic inline>{"\\(I_y\\)"}</MathJax></td>
                  <td>{section.Iy} ×10⁶ mm⁴</td>
                </tr>
                <tr>
                  <td><MathJax dynamic inline>{"\\(S_x\\)"}</MathJax></td>
                  <td>{section.Sx} ×10³ mm³</td>
                  <td><MathJax dynamic inline>{"\\(S_y\\)"}</MathJax></td>
                  <td>{section.Sy} ×10³ mm³</td>
                </tr>
                <tr>
                  <td>Mass</td>
                  <td>{section.Mass} kg/m</td>
                  <td>Centroid X</td>
                  <td>{section.X} mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print-footer">
            <span>DinoCalcs - Angle Section Design Tool</span>
            <span>⚠️ Simplified Placeholder Formulas - For Preliminary Design Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
