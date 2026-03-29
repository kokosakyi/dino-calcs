import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { ModuleOutcomeCards } from '../../components/ModuleOutcomeCards';
import { ModulePrintSummary, ModuleUtilizationTable } from '../../components/ModulePrintSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeWoodBuiltUp,
  getSawnLumberProps,
  parseSectionMm,
  LUMBER_SECTION_LABELS,
  LOAD_DURATIONS,
  SERVICE_CONDITIONS,
  SYSTEM_CASES,
  TREATMENT_CONDITIONS,
  WOOD_GRADES,
  WOOD_SPECIES,
  type LoadDuration,
  type ServiceCondition,
  type SystemCase,
  type TreatmentCondition,
  type WoodGrade,
  type WoodSpecies,
} from '../../utils/wood';

export function WoodBuiltUpBeam() {
  const [numberOfPlies, setNumberOfPlies] = useState(2);
  const [factoredLoading, setFactoredLoading] = useState(2);
  const [serviceLoading, setServiceLoading] = useState(1.5);
  const [tributaryWidth, setTributaryWidth] = useState(1200);
  const [beamSpan, setBeamSpan] = useState(3600);
  const [bearingLength, setBearingLength] = useState(89);
  const [unsupportedLength, setUnsupportedLength] = useState(3600);
  const [notchDepth, setNotchDepth] = useState(0);
  const [species, setSpecies] = useState<WoodSpecies>('Spruce-Pine-Fir');
  const [grade, setGrade] = useState<WoodGrade>('No. 1 Grade');
  const [sectionLabel, setSectionLabel] = useState('38 x 235');
  const [loadDuration, setLoadDuration] = useState<LoadDuration>('Standard Term');
  const [serviceCondition, setServiceCondition] = useState<ServiceCondition>('Dry');
  const [treatment, setTreatment] = useState<TreatmentCondition>('Untreated');
  const [systemCase, setSystemCase] = useState<SystemCase>('Case 1');

  const sectionOptions = useMemo(
    () => LUMBER_SECTION_LABELS.map((s) => ({ id: s, label: s })),
    []
  );
  const speciesOpts = useMemo(
    () => WOOD_SPECIES.map((s) => ({ id: s, label: s })),
    []
  );
  const gradeOpts = useMemo(
    () => WOOD_GRADES.map((g) => ({ id: g, label: g })),
    []
  );

  const result = useMemo(
    () =>
      computeWoodBuiltUp({
        numberOfPlies,
        factoredLoading_kPa: factoredLoading,
        serviceLoading_kPa: serviceLoading,
        tributaryWidth_mm: tributaryWidth,
        beamSpan_mm: beamSpan,
        bearingLength_mm: bearingLength,
        unsupportedLength_mm: unsupportedLength,
        notchDepth_mm: notchDepth,
        species,
        grade,
        sectionLabel,
        loadDuration,
        serviceCondition,
        treatmentCondition: treatment,
        systemCase,
      }),
    [
      numberOfPlies,
      factoredLoading,
      serviceLoading,
      tributaryWidth,
      beamSpan,
      bearingLength,
      unsupportedLength,
      notchDepth,
      species,
      grade,
      sectionLabel,
      loadDuration,
      serviceCondition,
      treatment,
      systemCase,
    ]
  );

  const stepDetail = useMemo(() => {
    const mat = getSawnLumberProps(species, grade);
    const { b, d } = parseSectionMm(sectionLabel);
    const n = numberOfPlies;
    const dn = Math.min(notchDepth, 0.25 * d);
    const f = result.factors;
    const Le = 1.92 * unsupportedLength;
    const CB = Math.sqrt((Le * d) / (b * b));
    const CK = Math.sqrt((0.97 * mat.E * f.KSE * f.KT) / (mat.fb * f.KD * f.KH * f.KSb * f.KT));
    const Fb_adj = mat.fb * f.KD * f.KH * f.KSb * f.KT;
    const klCase = CB <= 10 ? 1 : CB <= 20 ? 2 : 3;
    const shearFactor = 1 - (2 * d - dn) / beamSpan;
    const eMm = bearingLength / 2 + 2;
    const eta = eMm / d;
    const alpha = 1 - dn / d;
    const KNfinite = Number.isFinite(f.KN);
    return { mat, b, d, n, dn, Le, CB, CK, Fb_adj, klCase, shearFactor, eMm, eta, alpha, KNfinite };
  }, [species, grade, sectionLabel, numberOfPlies, notchDepth, unsupportedLength, beamSpan, bearingLength, result]);

  const calculationSteps = (
    <>
      <WoodCalcStep label="1. Gross section (n plies, mm)">
        <MathJax dynamic>{`\\[ n = ${stepDetail.n},\\quad b = ${stepDetail.b},\\quad d = ${stepDetail.d},\\quad d_n = \\min(d_{n,\\text{in}}, 0.25d) = ${stepDetail.dn.toFixed(1)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ S = \\frac{n b d^2}{6} = ${result.geometry.S_mm3.toFixed(0)}\\ \\text{mm}^3,\\quad I = \\frac{n b d^3}{12} = ${result.geometry.I_mm4.toFixed(0)}\\ \\text{mm}^4,\\quad A_n = n b (d-d_n) = ${(stepDetail.n * stepDetail.b * (stepDetail.d - stepDetail.dn)).toFixed(0)}\\ \\text{mm}^2 \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="2. Specified strengths (Table 6.3.1A)">
        <MathJax dynamic>{`\\[ f_b = ${stepDetail.mat.fb.toFixed(2)}\\ \\text{MPa},\\; f_v = ${stepDetail.mat.fv.toFixed(2)}\\ \\text{MPa},\\; f_{cp} = ${stepDetail.mat.fcp.toFixed(2)}\\ \\text{MPa},\\; E = ${stepDetail.mat.E.toFixed(0)}\\ \\text{MPa} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="3. Modification factors">
        <MathJax dynamic>{`\\[ K_D=${result.factors.KD.toFixed(3)},\\; K_H=${result.factors.KH.toFixed(3)},\\; K_{Sb}=${result.factors.KSb.toFixed(3)},\\; K_{Sv}=${result.factors.KSv.toFixed(3)},\\; K_{Sf}=${result.factors.KSf.toFixed(3)},\\; K_{Scp}=${result.factors.KScp.toFixed(3)},\\; K_{SE}=${result.factors.KSE.toFixed(3)},\\; K_T=${result.factors.KT.toFixed(3)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ K_{Zb}=${result.factors.KZb.toFixed(3)},\\; K_{Zv}=${result.factors.KZv.toFixed(3)},\\; K_{Zcp}=${result.factors.KZcp.toFixed(3)} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="4. Lateral stability">
        <MathJax dynamic>{`\\[ L_e = ${stepDetail.Le.toFixed(1)}\\ \\text{mm},\\; C_B = ${stepDetail.CB.toFixed(3)},\\; C_K = ${stepDetail.CK.toFixed(3)} \\]`}</MathJax>
        {stepDetail.klCase === 1 && <MathJax dynamic>{`\\[ C_B \\le 10 \\Rightarrow K_L = 1 \\]`}</MathJax>}
        {stepDetail.klCase === 2 && (
          <MathJax dynamic>{`\\[ 10 < C_B \\le 20 \\Rightarrow K_L = 1 - \\tfrac{1}{3}(C_B/C_K)^4 = ${result.factors.KL.toFixed(4)} \\]`}</MathJax>
        )}
        {stepDetail.klCase === 3 && (
          <MathJax dynamic>{`\\[ C_B > 20 \\Rightarrow K_L = \\dfrac{0.97 E K_{SE} K_T}{C_B^2 F_b} = ${result.factors.KL.toFixed(4)},\\; F_b = ${stepDetail.Fb_adj.toFixed(3)}\\ \\text{MPa} \\]`}</MathJax>
        )}
      </WoodCalcStep>
      <WoodCalcStep label="5. Notch & shear-fracture factor">
        <MathJax dynamic>{`\\[ \\alpha = 1 - \\frac{d_n}{d} = ${stepDetail.alpha.toFixed(4)},\\quad e = \\frac{\\ell_b}{2}+2 = ${stepDetail.eMm.toFixed(1)}\\ \\text{mm},\\quad \\eta = \\frac{e}{d} = ${stepDetail.eta.toFixed(4)} \\]`}</MathJax>
        {stepDetail.KNfinite ? (
          <MathJax dynamic>{`\\[ K_N = \\Big( 0.006 d \\big[ 1.6(\\alpha^{-1}-1) + \\eta^2(\\alpha^{-3}-1) \\big] \\Big)^{-1/2} = ${result.factors.KN.toFixed(4)} \\]`}</MathJax>
        ) : (
          <p className="wood-calc-note">No notch (or α → 1): K<sub>N</sub> is taken as non-governing; fracture resistance is not limiting.</p>
        )}
      </WoodCalcStep>
      <WoodCalcStep label="6. Demands">
        <MathJax dynamic>{`\\[ M_f = \\frac{p_f s L^2}{8}\\times 10^{-9} = ${result.Mf_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_f = \\tfrac{1}{2} p_f s L \\Big(1-\\frac{2d-d_n}{L}\\Big) 10^{-6} = ${result.Vf_kN.toFixed(3)}\\ \\text{kN},\\; \\text{factor}=${stepDetail.shearFactor.toFixed(4)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ Q_f = \\tfrac{1}{2} p_f s L \\times 10^{-6} = ${result.Qf_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="7. Resistances (φ, f<sub>f</sub> = 0.5 MPa basis for F<sub>r</sub>)">
        <MathJax dynamic>{`\\[ M_r = \\frac{\\phi_b f_b K_D K_H K_{Sb} K_T S K_{Zb} K_L}{10^6} = ${result.Mr_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_r = \\frac{\\phi_v f_v K_D K_H K_{Sv} K_T (\\frac{2}{3}A_n) K_{Zv}}{10^3} = ${result.Vr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ Q_r = \\phi_{cp} f_{cp} K_D K_{Scp} K_T (n b \\ell_b) K_B K_{Zcp} \\times 10^{-3} = ${result.Qr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ F_r = \\phi_f (f_f K_D K_H K_{Sf} K_T) (n b d) K_N \\times 10^{-3} = ${result.Fr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="8. Deflection & utilization">
        <MathJax dynamic>{`\\[ \\delta = \\frac{5 p_s s L^4}{384 E K_{SE} K_T I}\\times 10^{-3} = ${result.delta_mm.toFixed(3)}\\ \\text{mm},\\quad \\delta_{\\lim} = ${result.deltaLimit_mm.toFixed(3)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\tfrac{M_f}{M_r}=${result.utilization.bending.toFixed(3)},\\; \\tfrac{V_f}{V_r}=${result.utilization.shear.toFixed(3)},\\; \\tfrac{Q_f}{Q_r}=${result.utilization.bearing.toFixed(3)},\\; \\tfrac{Q_f}{F_r}=${result.utilization.shearFracture.toFixed(3)} \\]`}</MathJax>
      </WoodCalcStep>
    </>
  );

  const utilizationRows = [
    { label: 'Bending', ratio: result.utilization.bending },
    { label: 'Shear', ratio: result.utilization.shear },
    { label: 'Deflection', ratio: result.utilization.deflection },
    { label: 'Bearing', ratio: result.utilization.bearing },
    { label: 'Shear fracture (Qf / Fr)', ratio: result.utilization.shearFracture },
  ];

  const calculatedDesignSummary = (
    <>
      <h3>Calculated Design Values</h3>
      <div className="calculated-values-grid">
        <div className="calculated-value">
          <span className="label">Factored moment (Mf):</span>
          <span className="value">{result.Mf_kNm.toFixed(3)} kN·m</span>
        </div>
        <div className="calculated-value">
          <span className="label">Moment resistance (Mr):</span>
          <span className="value">{result.Mr_kNm.toFixed(3)} kN·m</span>
        </div>
        <div className="calculated-value">
          <span className="label">Effective width (n × b):</span>
          <span className="value">{(result.geometry.n * result.geometry.b_mm).toFixed(0)} mm</span>
        </div>
        <div className="calculated-value">
          <span className="label">Factored shear (Vf):</span>
          <span className="value">{result.Vf_kN.toFixed(2)} kN</span>
        </div>
        <div className="calculated-value">
          <span className="label">Shear resistance (Vr):</span>
          <span className="value">{result.Vr_kN.toFixed(2)} kN</span>
        </div>
        <div className="calculated-value">
          <span className="label">Service deflection (δ):</span>
          <span className="value">{result.delta_mm.toFixed(2)} mm</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="beam-design-page wood-design-page">
      <header className="page-header">
        <h1>Built-Up Beam</h1>
        <p>Stacked dimension lumber plies per CSA O86</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Geometry & loads</h3>
            <InputField
              label="Number of plies"
              value={numberOfPlies}
              onChange={setNumberOfPlies}
              unit=""
              min={1}
              step={1}
            />
            <InputField
              label="Factored loading"
              value={factoredLoading}
              onChange={setFactoredLoading}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Service loading"
              value={serviceLoading}
              onChange={setServiceLoading}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Tributary width"
              value={tributaryWidth}
              onChange={setTributaryWidth}
              unit="mm"
              min={1}
              step={50}
            />
            <InputField
              label="Beam span"
              value={beamSpan}
              onChange={setBeamSpan}
              unit="mm"
              min={1}
              step={100}
            />
            <InputField
              label="Bearing length"
              value={bearingLength}
              onChange={setBearingLength}
              unit="mm"
              min={1}
              step={10}
            />
            <InputField
              label="Unsupported length"
              value={unsupportedLength}
              onChange={setUnsupportedLength}
              unit="mm"
              min={0}
              step={100}
            />
            <InputField
              label="Notch depth"
              value={notchDepth}
              onChange={setNotchDepth}
              unit="mm"
              min={0}
              step={1}
            />
          </div>

          <div className="input-group">
            <h3>Section & material</h3>
            <CustomDropdown label="Species" options={speciesOpts} value={species} onChange={(v) => setSpecies(v as WoodSpecies)} />
            <CustomDropdown label="Grade" options={gradeOpts} value={grade} onChange={(v) => setGrade(v as WoodGrade)} />
            <CustomDropdown label="Section (per ply)" options={sectionOptions} value={sectionLabel} onChange={setSectionLabel} />
            <CustomDropdown
              label="Load duration"
              options={LOAD_DURATIONS.map((x) => ({ id: x, label: x }))}
              value={loadDuration}
              onChange={(v) => setLoadDuration(v as LoadDuration)}
            />
            <CustomDropdown
              label="Service condition"
              options={SERVICE_CONDITIONS.map((x) => ({ id: x, label: x }))}
              value={serviceCondition}
              onChange={(v) => setServiceCondition(v as ServiceCondition)}
            />
            <CustomDropdown
              label="Treatment"
              options={TREATMENT_CONDITIONS.map((x) => ({ id: x, label: x }))}
              value={treatment}
              onChange={(v) => setTreatment(v as TreatmentCondition)}
            />
            <CustomDropdown
              label="System case (KH)"
              options={SYSTEM_CASES.map((x) => ({ id: x, label: x }))}
              value={systemCase}
              onChange={(v) => setSystemCase(v as SystemCase)}
            />
          </div>
        </div>

        <div className="calculated-loads-summary full-width">{calculatedDesignSummary}</div>

        <div className="design-criteria full-width">
          <h3>Design Criteria</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <MathJax inline>{"\\(M_f \\le M_r\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(V_f \\le V_r\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(\\delta \\le \\delta_{\\lim}\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(Q_f \\le Q_r\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(Q_f \\le F_r\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">Built-up plies, notch, and shear fracture per CSA O86</p>
        </div>
      </section>

      <section className="calculations-panel">
        <ModulePrintSummary
          printTitle="Built-Up Beam Design Calculation"
          standardLine="CSA O86 — Engineering Design in Wood"
          footerLeft="DinoCalcs — Wood design"
          footerRight="Calculations per CSA O86"
        >
          <h2>Design Summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Design inputs</h3>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Geometry &amp; loads</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Number of plies (n)</td>
                      <td>{numberOfPlies}</td>
                    </tr>
                    <tr>
                      <td>Factored loading</td>
                      <td>{factoredLoading} kPa</td>
                    </tr>
                    <tr>
                      <td>Service loading</td>
                      <td>{serviceLoading} kPa</td>
                    </tr>
                    <tr>
                      <td>Tributary width</td>
                      <td>{tributaryWidth} mm</td>
                    </tr>
                    <tr>
                      <td>Beam span</td>
                      <td>{beamSpan} mm</td>
                    </tr>
                    <tr>
                      <td>Bearing length</td>
                      <td>{bearingLength} mm</td>
                    </tr>
                    <tr>
                      <td>Unsupported length</td>
                      <td>{unsupportedLength} mm</td>
                    </tr>
                    <tr>
                      <td>Notch depth</td>
                      <td>{notchDepth} mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Section &amp; factors</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Species</td>
                      <td>{species}</td>
                    </tr>
                    <tr>
                      <td>Grade</td>
                      <td>{grade}</td>
                    </tr>
                    <tr>
                      <td>Section (per ply)</td>
                      <td>{sectionLabel}</td>
                    </tr>
                    <tr>
                      <td>Load duration</td>
                      <td>{loadDuration}</td>
                    </tr>
                    <tr>
                      <td>Service condition</td>
                      <td>{serviceCondition}</td>
                    </tr>
                    <tr>
                      <td>Treatment</td>
                      <td>{treatment}</td>
                    </tr>
                    <tr>
                      <td>System case</td>
                      <td>{systemCase}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="calculated-loads-summary full-width pdf-only-calculated-summary">{calculatedDesignSummary}</div>

          <div className="pdf-utilization-table">
            <ModuleUtilizationTable rows={utilizationRows} />
          </div>

          <WoodCalculationSection title="Calculation steps">{calculationSteps}</WoodCalculationSection>
        </ModulePrintSummary>
      </section>

      <ModuleOutcomeCards rows={utilizationRows} />
    </div>
  );
}
