import { useCallback } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { LSection, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber } from '../utils/steelDesign';

interface AngleCapacitySummaryProps {
  result: {
    section: LSection;
    Mrx: number;
    Mry: number;
    Vrx: number;
    Vry: number;
    Tr: number;
    Cr: number;
  };
  steelGrade: SteelGrade;
  effectiveLength: number;
}

export function AngleCapacitySummary({ result, steelGrade, effectiveLength }: AngleCapacitySummaryProps) {
  const { section, Mrx, Mry, Vrx, Vry, Tr, Cr } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  
  const Sxx = parseFloat(section.Sx) * 1000;
  const Syy = parseFloat(section.Sy) * 1000;
  const A = parseFloat(section.A);

  const E = 200_000;
  const KL = effectiveLength;
  const rx = parseFloat(section.Rx);
  const ry = parseFloat(section.Ry);
  const rv = parseFloat(section.Ryp);
  const slend_x = KL / rx;
  const slend_y = KL / ry;
  const slend_z = KL / rv;
  const governing = Math.max(slend_x, slend_y, slend_z);
  let effective_KLr = governing <= 80 ? governing : 32 + 1.25 * slend_z;
  effective_KLr = Math.min(effective_KLr, 200);
  effective_KLr = Math.max(effective_KLr, 0.95 * (KL / rv));
  const Fe = (Math.PI ** 2 * E) / (effective_KLr ** 2);
  const lambda = Math.sqrt(Fy / Fe);
  const n = 1.34;
  const strength_factor = Math.pow(1 + Math.pow(lambda, 2 * n), -1 / n);

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
          <h1>Angle Section Capacity Calculation</h1>
          <p className="subtitle">Preliminary Capacity Check Using Simplified Formulas</p>
          <p className="project-info">Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="placeholder-warning">
            <strong>⚠️ IMPORTANT:</strong> This calculation uses simplified placeholder formulas for preliminary design only. Replace with accurate CSA S16-19 formulas for final design.
          </div>
        </div>

        <div className="design-summary-print">
          <h2>Capacity Summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Section Properties & Material</h3>
            <p className="section-designation-line">Selected Section: <strong>{section.Dsg}</strong> <span className="imperial-designation">(Imperial: {section.Ds_i})</span></p>
            <div className="inputs-grid print-two-col">
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
                    <tr>
                      <td><MathJax dynamic inline>{"\\(r_v\\)"}</MathJax> (minor principal)</td>
                      <td>{section.Ryp} mm</td>
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
          </div>

          <div className="summary-section">
            <h3>Shear Resistance (Placeholder Formula)</h3>
            <p className="support-type">Simplified calculation using half area approximation</p>
            
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[V_r = \\phi \\times \\frac{A}{2} \\times 0.66 F_y\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[A_v \\approx \\frac{A}{2} = \\frac{${formatNumber(A, 0)}}{2} = ${formatNumber(A/2, 0)} \\text{ mm}^2\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_r = 0.9 \\times ${formatNumber(A/2, 0)} \\times 0.66 \\times ${Fy} / 1000\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_{r,x} = ${formatNumber(Vrx)} \\text{ kN}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[V_{r,y} = ${formatNumber(Vry)} \\text{ kN}\\]`}
              </MathJax>
            </div>
          </div>

          <div className="summary-section">
            <h3>Tensile Resistance</h3>
            <p className="support-type">Per CSA S16-19 Clause 13.2 (gross section)</p>
            
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[T_r = \\phi A_g F_y\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[T_r = 0.9 \\times ${formatNumber(A, 0)} \\text{ mm}^2 \\times ${Fy} \\text{ MPa}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[T_r = ${formatNumber(Tr)} \\text{ kN}\\]`}
              </MathJax>
            </div>
            <p className="input-note">
              Note: This is the gross section tensile resistance. For connections with holes, use net section area (An) to calculate Tr = φ × An × Fu.
            </p>
          </div>

          <div className="summary-section">
            <h3>Compressive Resistance (CSA S16-19 Cl. 13.3)</h3>
            <p className="support-type">Modified slenderness for single angles per Clause 13.3.3.2</p>
            
            <div className="equation-block">
              <h4>Slenderness Ratios</h4>
              <MathJax dynamic>
                {`\\[KL = ${formatNumber(KL, 0)} \\text{ mm}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\frac{KL}{r_x} = \\frac{${formatNumber(KL, 0)}}{${formatNumber(rx, 1)}} = ${formatNumber(slend_x, 1)}, \\quad \\frac{KL}{r_y} = \\frac{${formatNumber(KL, 0)}}{${formatNumber(ry, 1)}} = ${formatNumber(slend_y, 1)}, \\quad \\frac{KL}{r_v} = \\frac{${formatNumber(KL, 0)}}{${formatNumber(rv, 1)}} = ${formatNumber(slend_z, 1)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Governing } KL/r = ${formatNumber(governing, 1)}${governing <= 80 ? ' \\leq 80' : ' > 80'}\\]`}
              </MathJax>
            </div>

            <div className="equation-block">
              <h4>Modified Slenderness (Cl. 13.3.3.2)</h4>
              {governing <= 80 ? (
                <MathJax dynamic>
                  {`\\[\\left(\\frac{KL}{r}\\right)_{eff} = ${formatNumber(governing, 1)} \\quad (\\text{since } KL/r \\leq 80)\\]`}
                </MathJax>
              ) : (
                <MathJax dynamic>
                  {`\\[\\left(\\frac{KL}{r}\\right)_{eff} = 32 + 1.25 \\times ${formatNumber(slend_z, 1)} = ${formatNumber(32 + 1.25 * slend_z, 1)}\\]`}
                </MathJax>
              )}
              <MathJax dynamic>
                {`\\[\\text{with } 0.95 \\times \\frac{KL}{r_v} = ${formatNumber(0.95 * KL / rv, 1)} \\text{ check and } \\leq 200 \\text{ limit:}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\left(\\frac{KL}{r}\\right)_{eff} = ${formatNumber(effective_KLr, 1)}\\]`}
              </MathJax>
            </div>

            <div className="equation-block">
              <h4>Elastic Buckling Stress & Column Curve</h4>
              <MathJax dynamic>
                {`\\[F_e = \\frac{\\pi^2 E}{(KL/r)_{eff}^2} = \\frac{\\pi^2 \\times 200{,}000}{${formatNumber(effective_KLr, 1)}^2} = ${formatNumber(Fe, 1)} \\text{ MPa}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\lambda = \\sqrt{\\frac{F_y}{F_e}} = \\sqrt{\\frac{${Fy}}{${formatNumber(Fe, 1)}}} = ${formatNumber(lambda, 3)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[n = 1.34 \\quad (\\text{hot-rolled})\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Strength factor} = \\left(1 + \\lambda^{2n}\\right)^{-1/n} = ${formatNumber(strength_factor, 4)}\\]`}
              </MathJax>
            </div>

            <div className="equation-block">
              <h4>Factored Compressive Resistance</h4>
              <MathJax dynamic>
                {`\\[C_r = \\phi A F_y \\left(1 + \\lambda^{2n}\\right)^{-1/n}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[C_r = 0.9 \\times ${formatNumber(A, 0)} \\times ${Fy} \\times ${formatNumber(strength_factor, 4)} / 1000\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[C_r = ${formatNumber(Cr)} \\text{ kN}\\]`}
              </MathJax>
            </div>
          </div>

          <div className="summary-section">
            <h3>Resistance Summary</h3>
            <table className="properties-table properties-table-print">
              <tbody>
                <tr>
                  <td>Moment Resistance (x-axis)</td>
                  <td><strong>{formatNumber(Mrx)} kN·m</strong></td>
                </tr>
                <tr>
                  <td>Moment Resistance (y-axis)</td>
                  <td><strong>{formatNumber(Mry)} kN·m</strong></td>
                </tr>
                <tr>
                  <td>Shear Resistance (x-axis)</td>
                  <td><strong>{formatNumber(Vrx)} kN</strong></td>
                </tr>
                <tr>
                  <td>Shear Resistance (y-axis)</td>
                  <td><strong>{formatNumber(Vry)} kN</strong></td>
                </tr>
                <tr>
                  <td>Tensile Resistance</td>
                  <td><strong>{formatNumber(Tr)} kN</strong></td>
                </tr>
                <tr>
                  <td>Compressive Resistance (KL = {formatNumber(KL, 0)} mm)</td>
                  <td><strong>{formatNumber(Cr)} kN</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

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
            <span>DinoCalcs - Angle Section Capacity Tool</span>
            <span>Cr per CSA S16-19 Cl. 13.3 | Moment/shear use simplified formulas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
