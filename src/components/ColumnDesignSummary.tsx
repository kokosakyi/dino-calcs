import { useCallback } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { ColumnDesignResult, SteelGrade, BucklingAxis } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, checkSectionClass } from '../utils/steelDesign';

interface ColumnDesignSummaryProps {
  result: ColumnDesignResult;
  factoredAxialLoad: number;
  steelGrade: SteelGrade;
  bucklingAxis: BucklingAxis;
  effectiveLengthFactor: number;
}

export function ColumnDesignSummary({ result, factoredAxialLoad, steelGrade, bucklingAxis, effectiveLengthFactor }: ColumnDesignSummaryProps) {
  const { section, Cr, bucklingResult } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  const sectionClass = checkSectionClass(section, Fy);
  const Ag = parseFloat(section.A);

  const rLabel = bucklingAxis === 'strong' ? 'r_x' : 'r_y';
  const rValue = bucklingAxis === 'strong' ? section.Rx : section.Ry;
  const axisLabel = bucklingAxis === 'strong' ? 'Strong axis (x-x)' : 'Weak axis (y-y)';

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
          <h1>Steel Column Design Calculation</h1>
          <p className="subtitle">CSA S16-19 Design Standard</p>
          <p className="project-info">Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="design-summary-print">
          <h2>Design Summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Design Inputs & Section Properties</h3>
            <p className="section-designation-line">Selected Section: <strong>{section.Dsg}</strong> <span className="imperial-designation">(Imperial: {section.Ds_i})</span></p>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Applied Load</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Factored Axial Load (<MathJax dynamic inline>{"\\(C_f\\)"}</MathJax>)</td>
                      <td>{formatNumber(factoredAxialLoad)} kN</td>
                    </tr>
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
                  </tbody>
                </table>
              </div>

              <div className="input-group">
                <h4>Design Parameters</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Effective Length Factor (K)</td>
                      <td>{effectiveLengthFactor}</td>
                    </tr>
                    <tr>
                      <td>Unbraced Length (L)</td>
                      <td>{formatNumber(bucklingResult.kL / effectiveLengthFactor, 0)} mm</td>
                    </tr>
                    <tr>
                      <td>Buckling Axis</td>
                      <td>{axisLabel}</td>
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
                      <td>Depth (d)</td>
                      <td>{section.D} mm</td>
                    </tr>
                    <tr>
                      <td>Flange Width (b)</td>
                      <td>{section.B} mm</td>
                    </tr>
                    <tr>
                      <td>Flange Thickness (t)</td>
                      <td>{section.T} mm</td>
                    </tr>
                    <tr>
                      <td>Web Thickness (w)</td>
                      <td>{section.W} mm</td>
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
                <h4>Radii of Gyration</h4>
                <table className="inputs-table">
                  <tbody>
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section Classification */}
          <div className="summary-section">
            <h3>Section Classification (CSA S16-19 Table 2)</h3>

            <div className="classification-subsection">
              <h4>Flange Classification</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[\\frac{b_{el}}{t} = ${formatNumber(sectionClass.flangeBT, 2)}\\]`}
                </MathJax>
                <div className="class-limits">
                  <MathJax dynamic>
                    {`\\[\\text{Class 1: } \\frac{b_{el}}{t} \\leq \\frac{145}{\\sqrt{F_y}} = ${formatNumber(sectionClass.flangeLimit1, 2)}\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[\\text{Class 2: } \\frac{b_{el}}{t} \\leq \\frac{170}{\\sqrt{F_y}} = ${formatNumber(sectionClass.flangeLimit2, 2)}\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[\\text{Class 3: } \\frac{b_{el}}{t} \\leq \\frac{200}{\\sqrt{F_y}} = ${formatNumber(sectionClass.flangeLimit3, 2)}\\]`}
                  </MathJax>
                </div>
              </div>
              <div className={`check-result ${sectionClass.flangeClass <= 2 ? 'pass' : sectionClass.flangeClass === 3 ? 'warning' : 'fail'}`}>
                <MathJax dynamic inline>
                  {`\\(\\frac{b_{el}}{t} = ${formatNumber(sectionClass.flangeBT, 2)} ${sectionClass.flangeClass <= 3 ? '≤' : '>'} ${formatNumber(sectionClass.flangeClass === 1 ? sectionClass.flangeLimit1 : sectionClass.flangeClass === 2 ? sectionClass.flangeLimit2 : sectionClass.flangeLimit3, 2)}\\)`}
                </MathJax>
                <span className="classification-result">Flange is Class {sectionClass.flangeClass}</span>
              </div>
            </div>

            <div className="classification-subsection">
              <h4>Web Classification</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[\\frac{h}{w} = ${formatNumber(sectionClass.webHW, 2)}\\]`}
                </MathJax>
                <div className="class-limits">
                  <MathJax dynamic>
                    {`\\[\\text{Class 1: } \\frac{h}{w} \\leq \\frac{1100}{\\sqrt{F_y}} = ${formatNumber(sectionClass.webLimit1, 2)}\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[\\text{Class 2: } \\frac{h}{w} \\leq \\frac{1700}{\\sqrt{F_y}} = ${formatNumber(sectionClass.webLimit2, 2)}\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[\\text{Class 3: } \\frac{h}{w} \\leq \\frac{1900}{\\sqrt{F_y}} = ${formatNumber(sectionClass.webLimit3, 2)}\\]`}
                  </MathJax>
                </div>
              </div>
              <div className={`check-result ${sectionClass.webClass <= 2 ? 'pass' : sectionClass.webClass === 3 ? 'warning' : 'fail'}`}>
                <MathJax dynamic inline>
                  {`\\(\\frac{h}{w} = ${formatNumber(sectionClass.webHW, 2)} ${sectionClass.webClass <= 3 ? '≤' : '>'} ${formatNumber(sectionClass.webClass === 1 ? sectionClass.webLimit1 : sectionClass.webClass === 2 ? sectionClass.webLimit2 : sectionClass.webLimit3, 2)}\\)`}
                </MathJax>
                <span className="classification-result">Web is Class {sectionClass.webClass}</span>
              </div>
            </div>

            <div className={`overall-classification ${sectionClass.overallClass <= 2 ? 'class-ok' : sectionClass.overallClass === 3 ? 'class-warning' : 'class-fail'}`}>
              <strong>Overall Section Classification: Class {sectionClass.overallClass}</strong>
              <p className="classification-note">
                (Governed by {sectionClass.flangeClass >= sectionClass.webClass ? 'flange' : 'web'})
              </p>
            </div>
          </div>

          {/* Compressive Resistance */}
          <div className="summary-section">
            <h3>Compressive Resistance (CSA S16-19 Cl. 13.3.1)</h3>
            <p className="support-type">Buckling about {axisLabel.toLowerCase()}, using <MathJax dynamic inline>{`\\(${rLabel} = ${rValue} \\text{ mm}\\)`}</MathJax></p>

            <div className="ltb-subsection">
              <h4>Effective Length & Slenderness</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[KL = ${effectiveLengthFactor} \\times ${formatNumber(bucklingResult.kL / effectiveLengthFactor, 0)} = ${formatNumber(bucklingResult.kL, 0)} \\text{ mm}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[\\frac{KL}{r} = \\frac{${formatNumber(bucklingResult.kL, 0)}}{${rValue}} = ${formatNumber(bucklingResult.kLr, 2)}\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Euler Buckling Stress</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[F_e = \\frac{\\pi^2 E}{\\left(\\frac{KL}{r}\\right)^2} = \\frac{\\pi^2 \\times 200{,}000}{${formatNumber(bucklingResult.kLr, 2)}^2} = ${formatNumber(bucklingResult.Fe, 1)} \\text{ MPa}\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Non-dimensional Slenderness</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[\\lambda = \\sqrt{\\frac{F_y}{F_e}} = \\sqrt{\\frac{${Fy}}{${formatNumber(bucklingResult.Fe, 1)}}} = ${formatNumber(bucklingResult.lambda, 4)}\\]`}
                </MathJax>
              </div>
            </div>

            <div className="ltb-subsection">
              <h4>Factored Compressive Resistance</h4>
              <div className="equation-block">
                <MathJax dynamic>
                  {`\\[C_r = \\frac{\\phi F_y A_g}{(1 + \\lambda^{2n})^{1/n}}\\]`}
                </MathJax>
                <div className="parameter-values">
                  <p>where n = 1.34</p>
                </div>
                <MathJax dynamic>
                  {`\\[C_r = \\frac{0.9 \\times ${Fy} \\times ${formatNumber(Ag, 0)}}{(1 + ${formatNumber(bucklingResult.lambda, 4)}^{2 \\times 1.34})^{1/1.34}}\\]`}
                </MathJax>
                <MathJax dynamic>
                  {`\\[C_r = ${formatNumber(Cr)} \\text{ kN}\\]`}
                </MathJax>
              </div>
            </div>

            <div className={`check-result ${factoredAxialLoad <= Cr ? 'pass' : 'fail'}`}>
              <MathJax dynamic inline>{`\\(C_f = ${formatNumber(factoredAxialLoad)} \\text{ kN} ${factoredAxialLoad <= Cr ? '\\leq' : '>'} C_r = ${formatNumber(Cr)} \\text{ kN}\\)`}</MathJax>
              <span className="check-icon">{factoredAxialLoad <= Cr ? '✓' : '✗'}</span>
            </div>
          </div>

          {/* Section Properties Table */}
          <div className="summary-section properties-table properties-table-print">
            <h3>Section Properties</h3>
            <table>
              <tbody>
                <tr>
                  <td>Depth (d)</td>
                  <td>{section.D} mm</td>
                  <td>Flange Width (b)</td>
                  <td>{section.B} mm</td>
                </tr>
                <tr>
                  <td>Flange Thickness (t)</td>
                  <td>{section.T} mm</td>
                  <td>Web Thickness (w)</td>
                  <td>{section.W} mm</td>
                </tr>
                <tr>
                  <td><MathJax dynamic inline>{"\\(I_x\\)"}</MathJax></td>
                  <td>{section.Ix} ×10⁶ mm⁴</td>
                  <td><MathJax dynamic inline>{"\\(I_y\\)"}</MathJax></td>
                  <td>{section.Iy} ×10⁶ mm⁴</td>
                </tr>
                <tr>
                  <td><MathJax dynamic inline>{"\\(r_x\\)"}</MathJax></td>
                  <td>{section.Rx} mm</td>
                  <td><MathJax dynamic inline>{"\\(r_y\\)"}</MathJax></td>
                  <td>{section.Ry} mm</td>
                </tr>
                <tr>
                  <td>Area (A)</td>
                  <td>{section.A} mm²</td>
                  <td>Mass</td>
                  <td>{section.Mass} kg/m</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print-footer">
            <span>DinoCalcs - Steel Column Design Tool</span>
            <span>Calculations per CSA S16-19</span>
          </div>
        </div>
      </div>
    </div>
  );
}
