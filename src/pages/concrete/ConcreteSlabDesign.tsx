import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { ModuleOutcomeCards } from '../../components/ModuleOutcomeCards';
import { ModulePrintSummary, ModuleUtilizationTable } from '../../components/ModulePrintSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  getMinCover,
  computeConcreteSlab,
  getSlabThicknessDivisor,
  SLAB_BAR_SIZES,
  SUPPORT_CONDITIONS,
  EXPOSURE_CLASSES,
  CONCRETE_STRENGTHS,
  REBAR_GRADES,
  REBAR_DATA,
  PHI_C,
  PHI_S,
  type SlabBarSize,
  type SupportCondition,
  type ExposureClass,
} from '../../utils/concrete';

export function ConcreteSlabDesign() {
  const [Mf, setMf] = useState(30);
  const [Vf, setVf] = useState(40);
  const [Ln, setLn] = useState(4000);
  const [h, setH] = useState(200);
  const [fc, setFc] = useState<number>(30);
  const [fy, setFy] = useState<number>(400);
  const [cover, setCover] = useState(30);
  const [mainBarSize, setMainBarSize] = useState<SlabBarSize>('15M');
  const [supportCondition, setSupportCondition] = useState<SupportCondition>('Simply Supported');
  const [exposureClass, setExposureClass] = useState<ExposureClass>('N');
  const [isExterior, setIsExterior] = useState(false);
  const [density, setDensity] = useState(2400);

  const minCover = useMemo(() => getMinCover(exposureClass), [exposureClass]);
  const effectiveCover = Math.max(cover, minCover);

  const result = useMemo(
    () =>
      computeConcreteSlab({
        Mf_kNm_m: Mf,
        Vf_kN_m: Vf,
        Ln_mm: Ln,
        h_mm: h,
        fc_MPa: fc,
        fy_MPa: fy,
        cover_mm: effectiveCover,
        mainBarSize,
        supportCondition,
        exposureClass,
        isExterior,
        concreteDensity_kgm3: density,
      }),
    [Mf, Vf, Ln, h, fc, fy, effectiveCover, mainBarSize, supportCondition, exposureClass, isExterior, density]
  );

  const fcOptions = useMemo(() => CONCRETE_STRENGTHS.map((s) => ({ id: String(s), label: `${s} MPa` })), []);
  const fyOptions = useMemo(() => REBAR_GRADES.map((g) => ({ id: String(g), label: `${g} MPa` })), []);
  const mainBarOptions = useMemo(() => SLAB_BAR_SIZES.map((s) => ({ id: s, label: s })), []);
  const supportOptions = useMemo(() => SUPPORT_CONDITIONS.map((s) => ({ id: s, label: s })), []);
  const exposureOptions = useMemo(() => EXPOSURE_CLASSES.map((e) => ({ id: e, label: e })), []);

  const { flexure: f, shear: s, crackControl: cc, minThickness: mt } = result;

  const utilizationRows = [
    { label: 'Flexure', ratio: f.utilizationFlexure, description: `Mf/Mr = ${Mf.toFixed(1)}/${f.Mr_kNm_m.toFixed(1)}` },
    { label: 'Shear', ratio: s.utilizationShear, description: `Vf/Vc = ${Vf.toFixed(1)}/${s.Vc_kN_m.toFixed(1)}` },
    { label: 'Ductility', ratio: f.cdRatio / f.cdLimit, description: `c/d = ${f.cdRatio.toFixed(3)} ≤ ${f.cdLimit.toFixed(3)}` },
    { label: 'Min. depth', ratio: mt.hMin_mm / h, description: `h_min = ${mt.hMin_mm.toFixed(0)} mm` },
    { label: 'Crack control', ratio: cc.z_Nmm / cc.zLimit_Nmm, description: `z = ${cc.z_Nmm.toFixed(0)} N/mm` },
  ];

  const numBarsPerMetre = (1000 / f.barSpacing_mm).toFixed(1);

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
          <span className="value">{Number.isFinite(f.As_required_mm2_m) ? `${f.As_required_mm2_m.toFixed(0)} mm²/m` : '—'}</span>
        </div>
        <div className="calculated-value">
          <span className="label">A<sub>s,prov</sub>:</span>
          <span className="value">
            {mainBarSize} @ {f.barSpacing_mm} mm = {f.As_provided_mm2_m.toFixed(0)} mm²/m
          </span>
        </div>
        <div className="calculated-value">
          <span className="label">Moment resistance (M<sub>r</sub>):</span>
          <span className="value">{f.Mr_kNm_m.toFixed(1)} kN·m/m</span>
        </div>
        <div className="calculated-value">
          <span className="label">Shear resistance (V<sub>c</sub>):</span>
          <span className="value">{s.Vc_kN_m.toFixed(1)} kN/m</span>
        </div>
      </div>
    </>
  );

  const calculationSteps = (
    <>
      <WoodCalcStep label="1. Minimum thickness (Table 9.2 — one-way slab)">
        <MathJax dynamic>{`\\[ h_{\\min} = \\frac{L_n}{${getSlabThicknessDivisor(supportCondition)}} \\times ${mt.thicknessModifier.toFixed(3)} = \\frac{${Ln}}{${getSlabThicknessDivisor(supportCondition)}} \\times ${mt.thicknessModifier.toFixed(3)} = ${mt.hMin_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ h = ${h}\\ \\text{mm} ${mt.thicknessOk ? '\\ge' : '<'} h_{\\min} \\quad \\text{${mt.thicknessOk ? 'OK' : 'NG'}} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="2. Effective depth (no stirrups)">
        <MathJax dynamic>{`\\[ d = h - c - \\tfrac{d_{bar}}{2} = ${h} - ${effectiveCover} - \\tfrac{${REBAR_DATA[mainBarSize].diameter.toFixed(1)}}{2} = ${f.d_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="3. Stress block factors (Cl. 10.1.7)">
        <MathJax dynamic>{`\\[ \\alpha_1 = 0.85 - 0.0015 f'_c = ${f.alpha1.toFixed(3)} \\ge 0.67 \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\beta_1 = 0.97 - 0.0025 f'_c = ${f.beta1.toFixed(3)} \\ge 0.67 \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="4. Flexural reinforcement (per 1 m strip)">
        <MathJax dynamic>{`\\[ b = 1000\\ \\text{mm (1 m strip)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ A_{s,\\min} = \\frac{0.2\\sqrt{f'_c}}{f_y}\\,b\\,h = \\frac{0.2\\sqrt{${fc}}}{${fy}} \\times 1000 \\times ${h} = ${f.As_min_mm2_m.toFixed(0)}\\ \\text{mm}^2\\text{/m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ A_{s,\\text{req}} = ${Number.isFinite(f.As_required_mm2_m) ? f.As_required_mm2_m.toFixed(0) : '\\infty'}\\ \\text{mm}^2\\text{/m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ s = \\frac{1000 \\times A_b}{A_{s}} = \\frac{1000 \\times ${REBAR_DATA[mainBarSize].area}}{${Math.max(f.As_required_mm2_m, f.As_min_mm2_m).toFixed(0)}} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ s_{\\max} = \\min(3h,\\,500) = \\min(${3 * h},\\,500) = ${f.barSpacingMax_mm}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\text{Provide } ${mainBarSize}\\text{ @ }${f.barSpacing_mm}\\ \\text{mm c/c} \\Rightarrow A_s = ${f.As_provided_mm2_m.toFixed(0)}\\ \\text{mm}^2\\text{/m} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="5. Moment resistance">
        <MathJax dynamic>{`\\[ a = \\frac{\\phi_s A_s f_y}{\\alpha_1 \\phi_c f'_c b} = \\frac{${PHI_S} \\times ${f.As_provided_mm2_m.toFixed(0)} \\times ${fy}}{${f.alpha1.toFixed(3)} \\times ${PHI_C} \\times ${fc} \\times 1000} = ${f.a_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ M_r = \\phi_s A_s f_y \\!\\left(d - \\tfrac{a}{2}\\right) \\!\\times\\! 10^{-6} = ${f.Mr_kNm_m.toFixed(1)}\\ \\text{kN·m/m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\frac{M_f}{M_r} = \\frac{${Mf}}{${f.Mr_kNm_m.toFixed(1)}} = ${f.utilizationFlexure.toFixed(3)} ${f.utilizationFlexure <= 1 ? '\\le 1.0 \\; \\text{OK}' : '> 1.0 \\; \\text{NG}'} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="6. Ductility check (Cl. 10.5.2)">
        <MathJax dynamic>{`\\[ c = \\frac{a}{\\beta_1} = \\frac{${f.a_mm.toFixed(1)}}{${f.beta1.toFixed(3)}} = ${f.c_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\frac{c}{d} = ${f.cdRatio.toFixed(4)} \\le \\frac{700}{700 + f_y} = ${f.cdLimit.toFixed(4)} \\quad \\text{${f.ductilityOk ? 'OK' : 'NG'}} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="7. Shear check (concrete only — no stirrups)">
        <MathJax dynamic>{`\\[ d_v = \\max(0.9d,\\,0.72h) = \\max(${(0.9 * f.d_mm).toFixed(1)},\\,${(0.72 * h).toFixed(1)}) = ${s.dv_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ \\beta = \\frac{230}{1000 + d_v} = \\frac{230}{1000 + ${s.dv_mm.toFixed(1)}} = ${s.beta.toFixed(4)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_c = \\phi_c \\lambda \\beta \\sqrt{f'_c}\\,b\\,d_v \\times 10^{-3} = ${s.Vc_kN_m.toFixed(1)}\\ \\text{kN/m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ V_f = ${Vf} ${s.shearOk ? '\\le' : '>'} V_c = ${s.Vc_kN_m.toFixed(1)}\\ \\text{kN/m} \\quad \\text{${s.shearOk ? 'OK' : 'NG — increase thickness'}} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="8. Crack control (Cl. 10.6.1)">
        <MathJax dynamic>{`\\[ f_s = 0.6 f_y = ${cc.fs_MPa}\\ \\text{MPa} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ d_c = \\min\\!\\left(c + \\tfrac{d_{bar}}{2},\\,50\\right) = ${cc.dc_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ n = \\frac{1000}{s} = \\frac{1000}{${f.barSpacing_mm}} = ${numBarsPerMetre}\\ \\text{bars/m} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ A = \\frac{2(h-d) \\times b}{n} = \\frac{2(${h}-${f.d_mm.toFixed(1)}) \\times 1000}{${numBarsPerMetre}} = ${cc.A_mm2.toFixed(0)}\\ \\text{mm}^2 \\]`}</MathJax>
        <MathJax dynamic>{`\\[ z = f_s (d_c A)^{1/3} = ${cc.z_Nmm.toFixed(0)}\\ \\text{N/mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ z = ${cc.z_Nmm.toFixed(0)} ${cc.crackControlOk ? '\\le' : '>'} ${cc.zLimit_Nmm}\\ \\text{N/mm} \\quad \\text{${cc.crackControlOk ? 'OK' : 'NG — reduce spacing'}} \\]`}</MathJax>
      </WoodCalcStep>
    </>
  );

  return (
    <div className="beam-design-page concrete-design-page">
      <header className="page-header">
        <h1>One-Way Slab Design</h1>
        <p>Flexural and shear design per CSA A23.3 — 1 m strip</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Factored loads (per metre)</h3>
            <InputField label="Factored moment (Mf)" value={Mf} onChange={(v) => v != null && setMf(v)} allowEmpty={false} unit="kN·m/m" min={0} step={5} />
            <InputField label="Factored shear (Vf)" value={Vf} onChange={(v) => v != null && setVf(v)} allowEmpty={false} unit="kN/m" min={0} step={5} />
          </div>

          <div className="input-group">
            <h3>Geometry</h3>
            <InputField label="Clear span (Ln)" value={Ln} onChange={(v) => v != null && setLn(v)} allowEmpty={false} unit="mm" min={100} step={100} />
            <InputField label="Slab thickness (h)" value={h} onChange={(v) => v != null && setH(v)} allowEmpty={false} unit="mm" min={75} step={10} />
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
              label="Bar size"
              options={mainBarOptions}
              value={mainBarSize}
              onChange={(v) => setMainBarSize(v as SlabBarSize)}
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
              <MathJax inline>{"\\(V_f \\le V_c\\)"}</MathJax>
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
          <p className="criteria-note">Per 1 m strip width · φ factors per CSA A23.3 Cl. 10</p>
        </div>
      </section>

      <section className="calculations-panel">
        <ModulePrintSummary
          printTitle="One-Way Concrete Slab Design Calculation"
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
                      <td>{Mf} kN·m/m</td>
                    </tr>
                    <tr>
                      <td>Factored shear (V<sub>f</sub>)</td>
                      <td>{Vf} kN/m</td>
                    </tr>
                    <tr>
                      <td>Clear span (L<sub>n</sub>)</td>
                      <td>{Ln} mm</td>
                    </tr>
                    <tr>
                      <td>Slab thickness (h)</td>
                      <td>{h} mm</td>
                    </tr>
                    <tr>
                      <td>Strip width (b)</td>
                      <td>1000 mm</td>
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
                      <td>Reinforcement</td>
                      <td>{mainBarSize} @ {f.barSpacing_mm} mm</td>
                    </tr>
                    <tr>
                      <td>Cover (min {minCover} mm)</td>
                      <td>{effectiveCover} mm</td>
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
