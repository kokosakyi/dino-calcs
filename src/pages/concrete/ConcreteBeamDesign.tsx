import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { ModuleOutcomeCards } from '../../components/ModuleOutcomeCards';
import { ModulePrintSummary, ModuleUtilizationTable } from '../../components/ModulePrintSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeConcreteBeam,
  getMinCover,
  SUPPORT_CONDITIONS,
  EXPOSURE_CLASSES,
  CONCRETE_STRENGTHS,
  REBAR_GRADES,
  STIRRUP_SIZES,
  MAIN_BAR_SIZES,
  REBAR_DATA,
  PHI_C,
  PHI_S,
  type SupportCondition,
  type ExposureClass,
  type StirrupSize,
  type MainBarSize,
} from '../../utils/concrete';

export function ConcreteBeamDesign() {
  const [Mf, setMf] = useState(150);
  const [Vf, setVf] = useState(100);
  const [Ln, setLn] = useState(6000);
  const [b, setB] = useState(300);
  const [h, setH] = useState(500);
  const [fc, setFc] = useState<number>(30);
  const [fy, setFy] = useState<number>(400);
  const [cover, setCover] = useState(30);
  const [stirrupSize, setStirrupSize] = useState<StirrupSize>('10M');
  const [mainBarSize, setMainBarSize] = useState<MainBarSize>('25M');
  const [supportCondition, setSupportCondition] = useState<SupportCondition>('Simply Supported');
  const [exposureClass, setExposureClass] = useState<ExposureClass>('N');
  const [isExterior, setIsExterior] = useState(false);
  const [density, setDensity] = useState(2400);

  const minCover = useMemo(() => getMinCover(exposureClass), [exposureClass]);

  const result = useMemo(
    () =>
      computeConcreteBeam({
        Mf_kNm: Mf,
        Vf_kN: Vf,
        Ln_mm: Ln,
        b_mm: b,
        h_mm: h,
        fc_MPa: fc,
        fy_MPa: fy,
        cover_mm: Math.max(cover, minCover),
        stirrupSize,
        mainBarSize,
        supportCondition,
        exposureClass,
        isExterior,
        concreteDensity_kgm3: density,
      }),
    [Mf, Vf, Ln, b, h, fc, fy, cover, minCover, stirrupSize, mainBarSize, supportCondition, exposureClass, isExterior, density]
  );

  const fcOptions = useMemo(() => CONCRETE_STRENGTHS.map((s) => ({ id: String(s), label: `${s} MPa` })), []);
  const fyOptions = useMemo(() => REBAR_GRADES.map((g) => ({ id: String(g), label: `${g} MPa` })), []);
  const stirrupOptions = useMemo(() => STIRRUP_SIZES.map((s) => ({ id: s, label: s })), []);
  const mainBarOptions = useMemo(() => MAIN_BAR_SIZES.map((s) => ({ id: s, label: s })), []);
  const supportOptions = useMemo(() => SUPPORT_CONDITIONS.map((s) => ({ id: s, label: s })), []);
  const exposureOptions = useMemo(() => EXPOSURE_CLASSES.map((e) => ({ id: e, label: e })), []);

  const { flexure: f, shear: s, crackControl: cc, minThickness: mt } = result;

  const utilizationRows = [
    { label: 'Flexure', ratio: f.utilizationFlexure, description: `Mf/Mr = ${Mf.toFixed(1)}/${f.Mr_kNm.toFixed(1)}` },
    { label: 'Shear', ratio: s.utilizationShear, description: `Vf/Vr = ${Vf.toFixed(1)}/${s.Vr_kN.toFixed(1)}` },
    { label: 'Ductility', ratio: f.cdRatio / f.cdLimit, description: `c/d = ${f.cdRatio.toFixed(3)} ≤ ${f.cdLimit.toFixed(3)}` },
    { label: 'Min. depth', ratio: mt.hMin_mm / h, description: `h_min = ${mt.hMin_mm.toFixed(0)} mm` },
    { label: 'Crack control', ratio: cc.z_Nmm / cc.zLimit_Nmm, description: `z = ${cc.z_Nmm.toFixed(0)} N/mm` },
  ];

  const calculatedDesignSummary = (
    <>
      <h3>Calculated Design Values</h3>
      <div className="calculated-values-grid">
        <div className="calculated-value">
          <span className="label">Effective depth (d):</span>
          <span className="value">{f.d_mm.toFixed(1)} mm</span>
        </div>
        <div className="calculated-value">
          <span className="label">A<sub>s,req</sub>:</span>
          <span className="value">{Number.isFinite(f.As_required_mm2) ? `${f.As_required_mm2.toFixed(0)} mm²` : '—'}</span>
        </div>
        <div className="calculated-value">
          <span className="label">A<sub>s,prov</sub>:</span>
          <span className="value">
            {f.numBars}-{mainBarSize} = {f.As_provided_mm2} mm²
          </span>
        </div>
        <div className="calculated-value">
          <span className="label">Moment resistance (M<sub>r</sub>):</span>
          <span className="value">{f.Mr_kNm.toFixed(1)} kN·m</span>
        </div>
        <div className="calculated-value">
          <span className="label">Shear resistance (V<sub>r</sub>):</span>
          <span className="value">{s.Vr_kN.toFixed(1)} kN</span>
        </div>
        <div className="calculated-value">
          <span className="label">Stirrups:</span>
          <span className="value">
            {stirrupSize} @ {s.stirrupSpacing_mm} mm
          </span>
        </div>
      </div>
    </>
  );

  const calculationSteps = (
    <>
      <WoodCalcStep label="1. Minimum thickness (Table 9.2)">
        <MathJax dynamic>{`\\[ h_{\\min} = \\frac{L_n}{${getThicknessDivisor(supportCondition)}} \\times ${mt.thicknessModifier.toFixed(3)} = \\frac{${Ln}}{${getThicknessDivisor(supportCondition)}} \\times ${mt.thicknessModifier.toFixed(3)} = ${mt.hMin_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ h = ${h}\\ \\text{mm} ${mt.thicknessOk ? '\\ge' : '<'} h_{\\min} \\quad \\text{${mt.thicknessOk ? 'OK' : 'NG'}} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="2. Effective depth">
        <MathJax dynamic>{`\\[ d = h - c - d_{stirrup} - \\frac{d_{bar}}{2} = ${h} - ${Math.max(cover, minCover)} - ${REBAR_DATA[stirrupSize].diameter.toFixed(1)} - \\frac{${REBAR_DATA[mainBarSize].diameter.toFixed(1)}}{2} = ${f.d_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="3. Stress block factors (Cl. 10.1.7)">
        <MathJax dynamic>{`\\[ \\alpha_1 = 0.85 - 0.0015 f'_c = 0.85 - 0.0015(${fc}) = ${f.alpha1.toFixed(3)} \\ge 0.67 \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\beta_1 = 0.97 - 0.0025 f'_c = 0.97 - 0.0025(${fc}) = ${f.beta1.toFixed(3)} \\ge 0.67 \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="4. Flexural reinforcement">
        <MathJax dynamic>{`\\[ A_{s,\\min} = \\frac{0.2\\sqrt{f'_c}}{f_y} b_t h = \\frac{0.2\\sqrt{${fc}}}{${fy}} \\times ${b} \\times ${h} = ${f.As_min_mm2.toFixed(0)}\\ \\text{mm}^2 \\]`}</MathJax>
        <MathJax dynamic>{`\\[ A_{s,\\text{req}} = ${Number.isFinite(f.As_required_mm2) ? f.As_required_mm2.toFixed(0) : '\\infty'}\\ \\text{mm}^2 \\quad \\text{(from } M_r \\ge M_f \\text{)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\text{Provide } ${f.numBars}\\text{-}${mainBarSize} \\Rightarrow A_s = ${f.As_provided_mm2}\\ \\text{mm}^2 \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="5. Moment resistance">
        <MathJax dynamic>{`\\[ a = \\frac{\\phi_s A_s f_y}{\\alpha_1 \\phi_c f'_c b} = \\frac{${PHI_S} \\times ${f.As_provided_mm2} \\times ${fy}}{${f.alpha1.toFixed(3)} \\times ${PHI_C} \\times ${fc} \\times ${b}} = ${f.a_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ M_r = \\phi_s A_s f_y \\left(d - \\frac{a}{2}\\right) = ${PHI_S} \\times ${f.As_provided_mm2} \\times ${fy} \\times \\left(${f.d_mm.toFixed(1)} - \\frac{${f.a_mm.toFixed(1)}}{2}\\right) \\times 10^{-6} = ${f.Mr_kNm.toFixed(1)}\\ \\text{kN}\\!\\cdot\\!\\text{m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\frac{M_f}{M_r} = \\frac{${Mf}}{${f.Mr_kNm.toFixed(1)}} = ${f.utilizationFlexure.toFixed(3)} ${f.utilizationFlexure <= 1 ? '\\le 1.0 \\quad \\text{OK}' : '> 1.0 \\quad \\text{NG}'} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="6. Ductility check (Cl. 10.5.2)">
        <MathJax dynamic>{`\\[ c = \\frac{a}{\\beta_1} = \\frac{${f.a_mm.toFixed(1)}}{${f.beta1.toFixed(3)}} = ${f.c_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\frac{c}{d} = \\frac{${f.c_mm.toFixed(1)}}{${f.d_mm.toFixed(1)}} = ${f.cdRatio.toFixed(4)} \\le \\frac{700}{700 + f_y} = ${f.cdLimit.toFixed(4)} \\quad \\text{${f.ductilityOk ? 'OK' : 'NG'}} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="7. Shear design">
        <MathJax dynamic>{`\\[ d_v = \\max(0.9d,\\, 0.72h) = \\max(${(0.9 * f.d_mm).toFixed(1)},\\, ${(0.72 * h).toFixed(1)}) = ${s.dv_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_{r,\\max} = 0.25 \\phi_c f'_c b_w d_v = 0.25 \\times ${PHI_C} \\times ${fc} \\times ${b} \\times ${s.dv_mm.toFixed(1)} \\times 10^{-3} = ${s.Vr_max_kN.toFixed(1)}\\ \\text{kN} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_c = \\phi_c \\lambda \\beta \\sqrt{f'_c}\\, b_w d_v = ${PHI_C} \\times 1.0 \\times ${s.beta} \\times \\sqrt{${fc}} \\times ${b} \\times ${s.dv_mm.toFixed(1)} \\times 10^{-3} = ${s.Vc_kN.toFixed(1)}\\ \\text{kN} \\]`}</MathJax>
        {s.shearReinfRequired ? (
          <>
            <MathJax dynamic>{`\\[ V_s = V_f - V_c = ${Vf} - ${s.Vc_kN.toFixed(1)} = ${s.Vs_required_kN.toFixed(1)}\\ \\text{kN} \\]`}</MathJax>
            <MathJax dynamic>{`\\[ s = \\frac{\\phi_s A_v f_y d_v \\cot\\theta}{V_s} = \\frac{${PHI_S} \\times ${s.Av_mm2} \\times ${fy} \\times ${s.dv_mm.toFixed(1)} \\times \\cot(${s.theta_deg}°)}{${s.Vs_required_kN.toFixed(1)} \\times 10^3} \\]`}</MathJax>
            <MathJax dynamic>{`\\[ s_{\\max} = \\min(0.7 d_v,\\, 600) = ${s.stirrupSpacingMax_mm.toFixed(0)}\\ \\text{mm} \\]`}</MathJax>
            <MathJax dynamic>{`\\[ \\text{Use } ${stirrupSize}\\text{ @ }${s.stirrupSpacing_mm}\\ \\text{mm c/c} \\]`}</MathJax>
          </>
        ) : (
          <MathJax dynamic>{`\\[ V_f = ${Vf}\\ \\text{kN} \\le V_c = ${s.Vc_kN.toFixed(1)}\\ \\text{kN} \\quad \\text{(min. stirrups only)} \\]`}</MathJax>
        )}
        <MathJax dynamic>{`\\[ V_r = V_c + V_s = ${s.Vr_kN.toFixed(1)}\\ \\text{kN},\\quad \\frac{V_f}{V_r} = ${s.utilizationShear.toFixed(3)} ${s.utilizationShear <= 1 ? '\\le 1.0 \\quad \\text{OK}' : '> 1.0 \\quad \\text{NG}'} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="8. Crack control (Cl. 10.6.1)">
        <MathJax dynamic>{`\\[ f_s = 0.6 f_y = 0.6 \\times ${fy} = ${cc.fs_MPa}\\ \\text{MPa} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ d_c = \\min\\left(c + d_{stirrup} + \\frac{d_{bar}}{2},\\, 50\\right) = ${cc.dc_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ A = \\frac{2(h-d) \\times b}{n} = \\frac{2(${h}-${f.d_mm.toFixed(1)}) \\times ${b}}{${f.numBars}} = ${cc.A_mm2.toFixed(0)}\\ \\text{mm}^2 \\]`}</MathJax>
        <MathJax dynamic>{`\\[ z = f_s (d_c A)^{1/3} = ${cc.fs_MPa} \\times (${cc.dc_mm.toFixed(1)} \\times ${cc.A_mm2.toFixed(0)})^{1/3} = ${cc.z_Nmm.toFixed(0)}\\ \\text{N/mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ z = ${cc.z_Nmm.toFixed(0)} ${cc.crackControlOk ? '\\le' : '>'} ${cc.zLimit_Nmm}\\ \\text{N/mm} \\quad \\text{${cc.crackControlOk ? 'OK' : 'NG — add more bars'}} \\]`}</MathJax>
      </WoodCalcStep>
    </>
  );

  return (
    <div className="beam-design-page concrete-design-page">
      <header className="page-header">
        <h1>Rectangular Beam Design</h1>
        <p>Flexural and shear design per CSA A23.3</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Factored loads</h3>
            <InputField label="Factored moment (Mf)" value={Mf} onChange={(v) => v != null && setMf(v)} allowEmpty={false} unit="kN·m" min={0} step={5} />
            <InputField label="Factored shear (Vf)" value={Vf} onChange={(v) => v != null && setVf(v)} allowEmpty={false} unit="kN" min={0} step={5} />
          </div>

          <div className="input-group">
            <h3>Geometry</h3>
            <InputField label="Clear span (Ln)" value={Ln} onChange={(v) => v != null && setLn(v)} allowEmpty={false} unit="mm" min={100} step={100} />
            <InputField label="Beam width (b)" value={b} onChange={(v) => v != null && setB(v)} allowEmpty={false} unit="mm" min={100} step={25} />
            <InputField label="Beam depth (h)" value={h} onChange={(v) => v != null && setH(v)} allowEmpty={false} unit="mm" min={100} step={25} />
            <CustomDropdown
              label="Support condition"
              options={supportOptions}
              value={supportCondition}
              onChange={(v) => setSupportCondition(v as SupportCondition)}
            />
          </div>

          <div className="input-group">
            <h3>Materials</h3>
            <CustomDropdown
              label="Concrete strength (f'c)"
              options={fcOptions}
              value={String(fc)}
              onChange={(v) => setFc(Number(v))}
            />
            <CustomDropdown
              label="Rebar yield (fy)"
              options={fyOptions}
              value={String(fy)}
              onChange={(v) => setFy(Number(v))}
            />
            <InputField
              label="Concrete density"
              value={density}
              onChange={(v) => v != null && setDensity(v)}
              allowEmpty={false}
              unit="kg/m³"
              min={1400}
              max={2500}
              step={50}
            />
          </div>

          <div className="input-group">
            <h3>Reinforcement</h3>
            <CustomDropdown
              label="Main bar size"
              options={mainBarOptions}
              value={mainBarSize}
              onChange={(v) => setMainBarSize(v as MainBarSize)}
            />
            <CustomDropdown
              label="Stirrup size"
              options={stirrupOptions}
              value={stirrupSize}
              onChange={(v) => setStirrupSize(v as StirrupSize)}
            />
            <InputField
              label={<>Cover <span style={{ opacity: 0.7 }}>(min {minCover} mm)</span></>}
              value={cover}
              onChange={(v) => v != null && setCover(v)}
              allowEmpty={false}
              unit="mm"
              min={minCover}
              step={5}
            />
          </div>

          <div className="input-group">
            <h3>Exposure &amp; crack control</h3>
            <CustomDropdown
              label="Exposure class"
              options={exposureOptions}
              value={exposureClass}
              onChange={(v) => setExposureClass(v as ExposureClass)}
            />
            <div className="input-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={isExterior}
                  onChange={(e) => setIsExterior(e.target.checked)}
                />
                Exterior exposure (z ≤ 25,000)
              </label>
            </div>
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
              <MathJax inline>{"\\(c/d \\le 700/(700+f_y)\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(h \\ge h_{\\min}\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(z \\le z_{\\lim}\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">φ factors and stress block per CSA A23.3 Cl. 10</p>
        </div>
      </section>

      <section className="calculations-panel">
        <ModulePrintSummary
          printTitle="Rectangular Concrete Beam Design Calculation"
          standardLine="CSA A23.3 — Design of Concrete Structures"
          footerLeft="DinoCalcs — Concrete design"
          footerRight="Calculations per CSA A23.3"
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
                      <td>Factored moment (M<sub>f</sub>)</td>
                      <td>{Mf} kN·m</td>
                    </tr>
                    <tr>
                      <td>Factored shear (V<sub>f</sub>)</td>
                      <td>{Vf} kN</td>
                    </tr>
                    <tr>
                      <td>Clear span (L<sub>n</sub>)</td>
                      <td>{Ln} mm</td>
                    </tr>
                    <tr>
                      <td>Beam width (b)</td>
                      <td>{b} mm</td>
                    </tr>
                    <tr>
                      <td>Beam depth (h)</td>
                      <td>{h} mm</td>
                    </tr>
                    <tr>
                      <td>Support condition</td>
                      <td>{supportCondition}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Materials &amp; reinforcement</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>f&apos;c</td>
                      <td>{fc} MPa</td>
                    </tr>
                    <tr>
                      <td>f<sub>y</sub></td>
                      <td>{fy} MPa</td>
                    </tr>
                    <tr>
                      <td>Concrete density</td>
                      <td>{density} kg/m³</td>
                    </tr>
                    <tr>
                      <td>Main bars</td>
                      <td>
                        {f.numBars}-{mainBarSize}
                      </td>
                    </tr>
                    <tr>
                      <td>Stirrups</td>
                      <td>
                        {stirrupSize} @ {s.stirrupSpacing_mm} mm
                      </td>
                    </tr>
                    <tr>
                      <td>Cover (min {minCover} mm)</td>
                      <td>{Math.max(cover, minCover)} mm</td>
                    </tr>
                    <tr>
                      <td>Exposure class</td>
                      <td>{exposureClass}</td>
                    </tr>
                    <tr>
                      <td>Exterior exposure</td>
                      <td>{isExterior ? 'Yes' : 'No'}</td>
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

function getThicknessDivisor(support: SupportCondition): number {
  switch (support) {
    case 'Simply Supported':
      return 16;
    case 'One End Continuous':
      return 18;
    case 'Both Ends Continuous':
      return 21;
    case 'Cantilever':
      return 8;
  }
}
