import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { WoodUtilizationSummary } from '../../components/WoodUtilizationSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeWoodBiaxial,
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

export function WoodBiaxialBending() {
  const [factoredLoading, setFactoredLoading] = useState(2);
  const [serviceLoading, setServiceLoading] = useState(1.5);
  const [tributaryWidth, setTributaryWidth] = useState(1200);
  const [beamSpan, setBeamSpan] = useState(4800);
  const [bearingLength, setBearingLength] = useState(140);
  const [unsupportedLength, setUnsupportedLength] = useState(4800);
  const [notchDepth, setNotchDepth] = useState(0);
  const [roofPitchDeg, setRoofPitchDeg] = useState(30);
  const [species, setSpecies] = useState<WoodSpecies>('Douglas Fir-Larch');
  const [grade, setGrade] = useState<WoodGrade>('No. 1 Grade');
  const [sectionLabel, setSectionLabel] = useState('140 x 191');
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
      computeWoodBiaxial({
        factoredLoading_kPa: factoredLoading,
        serviceLoading_kPa: serviceLoading,
        tributaryWidth_mm: tributaryWidth,
        beamSpan_mm: beamSpan,
        bearingLength_mm: bearingLength,
        unsupportedLength_mm: unsupportedLength,
        notchDepth_mm: notchDepth,
        roofPitch_deg: roofPitchDeg,
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
      roofPitchDeg,
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
    const thetaRad = (roofPitchDeg * Math.PI) / 180;
    const sinT = Math.sin(thetaRad);
    const cosT = Math.cos(thetaRad);
    const eMm = bearingLength / 2 + 2;
    const eta = eMm / d;
    const alpha = 1 - dn / d;
    const KNfinite = Number.isFinite(f.KN);
    return { mat, b, d, dn, Le, CB, CK, Fb_adj, klCase, thetaRad, sinT, cosT, eMm, eta, alpha, KNfinite };
  }, [species, grade, sectionLabel, notchDepth, unsupportedLength, bearingLength, result, roofPitchDeg]);

  return (
    <div className="wood-design-page">
      <header className="page-header">
        <h1>Biaxial bending (sloped roof)</h1>
        <p>Timber beam with load resolved using roof pitch θ in degrees (θ<sub>rad</sub> = θ° × π/180)</p>
      </header>

      <section className="input-panel">
        <h2>Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Loads & span</h3>
            <InputField
              label="Factored loading (normal to roof surface)"
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
            <InputField label="Beam span" value={beamSpan} onChange={setBeamSpan} unit="mm" min={1} step={100} />
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
            <InputField label="Notch depth" value={notchDepth} onChange={setNotchDepth} unit="mm" min={0} step={1} />
            <InputField
              label="Roof pitch"
              value={roofPitchDeg}
              onChange={setRoofPitchDeg}
              unit="degrees"
              min={0}
              max={90}
              step={0.5}
            />
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
      </section>

      <section className="capacity-results-panel" style={{ marginTop: '1.5rem' }}>
        <h2>Key results</h2>
        <div className="section-quick-info">
          <div className="quick-info-item">
            <span className="label">Mfx (strong axis component)</span>
            <span className="value">{result.Mfx_kNm.toFixed(3)} kN·m</span>
          </div>
          <div className="quick-info-item">
            <span className="label">Mfy (weak axis component)</span>
            <span className="value">{result.Mfy_kNm.toFixed(3)} kN·m</span>
          </div>
          <div className="quick-info-item">
            <span className="label">Mr (same for both checks)</span>
            <span className="value">{result.Mr_kNm.toFixed(3)} kN·m</span>
          </div>
        </div>
      </section>

      <WoodUtilizationSummary
        rows={[
          { label: 'Bending (Mfx / Mr)', ratio: result.utilization.bendingStrong },
          { label: 'Bending (Mfy / Mr)', ratio: result.utilization.bendingWeak },
          { label: 'Shear', ratio: result.utilization.shear },
          { label: 'Deflection', ratio: result.utilization.deflection },
          { label: 'Bearing', ratio: result.utilization.bearing },
          { label: 'Shear fracture', ratio: result.utilization.shearFracture },
        ]}
      />

      <WoodCalculationSection>
        <WoodCalcStep label="1. Roof angle & resolved loads">
          <MathJax dynamic>{`\\[ \\theta = ${roofPitchDeg.toFixed(2)}^\\circ \\times \\frac{\\pi}{180} = ${stepDetail.thetaRad.toFixed(4)}\\ \\text{rad},\\quad \\sin\\theta = ${stepDetail.sinT.toFixed(4)},\\quad \\cos\\theta = ${stepDetail.cosT.toFixed(4)} \\]`}</MathJax>
          <MathJax>{`\\[ M_{fx} = \\dfrac{p_f \\sin\\theta\\, s L^2}{8}\\times 10^{-9},\\quad M_{fy} = \\dfrac{p_f \\cos\\theta\\, s L^2}{8}\\times 10^{-9} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ M_{fx} = ${result.Mfx_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m},\\quad M_{fy} = ${result.Mfy_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
          <p className="wood-calc-note">p<sub>f</sub> is pressure normal to the roof plane; components follow the legacy calculator.</p>
        </WoodCalcStep>
        <WoodCalcStep label="2. Section & material (Table 6.3.1C)">
          <MathJax dynamic>{`\\[ b = ${stepDetail.b},\\; d = ${stepDetail.d},\\; S = ${result.geometry.S_mm3.toFixed(0)}\\ \\text{mm}^3,\\; I = ${result.geometry.I_mm4.toFixed(0)}\\ \\text{mm}^4 \\]`}</MathJax>
          <MathJax dynamic>{`\\[ f_b = ${stepDetail.mat.fb.toFixed(2)}\\ \\text{MPa},\\; E = ${stepDetail.mat.E.toFixed(0)}\\ \\text{MPa} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="3. Factors & lateral stability">
          <MathJax dynamic>{`\\[ K_H = 1.0,\\; L_e = ${stepDetail.Le.toFixed(1)}\\ \\text{mm},\\; C_B = ${stepDetail.CB.toFixed(3)},\\; C_K = ${stepDetail.CK.toFixed(3)} \\]`}</MathJax>
          {stepDetail.klCase === 1 && <MathJax dynamic>{`\\[ K_L = 1 \\]`}</MathJax>}
          {stepDetail.klCase === 2 && <MathJax dynamic>{`\\[ K_L = ${result.factors.KL.toFixed(4)} \\]`}</MathJax>}
          {stepDetail.klCase === 3 && <MathJax dynamic>{`\\[ K_L = ${result.factors.KL.toFixed(4)},\\; F_b' = ${stepDetail.Fb_adj.toFixed(3)}\\ \\text{MPa} \\]`}</MathJax>}
        </WoodCalcStep>
        <WoodCalcStep label="4. Single M_r (same strong/weak check in this model)">
          <MathJax dynamic>{`\\[ M_r = \\frac{\\phi_b f_b K_D K_H K_{Sb} K_T S K_{Zb} K_L}{10^6} = ${result.Mr_kNm.toFixed(3)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="5. Shear, bearing, fracture, deflection">
          <MathJax dynamic>{`\\[ V_f = ${result.Vf_kN.toFixed(3)}\\ \\text{kN},\\; Q_f = ${result.Qf_kN.toFixed(3)}\\ \\text{kN},\\; V_r = ${result.Vr_kN.toFixed(3)}\\ \\text{kN},\\; Q_r = ${result.Qr_kN.toFixed(3)}\\ \\text{kN} \\]`}</MathJax>
          <MathJax dynamic>{`\\[ F_r = ${result.Fr_kN.toFixed(3)}\\ \\text{kN},\\; \\delta = ${result.delta_mm.toFixed(3)}\\ \\text{mm},\\; \\delta_{\\lim} = ${result.deltaLimit_mm.toFixed(3)}\\ \\text{mm} \\]`}</MathJax>
        </WoodCalcStep>
        <WoodCalcStep label="6. Utilization">
          <MathJax dynamic>{`\\[ \\frac{M_{fx}}{M_r}=${result.utilization.bendingStrong.toFixed(3)},\\; \\frac{M_{fy}}{M_r}=${result.utilization.bendingWeak.toFixed(3)},\\; \\frac{V_f}{V_r}=${result.utilization.shear.toFixed(3)},\\; \\frac{\\delta}{\\delta_{\\lim}}=${result.utilization.deflection.toFixed(3)} \\]`}</MathJax>
        </WoodCalcStep>
      </WoodCalculationSection>
    </div>
  );
}
