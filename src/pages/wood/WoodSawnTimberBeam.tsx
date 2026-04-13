import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { ModuleOutcomeCards } from '../../components/ModuleOutcomeCards';
import { ModulePrintSummary, ModuleUtilizationTable } from '../../components/ModulePrintSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeWoodSawnTimberBeam,
  getSawnTimberProps,
  getTimberSectionLabels,
  parseSectionMm,
  LOAD_DURATIONS,
  SERVICE_CONDITIONS,
  TREATMENT_CONDITIONS,
  WOOD_GRADES,
  WOOD_SPECIES,
  type LoadDuration,
  type ServiceCondition,
  type TreatmentCondition,
  type WoodGrade,
  type WoodSpecies,
} from '../../utils/wood';

const TIMBER_GRADES = WOOD_GRADES.filter((g) => g !== 'No. 3 Grade');

export function WoodSawnTimberBeam() {
  const [factoredLoading, setFactoredLoading] = useState(2);
  const [serviceLoading, setServiceLoading] = useState(1.5);
  const [tributaryWidth, setTributaryWidth] = useState(1200);
  const [beamSpan, setBeamSpan] = useState(4800);
  const [bearingLength, setBearingLength] = useState(140);
  const [unsupportedLength, setUnsupportedLength] = useState(4800);
  const [notchDepth, setNotchDepth] = useState(0);
  const [species, setSpecies] = useState<WoodSpecies>('Douglas Fir-Larch');
  const [grade, setGrade] = useState<WoodGrade>('No. 1 Grade');
  const [sectionLabel, setSectionLabel] = useState('140 x 140');
  const [loadDuration, setLoadDuration] = useState<LoadDuration>('Standard Term');
  const [serviceCondition, setServiceCondition] = useState<ServiceCondition>('Dry');
  const [treatment, setTreatment] = useState<TreatmentCondition>('Untreated');

  const sectionOptions = useMemo(() => {
    return getTimberSectionLabels(species).map((s) => ({ id: s, label: s }));
  }, [species]);

  const speciesOpts = useMemo(
    () => WOOD_SPECIES.map((s) => ({ id: s, label: s })),
    []
  );
  const gradeOpts = useMemo(
    () => TIMBER_GRADES.map((g) => ({ id: g, label: g })),
    []
  );

  const result = useMemo(
    () =>
      computeWoodSawnTimberBeam({
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
      }),
    [
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
    ]
  );

  const stepDetail = useMemo(() => {
    const mat = getSawnTimberProps(species, grade);
    const { b, d } = parseSectionMm(sectionLabel);
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
    return { mat, b, d, dn, Le, CB, CK, Fb_adj, klCase, shearFactor, eMm, eta, alpha, KNfinite };
  }, [species, grade, sectionLabel, notchDepth, unsupportedLength, beamSpan, bearingLength, result]);

  const calculationSteps = (
    <>
      <WoodCalcStep label="1. Section (mm)">
        <MathJax dynamic>{`\\[ b = ${stepDetail.b},\\; d = ${stepDetail.d},\\; d_n = ${stepDetail.dn.toFixed(1)},\\; S = ${result.geometry.S_mm3.toFixed(0)}\\ \\text{mm}^3,\\; I = ${result.geometry.I_mm4.toFixed(0)}\\ \\text{mm}^4 \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="2. Specified strengths (Table 6.3.1C)">
        <MathJax dynamic>{`\\[ f_b = ${stepDetail.mat.fb.toFixed(2)}\\ \\text{MPa},\\; f_v = ${stepDetail.mat.fv.toFixed(2)}\\ \\text{MPa},\\; f_{cp} = ${stepDetail.mat.fcp.toFixed(2)}\\ \\text{MPa},\\; E = ${stepDetail.mat.E.toFixed(0)}\\ \\text{MPa} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="3. Modification factors (K_H = 1.0 in this tool)">
        <MathJax dynamic>{`\\[ K_H = 1.0,\\; K_D=${result.factors.KD.toFixed(3)},\\; K_{Sb}=${result.factors.KSb.toFixed(3)},\\; K_{Sv}=${result.factors.KSv.toFixed(3)},\\; K_{Sf}=${result.factors.KSf.toFixed(3)},\\; K_{Scp}=${result.factors.KScp.toFixed(3)},\\; K_{SE}=${result.factors.KSE.toFixed(3)},\\; K_T=${result.factors.KT.toFixed(3)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ K_{Zb}=${result.factors.KZb.toFixed(3)},\\; K_{Zv}=${result.factors.KZv.toFixed(3)},\\; K_{Zcp}=${result.factors.KZcp.toFixed(3)} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="4. Effective length & lateral stability">
        <MathJax>{`\\[ L_e = 1.92\\, l_u \\]`}</MathJax>
        <MathJax dynamic>{`\\[ L_e = ${stepDetail.Le.toFixed(1)}\\ \\text{mm},\\; C_B = ${stepDetail.CB.toFixed(3)},\\; C_K = ${stepDetail.CK.toFixed(3)} \\]`}</MathJax>
        {stepDetail.klCase === 1 && <MathJax dynamic>{`\\[ C_B \\le 10 \\Rightarrow K_L = 1 \\]`}</MathJax>}
        {stepDetail.klCase === 2 && (
          <MathJax dynamic>{`\\[ 10 < C_B \\le 20 \\Rightarrow K_L = 1 - \\tfrac{1}{3}(C_B/C_K)^4 = ${result.factors.KL.toFixed(4)} \\]`}</MathJax>
        )}
        {stepDetail.klCase === 3 && (
          <MathJax dynamic>{`\\[ C_B > 20 \\Rightarrow K_L = ${result.factors.KL.toFixed(4)},\\; F_b = f_b K_D K_H K_{Sb} K_T = ${stepDetail.Fb_adj.toFixed(3)}\\ \\text{MPa} \\]`}</MathJax>
        )}
      </WoodCalcStep>
      <WoodCalcStep label="5. Notch & K_N">
        <MathJax dynamic>{`\\[ \\alpha = ${stepDetail.alpha.toFixed(4)},\\; e = ${stepDetail.eMm.toFixed(1)}\\ \\text{mm},\\; \\eta = ${stepDetail.eta.toFixed(4)} \\]`}</MathJax>
        {stepDetail.KNfinite ? (
          <MathJax dynamic>{`\\[ K_N = ${result.factors.KN.toFixed(4)} \\]`}</MathJax>
        ) : (
          <p className="wood-calc-note">No notch: K<sub>N</sub> not governing for shear fracture.</p>
        )}
      </WoodCalcStep>
      <WoodCalcStep label="6. Demands">
        <MathJax dynamic>{`\\[ M_f = \\frac{p_f s L^2}{8}\\times 10^{-9} = ${result.Mf_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_f = \\tfrac{1}{2} p_f s L \\Big(1-\\frac{2d-d_n}{L}\\Big) 10^{-6} = ${result.Vf_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ Q_f = ${result.Qf_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="7. Resistances">
        <MathJax dynamic>{`\\[ M_r = \\frac{\\phi_b f_b K_D K_H K_{Sb} K_T S K_{Zb} K_L}{10^6} = ${result.Mr_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_r = ${result.Vr_kN.toFixed(3)}\\ \\text{kN},\\quad Q_r = ${result.Qr_kN.toFixed(3)}\\ \\text{kN},\\quad F_r = ${result.Fr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
      </WoodCalcStep>
      <WoodCalcStep label="8. Deflection & ratios">
        <MathJax dynamic>{`\\[ \\delta = ${result.delta_mm.toFixed(3)}\\ \\text{mm},\\; \\delta_{\\lim} = ${result.deltaLimit_mm.toFixed(3)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\tfrac{M_f}{M_r}=${result.utilization.bending.toFixed(3)},\\; \\tfrac{V_f}{V_r}=${result.utilization.shear.toFixed(3)},\\; \\tfrac{Q_f}{F_r}=${result.utilization.shearFracture.toFixed(3)} \\]`}</MathJax>
      </WoodCalcStep>
    </>
  );

  const utilizationRows = [
    { label: 'Bending', ratio: result.utilization.bending },
    { label: 'Shear', ratio: result.utilization.shear },
    { label: 'Deflection', ratio: result.utilization.deflection },
    { label: 'Bearing', ratio: result.utilization.bearing },
    { label: 'Shear fracture', ratio: result.utilization.shearFracture },
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
          <span className="label">Stability factor (K<sub>L</sub>):</span>
          <span className="value">{result.factors.KL.toFixed(3)}</span>
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
        <h1>Sawn Timber Beam</h1>
        <p>Heavy timbers (Table 6.3.1C) per CSA O86 — K<sub>H</sub> = 1.0 in this tool</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Loads & span</h3>
            <InputField
              label="Factored loading"
              value={factoredLoading}
              onChange={(v) => v != null && setFactoredLoading(v)}
              allowEmpty={false}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Service loading"
              value={serviceLoading}
              onChange={(v) => v != null && setServiceLoading(v)}
              allowEmpty={false}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Tributary width"
              value={tributaryWidth}
              onChange={(v) => v != null && setTributaryWidth(v)}
              allowEmpty={false}
              unit="mm"
              min={1}
              step={50}
            />
            <InputField label="Beam span" value={beamSpan} onChange={(v) => v != null && setBeamSpan(v)} allowEmpty={false} unit="mm" min={1} step={100} />
            <InputField
              label="Bearing length"
              value={bearingLength}
              onChange={(v) => v != null && setBearingLength(v)}
              allowEmpty={false}
              unit="mm"
              min={1}
              step={10}
            />
            <InputField
              label="Unsupported length"
              value={unsupportedLength}
              onChange={(v) => v != null && setUnsupportedLength(v)}
              allowEmpty={false}
              unit="mm"
              min={0}
              step={100}
            />
            <InputField label="Notch depth" value={notchDepth} onChange={(v) => v != null && setNotchDepth(v)} allowEmpty={false} unit="mm" min={0} step={1} />
          </div>

          <div className="input-group">
            <h3>Section & material</h3>
            <CustomDropdown
              label="Species"
              options={speciesOpts}
              value={species}
              onChange={(v) => {
                const sp = v as WoodSpecies;
                setSpecies(sp);
                const labels = getTimberSectionLabels(sp);
                if (!labels.includes(sectionLabel)) setSectionLabel(labels[0] ?? '140 x 140');
              }}
            />
            <CustomDropdown label="Grade" options={gradeOpts} value={grade} onChange={(v) => setGrade(v as WoodGrade)} />
            <CustomDropdown label="Section (b × d)" options={sectionOptions} value={sectionLabel} onChange={setSectionLabel} />
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
          <p className="criteria-note">Sawn timber (Table 6.3.1C); K<sub>H</sub> = 1.0 in this tool</p>
        </div>
      </section>

      <section className="calculations-panel">
        <ModulePrintSummary
          printTitle="Sawn Timber Beam Design Calculation"
          standardLine="CSA O86 — Engineering Design in Wood"
          footerLeft="DinoCalcs — Wood design"
          footerRight="Calculations per CSA O86"
        >
          <h2>Design Summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Design inputs</h3>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Loads &amp; geometry</h4>
                <table className="inputs-table">
                  <tbody>
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
                      <td>Section (b × d)</td>
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
