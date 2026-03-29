import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { WoodUtilizationSummary } from '../../components/WoodUtilizationSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeWoodJoist,
  getSawnLumberProps,
  parseSectionMm,
  WOOD_PHI,
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

export function WoodJoistDesign() {
  const [factoredLoading, setFactoredLoading] = useState(2);
  const [serviceLoading, setServiceLoading] = useState(1.5);
  const [joistSpacing, setJoistSpacing] = useState(400);
  const [joistSpan, setJoistSpan] = useState(3600);
  const [bearingLength, setBearingLength] = useState(89);
  const [unsupportedLength, setUnsupportedLength] = useState(3600);
  const [species, setSpecies] = useState<WoodSpecies>('Spruce-Pine-Fir');
  const [grade, setGrade] = useState<WoodGrade>('No. 1 Grade');
  const [sectionLabel, setSectionLabel] = useState('38 x 89');
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
      computeWoodJoist({
        factoredLoading_kPa: factoredLoading,
        serviceLoading_kPa: serviceLoading,
        joistSpacing_mm: joistSpacing,
        joistSpan_mm: joistSpan,
        bearingLength_mm: bearingLength,
        unsupportedLength_mm: unsupportedLength,
        species,
        grade,
        sectionLabel,
        loadDuration,
        serviceCondition,
        treatmentCondition: treatment,
        systemCase,
      }),
    [
      factoredLoading,
      serviceLoading,
      joistSpacing,
      joistSpan,
      bearingLength,
      unsupportedLength,
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
    const f = result.factors;
    const Le = 1.92 * unsupportedLength;
    const CB = Math.sqrt((Le * d) / (b * b));
    const CK = Math.sqrt((0.97 * mat.E * f.KSE * f.KT) / (mat.fb * f.KD * f.KH * f.KSb * f.KT));
    const Fb_adj = mat.fb * f.KD * f.KH * f.KSb * f.KT;
    const klCase = CB <= 10 ? 1 : CB <= 20 ? 2 : 3;
    const shearFactor = 1 - (2 * d) / joistSpan;
    return { mat, b, d, Le, CB, CK, Fb_adj, klCase, shearFactor };
  }, [species, grade, sectionLabel, unsupportedLength, result, joistSpan]);

  return (
    <div className="wood-design-page">
      <header className="page-header">
        <h1>Joist design</h1>
        <p>Dimension lumber joists — CSA O86 (Table 6.3.1A, modification factors)</p>
      </header>

      <section className="input-panel">
        <h2>Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Loads</h3>
            <InputField
              label="Factored loading (roof/floor pressure)"
              value={factoredLoading}
              onChange={setFactoredLoading}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Service loading (for deflection)"
              value={serviceLoading}
              onChange={setServiceLoading}
              unit="kPa"
              min={0}
              step={0.1}
            />
            <InputField
              label="Joist spacing (tributary width)"
              value={joistSpacing}
              onChange={setJoistSpacing}
              unit="mm"
              min={1}
              step={50}
            />
            <InputField
              label="Joist span"
              value={joistSpan}
              onChange={setJoistSpan}
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
              label="Unsupported length (buckling)"
              value={unsupportedLength}
              onChange={setUnsupportedLength}
              unit="mm"
              min={0}
              step={100}
            />
          </div>

          <div className="input-group">
            <h3>Section & material</h3>
            <CustomDropdown
              label="Species"
              options={speciesOpts}
              value={species}
              onChange={(v) => setSpecies(v as WoodSpecies)}
            />
            <CustomDropdown label="Grade" options={gradeOpts} value={grade} onChange={(v) => setGrade(v as WoodGrade)} />
            <CustomDropdown
              label="Section (b × d)"
              options={sectionOptions}
              value={sectionLabel}
              onChange={setSectionLabel}
            />
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
      </section>

      <section className="capacity-results-panel" style={{ marginTop: '1.5rem' }}>
        <h2>Key results</h2>
        <div className="section-quick-info">
          <div className="quick-info-item">
            <span className="label">Mf</span>
            <span className="value">{result.Mf_kNm.toFixed(3)} kN·m</span>
          </div>
          <div className="quick-info-item">
            <span className="label">Mr</span>
            <span className="value">{result.Mr_kNm.toFixed(3)} kN·m</span>
          </div>
          <div className="quick-info-item">
            <span className="label">Vf</span>
            <span className="value">{result.Vf_kN.toFixed(2)} kN</span>
          </div>
          <div className="quick-info-item">
            <span className="label">Vr</span>
            <span className="value">{result.Vr_kN.toFixed(2)} kN</span>
          </div>
          <div className="quick-info-item">
            <span className="label">δ</span>
            <span className="value">{result.delta_mm.toFixed(2)} mm</span>
          </div>
          <div className="quick-info-item">
            <span className="label">δ limit</span>
            <span className="value">{result.deltaLimit_mm.toFixed(2)} mm</span>
          </div>
        </div>
      </section>

      <WoodUtilizationSummary
        rows={[
          { label: 'Bending (Mf / Mr)', ratio: result.utilization.bending },
          { label: 'Shear (Vf / Vr)', ratio: result.utilization.shear },
          { label: 'Deflection (δ / limit)', ratio: result.utilization.deflection },
          { label: 'Bearing (Qf / Qr)', ratio: result.utilization.bearing },
        ]}
      />

      <WoodCalculationSection>
        <WoodCalcStep label="1. Section properties (mm)">
          <MathJax dynamic>{`\\[ b = ${stepDetail.b},\\quad d = ${stepDetail.d},\\quad S = \\frac{b d^2}{6} = ${result.geometry.S_mm3.toFixed(0)}\\ \\text{mm}^3,\\quad I = \\frac{b d^3}{12} = ${result.geometry.I_mm4.toFixed(0)}\\ \\text{mm}^4 \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="2. Specified strengths (Table 6.3.1A)">
          <MathJax dynamic>{`\\[ f_b = ${stepDetail.mat.fb.toFixed(2)}\\ \\text{MPa},\\quad f_v = ${stepDetail.mat.fv.toFixed(2)}\\ \\text{MPa},\\quad f_{cp} = ${stepDetail.mat.fcp.toFixed(2)}\\ \\text{MPa},\\quad E = ${stepDetail.mat.E.toFixed(0)}\\ \\text{MPa} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="3. Modification factors (as selected)">
          <MathJax dynamic>{`\\[ K_D=${result.factors.KD.toFixed(3)},\\; K_H=${result.factors.KH.toFixed(3)},\\; K_{Sb}=${result.factors.KSb.toFixed(3)},\\; K_{Sv}=${result.factors.KSv.toFixed(3)},\\; K_{Scp}=${result.factors.KScp.toFixed(3)},\\; K_{SE}=${result.factors.KSE.toFixed(3)},\\; K_T=${result.factors.KT.toFixed(3)} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ K_{Zb}=${result.factors.KZb.toFixed(3)},\\; K_{Zv}=${result.factors.KZv.toFixed(3)},\\; K_{Zcp}=${result.factors.KZcp.toFixed(3)} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="4. Lateral stability">
          <MathJax dynamic>{`\\[ L_e = 1.92\\, l_u = 1.92(${unsupportedLength}) = ${stepDetail.Le.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ C_B = \\sqrt{\\frac{L_e d}{b^2}} = ${stepDetail.CB.toFixed(3)},\\quad C_K = \\sqrt{\\frac{0.97 E K_{SE} K_T}{f_b K_D K_H K_{Sb} K_T}} = ${stepDetail.CK.toFixed(3)} \\]`}</MathJax>
          {stepDetail.klCase === 1 && (
            <MathJax dynamic>{`\\[ C_B \\le 10 \\Rightarrow K_L = 1 \\]`}</MathJax>
          )}
          {stepDetail.klCase === 2 && (
            <MathJax dynamic>{`\\[ 10 < C_B \\le 20 \\Rightarrow K_L = 1 - \\tfrac{1}{3}\\left(\\frac{C_B}{C_K}\\right)^4 = ${result.factors.KL.toFixed(4)} \\]`}</MathJax>
          )}
          {stepDetail.klCase === 3 && (
            <MathJax dynamic>{`\\[ C_B > 20 \\Rightarrow K_L = \\frac{0.97 E K_{SE} K_T}{C_B^2\\, F_b} = ${result.factors.KL.toFixed(4)},\\quad F_b = f_b K_D K_H K_{Sb} K_T = ${stepDetail.Fb_adj.toFixed(3)}\\ \\text{MPa} \\]`}</MathJax>
          )}
        </WoodCalcStep>
        <WoodCalcStep label="5. Factored demand — bending & shear">
          <MathJax dynamic>{`\\[ M_f = \\frac{p_f s L^2}{8}\\times 10^{-9} = \\frac{(${factoredLoading})(${joistSpacing})(${joistSpan})^2}{8}\\times 10^{-9} = ${result.Mf_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ V_f = \\tfrac{1}{2} p_f s L \\left(1-\\frac{2d}{L}\\right) \\times 10^{-6} = ${result.Vf_kN.toFixed(3)}\\ \\text{kN},\\quad \\left(1-\\frac{2d}{L}\\right)=${stepDetail.shearFactor.toFixed(4)} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ Q_f = \\tfrac{1}{2} p_f s L \\times 10^{-6} = ${result.Qf_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="6. Resistances (φ from CSA O86)">
          <MathJax dynamic>{`\\[ F_b' = f_b K_D K_H K_{Sb} K_T = ${stepDetail.Fb_adj.toFixed(3)}\\ \\text{MPa} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ M_r = \\frac{\\phi_b F_b' S K_{Zb} K_L}{10^6} = \\frac{${WOOD_PHI.b}\\cdot (${stepDetail.Fb_adj.toFixed(3)})\\cdot (${result.geometry.S_mm3.toFixed(0)})\\cdot ${result.factors.KZb.toFixed(3)}\\cdot ${result.factors.KL.toFixed(4)}}{10^6} = ${result.Mr_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ V_r = \\frac{\\phi_v f_v K_D K_H K_{Sv} K_T \\,(\\frac{2}{3} b d)\\, K_{Zv}}{10^3} = ${result.Vr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ Q_r = \\phi_{cp} f_{cp} K_D K_{Scp} K_T\\, b \\ell_b K_B K_{Zcp} \\times 10^{-3} = ${result.Qr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="7. Deflection (service)">
          <MathJax dynamic>{`\\[ \\delta = \\frac{5 p_s s L^4}{384 E K_{SE} K_T I}\\times 10^{-3} = ${result.delta_mm.toFixed(3)}\\ \\text{mm},\\quad \\delta_{\\lim}=\\frac{L-\\ell_b}{360} = ${result.deltaLimit_mm.toFixed(3)}\\ \\text{mm} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="8. Utilization">
          <MathJax dynamic>{`\\[ \\frac{M_f}{M_r}=${result.utilization.bending.toFixed(3)},\\; \\frac{V_f}{V_r}=${result.utilization.shear.toFixed(3)},\\; \\frac{\\delta}{\\delta_{\\lim}}=${result.utilization.deflection.toFixed(3)},\\; \\frac{Q_f}{Q_r}=${result.utilization.bearing.toFixed(3)} \\]`}</MathJax>
          <p className="wood-calc-note">Loads use p<sub>f</sub>, s, L in mm and kPa; the 10<sup>−9</sup> and 10<sup>−6</sup> factors convert to kN·m and kN as implemented.</p>
        </WoodCalcStep>
      </WoodCalculationSection>
    </div>
  );
}
