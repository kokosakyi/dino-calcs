import { useMemo, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../../components/CustomDropdown';
import { InputField } from '../../components/InputField';
import { ModuleOutcomeCards } from '../../components/ModuleOutcomeCards';
import { ModulePrintSummary, ModuleUtilizationTable } from '../../components/ModulePrintSummary';
import { WoodCalculationSection, WoodCalcStep } from '../../components/WoodCalculationSection';
import {
  computeConcreteFooting,
  CONCRETE_STRENGTHS,
  REBAR_GRADES,
  MAIN_BAR_SIZES,
  REBAR_DATA,
  type MainBarSize,
} from '../../utils/concrete';

export function ConcreteFootingDesign() {
  const [cx, setCx] = useState(400);
  const [cy, setCy] = useState(400);
  const [D, setD] = useState(800);
  const [L, setL] = useState(600);
  const [qAll, setQAll] = useState(250);
  const [B, setB] = useState(2800);
  const [Lf, setLf] = useState(2800);
  const [h, setH] = useState(550);
  const [fc, setFc] = useState<number>(30);
  const [fy, setFy] = useState<number>(400);
  const [cover, setCover] = useState(75);
  const [barB, setBarB] = useState<MainBarSize>('20M');
  const [barL, setBarL] = useState<MainBarSize>('20M');
  const [bfDepth, setBfDepth] = useState(0);
  const [gammaSoil, setGammaSoil] = useState(18);

  const result = useMemo(
    () =>
      computeConcreteFooting({
        columnCx_mm: cx,
        columnCy_mm: cy,
        deadLoad_kN: D,
        liveLoad_kN: L,
        qAllow_kPa: qAll,
        footingB_mm: B,
        footingL_mm: Lf,
        footingH_mm: h,
        fc_MPa: fc,
        fy_MPa: fy,
        cover_mm: cover,
        barSizeB: barB,
        barSizeL: barL,
        backfillDepth_mm: bfDepth,
        soilUnitWeight_kNm3: gammaSoil,
      }),
    [cx, cy, D, L, qAll, B, Lf, h, fc, fy, cover, barB, barL, bfDepth, gammaSoil]
  );

  const { sls, uls, oneWay, punching, flexure, development } = result;
  const fB = flexure.dirB;
  const fL = flexure.dirL;

  const fcOptions = useMemo(() => CONCRETE_STRENGTHS.map((s) => ({ id: String(s), label: `${s} MPa` })), []);
  const fyOptions = useMemo(() => REBAR_GRADES.map((g) => ({ id: String(g), label: `${g} MPa` })), []);
  const barOptions = useMemo(() => MAIN_BAR_SIZES.map((s) => ({ id: s, label: s })), []);

  const utilizationRows = [
    {
      label: 'Bearing (SLS)',
      ratio: sls.utilizationBearing,
      description: `q_s/q_{all} = ${sls.qService_kPa.toFixed(1)}/${qAll}`,
    },
    {
      label: 'One-way shear (B)',
      ratio: oneWay.unityB,
      description: `V_f/V_c = ${oneWay.VfB_kN.toFixed(1)}/${oneWay.VcB_kN.toFixed(1)} kN`,
    },
    {
      label: 'One-way shear (L)',
      ratio: oneWay.unityL,
      description: `V_f/V_c = ${oneWay.VfL_kN.toFixed(1)}/${oneWay.VcL_kN.toFixed(1)} kN`,
    },
    {
      label: 'Punching shear',
      ratio: punching.unityPunch,
      description: `V_f/V_r = ${punching.Vf_punch_kN.toFixed(1)}/${punching.Vr_punch_kN.toFixed(1)} kN`,
    },
    {
      label: 'Flexure (B dir.)',
      ratio: fB.utilization,
      description: `M_f/M_r = ${fB.Mf_kNm.toFixed(2)}/${fB.Mr_kNm.toFixed(2)} kN·m`,
    },
    {
      label: 'Flexure (L dir.)',
      ratio: fL.utilization,
      description: `M_f/M_r = ${fL.Mf_kNm.toFixed(2)}/${fL.Mr_kNm.toFixed(2)} kN·m`,
    },
    {
      label: 'Development (B)',
      ratio: development.ld_mm / Math.max(development.availB_mm, 1e-6),
      description: `l_d = ${development.ld_mm.toFixed(0)} mm`,
    },
    {
      label: 'Development (L)',
      ratio: development.ld_mm / Math.max(development.availL_mm, 1e-6),
      description: `l_d = ${development.ld_mm.toFixed(0)} mm`,
    },
  ];

  const calculatedDesignSummary = (
    <>
      <h3>Calculated values</h3>
      <div className="calculated-values-grid">
        <div className="calculated-value">
          <span className="label">Service pressure (q<sub>s</sub>):</span>
          <span className="value">{sls.qService_kPa.toFixed(1)} kPa</span>
        </div>
        <div className="calculated-value">
          <span className="label">Factored soil pressure (q<sub>u</sub>):</span>
          <span className="value">{uls.qu_kPa.toFixed(1)} kPa</span>
        </div>
        <div className="calculated-value">
          <span className="label">d (B-dir. flexure), d (L-dir.):</span>
          <span className="value">
            {fB.d_mm.toFixed(0)} mm, {fL.d_mm.toFixed(0)} mm
          </span>
        </div>
        <div className="calculated-value">
          <span className="label">Steel B × L (parallel to L × B):</span>
          <span className="value">
            {fB.numBars}-{barB} @ ~{fB.barSpacing_mm.toFixed(0)} mm; {fL.numBars}-{barL} @ ~{fL.barSpacing_mm.toFixed(0)} mm
          </span>
        </div>
      </div>
    </>
  );

  const betaShear = 0.18;

  const calculationSteps = (
    <>
      <WoodCalcStep label="1. Service loads and bearing (SLS)">
        <p>
          Self-weight concrete W<sub>c</sub> = {sls.selfWeightConcrete_kN.toFixed(1)} kN; backfill W<sub>bf</sub> ={' '}
          {sls.selfWeightBackfill_kN.toFixed(1)} kN; q<sub>s</sub> = {sls.totalService_kN.toFixed(1)} / {sls.area_m2.toFixed(2)} ={' '}
          {sls.qService_kPa.toFixed(1)} kPa ≤ {qAll} kPa ({sls.bearingOk ? 'OK' : 'NG'}).
        </p>
      </WoodCalcStep>

      <WoodCalcStep label="2. Factored load and q<sub>u</sub> (ULS)">
        <MathJax dynamic>{`\\[ P_u = 1.25(D + W_c + W_{bf}) + 1.5L = ${uls.factoredLoad_kN.toFixed(1)}\\ \\text{kN},\\quad q_u = \\frac{P_u}{A} = ${uls.qu_kPa.toFixed(1)}\\ \\text{kPa} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="3. Effective depth">
        <MathJax dynamic>{`\\[ d_B = h - c - \\frac{d_{b,L}}{2} = ${h} - ${cover} - \\frac{${REBAR_DATA[barL].diameter}}{2} = ${fB.d_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ d_L = h - c - \\frac{d_{b,B}}{2} = ${fL.d_mm.toFixed(1)}\\ \\text{mm},\\quad d_{avg} = ${oneWay.dAvg_mm.toFixed(1)}\\ \\text{mm} \\]`}</MathJax>
      </WoodCalcStep>

      <WoodCalcStep label="4. One-way shear (Cl. 11.3.6.2 simplified)">
        <MathJax dynamic>{`\\[ V_c = \\phi_c \\lambda \\beta \\sqrt{f'_c}\\, b_w d \\quad (\\beta = ${betaShear}) \\]`}</MathJax>
        <p>
          B-direction: V<sub>f</sub> = {oneWay.VfB_kN.toFixed(1)} kN, V<sub>c</sub> = {oneWay.VcB_kN.toFixed(1)} kN ({oneWay.okB ? 'OK' : 'NG'}). L-direction: V<sub>f</sub> ={' '}
          {oneWay.VfL_kN.toFixed(1)} kN, V<sub>c</sub> = {oneWay.VcL_kN.toFixed(1)} kN ({oneWay.okL ? 'OK' : 'NG'}).
        </p>
      </WoodCalcStep>

      <WoodCalcStep label="5. Two-way shear (punching)">
        <MathJax dynamic>{`\\[ b_o = 2(c_x+d_{avg}) + 2(c_y+d_{avg}) = ${punching.bo_mm.toFixed(0)}\\ \\text{mm},\\quad \\beta_c = ${punching.beta_c.toFixed(2)} \\]`}</MathJax>
        <MathJax dynamic>{`\\[ v_c = \\min\\{\\text{Cl. 13-5, 13-6, 13-7}\\} = ${punching.vc_MPa.toFixed(3)}\\ \\text{MPa},\\quad V_r = v_c b_o d_{avg} = ${punching.Vr_punch_kN.toFixed(1)}\\ \\text{kN} \\]`}</MathJax>
        <p>
          V<sub>f</sub> = {punching.Vf_punch_kN.toFixed(1)} kN ({punching.ok ? 'OK' : 'NG'}).
        </p>
      </WoodCalcStep>

      <WoodCalcStep label="6. Flexure at column face">
        <p>
          B-direction (width L<sub>f</sub>): M<sub>f</sub> = {fB.Mf_kNm.toFixed(2)} kN·m; provide {fB.numBars}-{barB} (A<sub>s</sub> = {fB.As_provided_mm2} mm²), M<sub>r</sub> = {fB.Mr_kNm.toFixed(2)} kN·m.
        </p>
        <p>
          L-direction (width B): M<sub>f</sub> = {fL.Mf_kNm.toFixed(2)} kN·m; provide {fL.numBars}-{barL} (A<sub>s</sub> = {fL.As_provided_mm2} mm²), M<sub>r</sub> = {fL.Mr_kNm.toFixed(2)} kN·m.
        </p>
      </WoodCalcStep>

      <WoodCalcStep label="7. Development length (simplified)">
        <MathJax dynamic>{`\\[ l_d \\approx 1.15 \\frac{f_y}{\\sqrt{f'_c}} d_b = ${development.ld_mm.toFixed(0)}\\ \\text{mm} \\]`}</MathJax>
        <p>
          Available embedment from column face: {(B - cx) / 2 - cover} mm (B), {(Lf - cy) / 2 - cover} mm (L). Development {development.okB && development.okL ? 'OK' : 'check — NG in one or both directions'}.
        </p>
      </WoodCalcStep>
    </>
  );

  return (
    <div className="beam-design-page concrete-design-page">
      <header className="page-header">
        <h1>Isolated Rectangular Footing</h1>
        <p>Centered column; SLS bearing and ULS shear, punching, and flexure per CSA A23.3</p>
      </header>

      <section className="input-panel">
        <h2>Design inputs</h2>
        <div className="input-groups-container">
          <div className="input-group">
            <h3>Column &amp; loads (unfactored service)</h3>
            <InputField label="Column c_x" value={cx} onChange={setCx} unit="mm" min={100} step={25} />
            <InputField label="Column c_y" value={cy} onChange={setCy} unit="mm" min={100} step={25} />
            <InputField label="Dead load (D)" value={D} onChange={setD} unit="kN" min={0} step={10} />
            <InputField label="Live load (L)" value={L} onChange={setL} unit="kN" min={0} step={10} />
          </div>

          <div className="input-group">
            <h3>Footing &amp; soil</h3>
            <InputField label="Footing width (B)" value={B} onChange={setB} unit="mm" min={cx + 100} step={100} />
            <InputField label="Footing length (L)" value={Lf} onChange={setLf} unit="mm" min={cy + 100} step={100} />
            <InputField label="Footing thickness (h)" value={h} onChange={setH} unit="mm" min={200} step={25} />
            <InputField label="Allowable bearing q_all (SLS)" value={qAll} onChange={setQAll} unit="kPa" min={1} step={5} />
            <InputField label="Backfill depth above top of footing" value={bfDepth} onChange={setBfDepth} unit="mm" min={0} step={50} />
            <InputField label="Soil unit weight (γ)" value={gammaSoil} onChange={setGammaSoil} unit="kN/m³" min={5} step={1} />
          </div>

          <div className="input-group">
            <h3>Materials</h3>
            <CustomDropdown label="f'c" options={fcOptions} value={String(fc)} onChange={(v) => setFc(Number(v))} />
            <CustomDropdown label="fy" options={fyOptions} value={String(fy)} onChange={(v) => setFy(Number(v))} />
            <InputField label="Bottom cover" value={cover} onChange={setCover} unit="mm" min={50} step={5} />
          </div>

          <div className="input-group">
            <h3>Reinforcement (bottom mat)</h3>
            <CustomDropdown
              label="Bars for bending across B (shank ∥ L)"
              options={barOptions}
              value={barB}
              onChange={(v) => setBarB(v as MainBarSize)}
            />
            <CustomDropdown
              label="Bars for bending across L (shank ∥ B)"
              options={barOptions}
              value={barL}
              onChange={(v) => setBarL(v as MainBarSize)}
            />
          </div>
        </div>

        <div className="calculated-loads-summary full-width">{calculatedDesignSummary}</div>

        <div className="design-criteria full-width">
          <h3>Design criteria</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <MathJax inline>{"\\(q_s \\le q_{all}\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(V_f \\le V_c\\)"}</MathJax> one-way
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(V_f \\le V_r\\)"}</MathJax> punching
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(M_f \\le M_r\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(l_d \\le \\text{available}\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">φ<sub>c</sub> = 0.65, φ<sub>s</sub> = 0.85; concrete self-weight 24 kN/m³; punching v<sub>c</sub> per Cl. 13-5 to 13-7.</p>
        </div>
      </section>

      <section className="calculations-panel">
        <ModulePrintSummary
          printTitle="Isolated Rectangular Footing Design"
          standardLine="CSA A23.3 — Design of Concrete Structures"
          footerLeft="DinoCalcs — Concrete design"
          footerRight="Calculations per CSA A23.3"
        >
          <h2>Design summary</h2>

          <div className="summary-section design-inputs-section">
            <h3>Design inputs</h3>
            <div className="inputs-grid print-two-col">
              <div className="input-group">
                <h4>Geometry &amp; loads</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>Column c<sub>x</sub> × c<sub>y</sub></td>
                      <td>
                        {cx} × {cy} mm
                      </td>
                    </tr>
                    <tr>
                      <td>Footing B × L × h</td>
                      <td>
                        {B} × {Lf} × {h} mm
                      </td>
                    </tr>
                    <tr>
                      <td>D, L (service)</td>
                      <td>
                        {D} kN, {L} kN
                      </td>
                    </tr>
                    <tr>
                      <td>q<sub>all</sub> (SLS)</td>
                      <td>{qAll} kPa</td>
                    </tr>
                    <tr>
                      <td>Backfill / γ<sub>soil</sub></td>
                      <td>
                        {bfDepth} mm / {gammaSoil} kN/m³
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="input-group">
                <h4>Materials &amp; bars</h4>
                <table className="inputs-table">
                  <tbody>
                    <tr>
                      <td>f&apos;c, f<sub>y</sub></td>
                      <td>
                        {fc} MPa, {fy} MPa
                      </td>
                    </tr>
                    <tr>
                      <td>Cover</td>
                      <td>{cover} mm</td>
                    </tr>
                    <tr>
                      <td>Bars (∥ L / ∥ B)</td>
                      <td>
                        {barB} / {barL}
                      </td>
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
