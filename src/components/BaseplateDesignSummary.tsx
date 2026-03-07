import { useCallback } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { BaseplateDesignInputs, BaseplateDesignResult } from '../types/steel';
import { formatNumber } from '../utils/steelDesign';

interface BaseplateDesignSummaryProps {
  result: BaseplateDesignResult;
  inputs: BaseplateDesignInputs;
  sectionDesignation: string;
}

export function BaseplateDesignSummary({ result, inputs, sectionDesignation }: BaseplateDesignSummaryProps) {
  const { B, N, t_bp, A1, A2, sqrtA2A1, phi_pp, pp_max, m, n, lambda_cant, eccentricity, Mf_per_mm, t_bp_req, bearingUtilization } = result;
  const { d_col, b_f, Cf, Mx, My, Fy_bp, fc, B_conc, N_conc, grout, columnType } = inputs;

  const handlePrint = useCallback(() => {
    setTimeout(() => { window.print(); }, 100);
  }, []);

  const colFactorN = columnType === 'W' ? '0.95' : '0.95';
  const colFactorB = columnType === 'W' ? '0.80' : '0.95';

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
          <h1>Steel Baseplate Design Calculation</h1>
          <p className="subtitle">CSA S16-19 / CSA A23.3-19</p>
          <p className="project-info">Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="design-summary-print">
          <h2>Design Summary</h2>

          {/* Inputs */}
          <div className="summary-section design-inputs-section">
            <h3>Design Inputs</h3>
            <p className="section-designation-line">
              Column: <strong>{sectionDesignation}</strong> ({columnType === 'W' ? 'Wide Flange' : 'HSS'})
            </p>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Column Properties</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Depth (<MathJax dynamic inline>{"\\(d\\)"}</MathJax>)</td>
                      <td>{formatNumber(d_col, 1)} mm</td>
                    </tr>
                    <tr>
                      <td>Flange width (<MathJax dynamic inline>{"\\(b_f\\)"}</MathJax>)</td>
                      <td>{formatNumber(b_f, 1)} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Factored Loads</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(C_f\\)"}</MathJax></td>
                      <td>{formatNumber(Cf)} kN</td>
                    </tr>
                    {Mx > 0 && <tr>
                      <td><MathJax dynamic inline>{"\\(M_x\\)"}</MathJax></td>
                      <td>{formatNumber(Mx)} kN·m</td>
                    </tr>}
                    {My > 0 && <tr>
                      <td><MathJax dynamic inline>{"\\(M_y\\)"}</MathJax></td>
                      <td>{formatNumber(My)} kN·m</td>
                    </tr>}
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Materials</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Baseplate <MathJax dynamic inline>{"\\(F_y\\)"}</MathJax></td>
                      <td>{Fy_bp} MPa</td>
                    </tr>
                    <tr>
                      <td><MathJax dynamic inline>{"\\(f'_c\\)"}</MathJax></td>
                      <td>{fc} MPa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Plate &amp; Pedestal</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Plate width (<MathJax dynamic inline>{"\\(B\\)"}</MathJax>)</td>
                      <td>{B} mm</td>
                    </tr>
                    <tr>
                      <td>Plate depth (<MathJax dynamic inline>{"\\(N\\)"}</MathJax>)</td>
                      <td>{N} mm</td>
                    </tr>
                    <tr>
                      <td>Pedestal width (<MathJax dynamic inline>{"\\(B_{conc}\\)"}</MathJax>)</td>
                      <td>{B_conc} mm</td>
                    </tr>
                    <tr>
                      <td>Pedestal depth (<MathJax dynamic inline>{"\\(N_{conc}\\)"}</MathJax>)</td>
                      <td>{N_conc} mm</td>
                    </tr>
                    <tr>
                      <td>Grout thickness (<MathJax dynamic inline>{"\\(t_{grout}\\)"}</MathJax>)</td>
                      <td>{grout} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bearing Resistance */}
          <div className="summary-section">
            <h3>Concrete Bearing Resistance (CSA A23.3-19)</h3>

            <div className="ltb-subsection">
              <h4>Bearing Areas</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[A_1 = B \\times N = ${B} \\times ${N} = ${formatNumber(A1, 0)} \\text{ mm}^2\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[A_2 = \\min\\!\\left(B_{conc} \\cdot N_{conc},\\; 4\\,A_1\\right) = ${formatNumber(A2, 0)} \\text{ mm}^2\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[\\sqrt{A_2/A_1} = ${formatNumber(sqrtA2A1, 3)} \\leq 2.0\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Factored Bearing Resistance</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[f_{p(r)} = \\phi_c \\cdot \\alpha_1 \\cdot f'_c \\cdot \\sqrt{A_2/A_1}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[f_{p(r)} = 0.65 \\times 0.85 \\times ${fc} \\times ${formatNumber(sqrtA2A1, 3)} = ${formatNumber(phi_pp, 2)} \\text{ MPa}\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Applied Bearing Pressure</h4>
              <div className="equation-block">
                {eccentricity > 0 ? (
                  <>
                    <MathJax dynamic>
                      {`\\[e = \\frac{M}{C_f} = ${formatNumber(eccentricity, 1)} \\text{ mm}\\]`}
                    </MathJax>
                    {eccentricity <= N / 6 ? (
                      <MathJax dynamic>
                        {`\\[e = ${formatNumber(eccentricity, 1)} \\leq \\frac{N}{6} = ${formatNumber(N / 6, 1)} \\text{ mm} \\quad \\Rightarrow \\text{Uniform pressure}\\]`}
                      </MathJax>
                    ) : (
                      <MathJax dynamic>
                        {`\\[e = ${formatNumber(eccentricity, 1)} > \\frac{N}{6} = ${formatNumber(N / 6, 1)} \\text{ mm} \\quad \\Rightarrow \\text{Partial bearing}\\]`}
                      </MathJax>
                    )}
                  </>
                ) : null}
                <MathJax dynamic>
                  {`\\[f_p = \\frac{C_f}{A_1} = \\frac{${formatNumber(Cf * 1000, 0)}}{${formatNumber(A1, 0)}} = ${formatNumber(pp_max, 2)} \\text{ MPa}\\]`}
                </MathJax>
              </div>
            </div>

            <div className={`check-result ${bearingUtilization <= 1.0 ? 'pass' : 'fail'}`}>
              <MathJax dynamic inline>
                {`\\(f_p = ${formatNumber(pp_max, 2)} \\text{ MPa} ${bearingUtilization <= 1.0 ? '\\leq' : '>'} f_{p(r)} = ${formatNumber(phi_pp, 2)} \\text{ MPa}\\)`}
              </MathJax>
              <span className="check-icon">{bearingUtilization <= 1.0 ? '✓' : '✗'}</span>
            </div>
          </div>

          {/* Plate Thickness */}
          <div className="summary-section">
            <h3>Baseplate Thickness (Cantilever Method)</h3>

            <div className="ltb-subsection">
              <h4>Cantilever Distances</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[m = \\frac{N - ${colFactorN}\\,d}{2} = \\frac{${N} - ${colFactorN} \\times ${formatNumber(d_col, 1)}}{2} = ${formatNumber(m, 1)} \\text{ mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[n = \\frac{B - ${colFactorB}\\,b_f}{2} = \\frac{${B} - ${colFactorB} \\times ${formatNumber(b_f, 1)}}{2} = ${formatNumber(n, 1)} \\text{ mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[\\ell = \\max(m,\\,n) = ${formatNumber(lambda_cant, 1)} \\text{ mm}\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Required Thickness</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[M_f = \\frac{f_p \\cdot \\ell^2}{2} = \\frac{${formatNumber(pp_max, 2)} \\times ${formatNumber(lambda_cant, 1)}^2}{2} = ${formatNumber(Mf_per_mm, 1)} \\text{ N·mm/mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[t_{req} = \\sqrt{\\frac{4\\,M_f}{\\phi\\,F_y}} = \\sqrt{\\frac{4 \\times ${formatNumber(Mf_per_mm, 1)}}{0.9 \\times ${Fy_bp}}} = ${formatNumber(t_bp_req, 1)} \\text{ mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[t_{bp} = ${t_bp} \\text{ mm}\\quad\\text{(rounded to next 5 mm with 10% margin)}\\]`}
                </MathJax>
              </div>
            </div>
          </div>

          {/* Final Result */}
          <div className="summary-section properties-table properties-table-print">
            <h3>Final Baseplate Dimensions</h3>
            <table>
              <tbody>
                <tr>
                  <td>Width (B)</td>
                  <td>{B} mm</td>
                  <td>Depth (N)</td>
                  <td>{N} mm</td>
                </tr>
                <tr>
                  <td>Thickness (t<sub>bp</sub>)</td>
                  <td>{t_bp} mm</td>
                  <td>Plate Area (A₁)</td>
                  <td>{formatNumber(A1, 0)} mm²</td>
                </tr>
                <tr>
                  <td>Bearing Pressure</td>
                  <td>{formatNumber(pp_max, 2)} MPa</td>
                  <td>Bearing Resistance</td>
                  <td>{formatNumber(phi_pp, 2)} MPa</td>
                </tr>
                <tr>
                  <td>Utilization</td>
                  <td>{formatNumber(bearingUtilization * 100, 1)}%</td>
                  <td>Status</td>
                  <td>{result.isAdequate ? 'OK' : 'NG'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print-footer">
            <span>DinoCalcs – Baseplate Design Tool</span>
            <span>Calculations per CSA S16-19 / CSA A23.3-19</span>
          </div>
        </div>
      </div>
    </div>
  );
}
