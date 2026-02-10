import { MathJax } from 'better-react-mathjax';
import type { DesignResult, SteelGrade, LateralSupportType, DeflectionResult } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import { formatNumber, checkSectionClass, calculateActualDeflection } from '../utils/steelDesign';

interface DesignSummaryProps {
  result: DesignResult;
  factoredMoment: number;
  factoredShear: number;
  steelGrade: SteelGrade;
  lateralSupport: LateralSupportType;
  deflectionResult?: DeflectionResult;
  span?: number;
  udlSLS?: number;
}

export function DesignSummary({ result, factoredMoment, factoredShear, steelGrade, lateralSupport, deflectionResult, span, udlSLS }: DesignSummaryProps) {
  const { section, Mr, Vr, ltbResult } = result;
  const { Fy } = STEEL_PROPERTIES[steelGrade];
  const Zx = parseFloat(section.Zx) * 1000;
  const Sx = parseFloat(section.Sx) * 1000;
  const d = parseFloat(section.D);
  const w = parseFloat(section.W);
  const Aw = d * w;
  const sectionClass = checkSectionClass(section, Fy);

  // Additional properties for LTB display
  const Iy = parseFloat(section.Iy);
  const J = parseFloat(section.J);
  const Cw = parseFloat(section.Cw);
  const Ix = parseFloat(section.Ix);

  // Determine which modulus to use based on section class
  const isClass3 = sectionClass.overallClass === 3;
  const modulusValue = isClass3 ? Sx : Zx;
  const modulusSymbol = isClass3 ? 'S_x' : 'Z_x';

  // Calculate actual deflection if we have the necessary data
  const actualDeflection = (span && udlSLS) ? calculateActualDeflection(udlSLS, span, Ix) : undefined;

  return (
    <div className="design-summary">
      <h2>Design Summary</h2>

      <div className="summary-section">
        <h3>Selected Section: {section.Dsg}</h3>
        <p className="imperial-designation">Imperial: {section.Ds_i}</p>
      </div>

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
                {`\\[\\text{Class 1: } \\frac{b_{el}}{t} \\leq \\frac{145}{\\sqrt{F_y}} = \\frac{145}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.flangeLimit1, 2)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Class 2: } \\frac{b_{el}}{t} \\leq \\frac{170}{\\sqrt{F_y}} = \\frac{170}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.flangeLimit2, 2)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Class 3: } \\frac{b_{el}}{t} \\leq \\frac{200}{\\sqrt{F_y}} = \\frac{200}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.flangeLimit3, 2)}\\]`}
              </MathJax>
            </div>
          </div>
          <div className={`check-result ${sectionClass.flangeClass <= 2 ? 'pass' : sectionClass.flangeClass === 3 ? 'warning' : 'fail'}`}>
            <MathJax dynamic inline>
              {`\\(\\frac{b_{el}}{t} = ${formatNumber(sectionClass.flangeBT, 2)} ${sectionClass.flangeClass === 1 ? '≤' : sectionClass.flangeClass === 2 ? '≤' : sectionClass.flangeClass === 3 ? '≤' : '>'} ${formatNumber(sectionClass.flangeClass === 1 ? sectionClass.flangeLimit1 : sectionClass.flangeClass === 2 ? sectionClass.flangeLimit2 : sectionClass.flangeLimit3, 2)}\\)`}
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
                {`\\[\\text{Class 1: } \\frac{h}{w} \\leq \\frac{1100}{\\sqrt{F_y}} = \\frac{1100}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.webLimit1, 2)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Class 2: } \\frac{h}{w} \\leq \\frac{1700}{\\sqrt{F_y}} = \\frac{1700}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.webLimit2, 2)}\\]`}
              </MathJax>
              <MathJax dynamic>
                {`\\[\\text{Class 3: } \\frac{h}{w} \\leq \\frac{1900}{\\sqrt{F_y}} = \\frac{1900}{\\sqrt{${Fy}}} = ${formatNumber(sectionClass.webLimit3, 2)}\\]`}
              </MathJax>
            </div>
          </div>
          <div className={`check-result ${sectionClass.webClass <= 2 ? 'pass' : sectionClass.webClass === 3 ? 'warning' : 'fail'}`}>
            <MathJax dynamic inline>
              {`\\(\\frac{h}{w} = ${formatNumber(sectionClass.webHW, 2)} ${sectionClass.webClass === 1 ? '≤' : sectionClass.webClass === 2 ? '≤' : sectionClass.webClass === 3 ? '≤' : '>'} ${formatNumber(sectionClass.webClass === 1 ? sectionClass.webLimit1 : sectionClass.webClass === 2 ? sectionClass.webLimit2 : sectionClass.webLimit3, 2)}\\)`}
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

      {lateralSupport === 'continuous' ? (
        <div className="summary-section">
          <h3>Moment Resistance (CSA S16-19 Cl. 13.5)</h3>
          <p className="support-type">Continuous lateral support to compression flange</p>
          {isClass3 && (
            <p className="class-note">Class 3 section — using elastic section modulus (Sₓ)</p>
          )}
          <div className="equation-block">
            <MathJax dynamic>
              {`\\[M_r = \\phi ${modulusSymbol} F_y\\]`}
            </MathJax>
            <MathJax dynamic>
              {`\\[M_r = 0.9 \\times ${formatNumber(modulusValue, 0)} \\text{ mm}^3 \\times ${Fy} \\text{ MPa}\\]`}
            </MathJax>
            <MathJax dynamic>
              {`\\[M_r = ${formatNumber(Mr)} \\text{ kN·m}\\]`}
            </MathJax>
          </div>
          <div className="check-result pass">
            <MathJax dynamic inline>{`\\(M_f = ${formatNumber(factoredMoment)} \\text{ kN·m} \\leq M_r = ${formatNumber(Mr)} \\text{ kN·m}\\)`}</MathJax>
            <span className="check-icon">✓</span>
          </div>
        </div>
      ) : ltbResult && (
        <div className="summary-section">
          <h3>Moment Resistance (CSA S16-19 Cl. 13.6)</h3>
          <p className="support-type">Laterally unsupported beam segment</p>

          <div className="ltb-subsection">
            <h4>Plastic Moment</h4>
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[M_p = Z_x F_y = ${formatNumber(Zx, 0)} \\times ${Fy} / 10^6 = ${formatNumber(ltbResult.Mp)} \\text{ kN·m}\\]`}
              </MathJax>
            </div>
          </div>

          <div className="ltb-subsection">
            <h4>Critical Elastic Moment</h4>
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[M_u = \\frac{\\omega_2 \\pi}{L}\\sqrt{EI_yGJ + \\left(\\frac{\\pi E}{L}\\right)^2 I_y C_w}\\]`}
              </MathJax>
              <div className="parameter-values">
                <p>where:</p>
                <MathJax dynamic inline>{`\\(\\omega_2 = ${formatNumber(ltbResult.omega2, 2)}\\)`}</MathJax>,{' '}
                <MathJax dynamic inline>{`\\(L = ${formatNumber(ltbResult.unbracedLength, 0)} \\text{ mm}\\)`}</MathJax>,{' '}
                <MathJax dynamic inline>{`\\(E = 200{,}000 \\text{ MPa}\\)`}</MathJax>,{' '}
                <MathJax dynamic inline>{`\\(G = 77{,}000 \\text{ MPa}\\)`}</MathJax>
                <br />
                <MathJax dynamic inline>{`\\(I_y = ${Iy} \\times 10^6 \\text{ mm}^4\\)`}</MathJax>,{' '}
                <MathJax dynamic inline>{`\\(J = ${J} \\times 10^3 \\text{ mm}^4\\)`}</MathJax>,{' '}
                <MathJax dynamic inline>{`\\(C_w = ${Cw} \\times 10^9 \\text{ mm}^6\\)`}</MathJax>
              </div>
              <MathJax dynamic>
                {`\\[M_u = ${formatNumber(ltbResult.Mu)} \\text{ kN·m}\\]`}
              </MathJax>
            </div>
          </div>

          <div className="ltb-subsection">
            <h4>Factored Moment Resistance</h4>
            <div className="equation-block">
              <MathJax dynamic>
                {`\\[0.67 M_p = 0.67 \\times ${formatNumber(ltbResult.Mp)} = ${formatNumber(0.67 * ltbResult.Mp)} \\text{ kN·m}\\]`}
              </MathJax>

              {ltbResult.governingCase === 'elastic_ltb' ? (
                <>
                  <div className="case-indicator">
                    <MathJax dynamic inline>{`\\(M_u = ${formatNumber(ltbResult.Mu)} \\leq 0.67M_p = ${formatNumber(0.67 * ltbResult.Mp)}\\)`}</MathJax>
                    <span> → Elastic LTB governs</span>
                  </div>
                  <MathJax dynamic>
                    {`\\[M_r = \\phi M_u = 0.9 \\times ${formatNumber(ltbResult.Mu)} = ${formatNumber(Mr)} \\text{ kN·m}\\]`}
                  </MathJax>
                </>
              ) : ltbResult.governingCase === 'inelastic_ltb' ? (
                <>
                  <div className="case-indicator">
                    <MathJax dynamic inline>{`\\(M_u = ${formatNumber(ltbResult.Mu)} > 0.67M_p = ${formatNumber(0.67 * ltbResult.Mp)}\\)`}</MathJax>
                    <span> → Inelastic LTB governs</span>
                  </div>
                  <MathJax dynamic>
                    {`\\[M_r = 1.15\\phi M_p\\left(1 - \\frac{0.28 M_p}{M_u}\\right)\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[M_r = 1.15 \\times 0.9 \\times ${formatNumber(ltbResult.Mp)}\\left(1 - \\frac{0.28 \\times ${formatNumber(ltbResult.Mp)}}{${formatNumber(ltbResult.Mu)}}\\right)\\]`}
                  </MathJax>
                  <MathJax dynamic>
                    {`\\[M_r = ${formatNumber(Mr)} \\text{ kN·m}\\]`}
                  </MathJax>
                </>
              ) : (
                <>
                  <div className="case-indicator">
                    <MathJax dynamic inline>{`\\(M_u = ${formatNumber(ltbResult.Mu)} > 0.67M_p\\)`}</MathJax>
                    <span> → Yielding governs (Mr capped at φMp)</span>
                  </div>
                  <MathJax dynamic>
                    {`\\[M_r = \\phi M_p = 0.9 \\times ${formatNumber(ltbResult.Mp)} = ${formatNumber(Mr)} \\text{ kN·m}\\]`}
                  </MathJax>
                </>
              )}
            </div>
          </div>

          <div className={`check-result ${factoredMoment <= Mr ? 'pass' : 'fail'}`}>
            <MathJax dynamic inline>{`\\(M_f = ${formatNumber(factoredMoment)} \\text{ kN·m} ${factoredMoment <= Mr ? '\\leq' : '>'} M_r = ${formatNumber(Mr)} \\text{ kN·m}\\)`}</MathJax>
            <span className="check-icon">{factoredMoment <= Mr ? '✓' : '✗'}</span>
          </div>
        </div>
      )}

      <div className="summary-section">
        <h3>Shear Resistance (CSA S16-19 Cl. 13.4.1.1)</h3>
        <div className="equation-block">
          <MathJax dynamic>
            {`\\[V_r = \\phi A_w (0.66 F_y)\\]`}
          </MathJax>
          <MathJax dynamic>
            {`\\[A_w = d \\times w = ${formatNumber(d, 0)} \\times ${formatNumber(w, 1)} = ${formatNumber(Aw, 0)} \\text{ mm}^2\\]`}
          </MathJax>
          <MathJax dynamic>
            {`\\[V_r = 0.9 \\times ${formatNumber(Aw, 0)} \\times 0.66 \\times ${Fy} / 1000\\]`}
          </MathJax>
          <MathJax dynamic>
            {`\\[V_r = ${formatNumber(Vr)} \\text{ kN}\\]`}
          </MathJax>
        </div>
        <div className="check-result pass">
          <MathJax dynamic inline>{`\\(V_f = ${formatNumber(factoredShear)} \\text{ kN} \\leq V_r = ${formatNumber(Vr)} \\text{ kN}\\)`}</MathJax>
          <span className="check-icon">✓</span>
        </div>
      </div>

      {/* Deflection Check - only for UDL and NBC modes */}
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

      <div className="summary-section properties-table">
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
              <td><MathJax dynamic inline>{"\\(S_x\\)"}</MathJax></td>
              <td>{section.Sx} ×10³ mm³</td>
              <td><MathJax dynamic inline>{"\\(Z_x\\)"}</MathJax></td>
              <td>{section.Zx} ×10³ mm³</td>
            </tr>
            <tr>
              <td><MathJax dynamic inline>{"\\(J\\)"}</MathJax> (Torsional)</td>
              <td>{section.J} ×10³ mm⁴</td>
              <td><MathJax dynamic inline>{"\\(C_w\\)"}</MathJax> (Warping)</td>
              <td>{section.Cw} ×10⁹ mm⁶</td>
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
    </div>
  );
}
