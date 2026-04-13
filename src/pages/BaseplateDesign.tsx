import { useState, useMemo, useEffect } from 'react';
import { MathJax } from 'better-react-mathjax';
import { InputField } from '../components/InputField';
import { CustomDropdown } from '../components/CustomDropdown';
import { BaseplateDesignSummary } from '../components/BaseplateDesignSummary';
import { calculateBaseplateDesign, formatNumber } from '../utils/steelDesign';
import type { BaseplateColumnType, BaseplateDesignResult, GenericSection } from '../types/steel';
import wSections from '../assets/W_Section.json';
import hssSections from '../assets/HSS-A500_section.json';

export function BaseplateDesign() {
  const [columnType, setColumnType] = useState<BaseplateColumnType>('W');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('W310x97');

  // Factored loads
  const [Cf, setCf] = useState<number | null>(500);
  const [Mx, setMx] = useState<number | null>(0);
  const [My, setMy] = useState<number | null>(0);

  // Materials
  const [Fy_bp, setFy_bp] = useState<number>(300);
  const [fc, setFc] = useState<number>(30);

  // Baseplate dimensions (user-overridable)
  const [B_plate, setB_plate] = useState<number | null>(500);
  const [N_plate, setN_plate] = useState<number | null>(500);

  // Pedestal dimensions
  const [B_conc, setB_conc] = useState<number | null>(600);
  const [N_conc, setN_conc] = useState<number | null>(600);
  const [grout, setGrout] = useState<number | null>(25);
  const [overhang, setOverhang] = useState<number | null>(100);

  const sectionOptions = useMemo(() => {
    const sections = columnType === 'W'
      ? (wSections as GenericSection[])
      : (hssSections as GenericSection[]);
    return sections.map(s => ({
      id: s.Dsg,
      label: s.Dsg,
      sublabel: `${s.Mass} kg/m, d=${s.D}mm` + (s.B ? `, b=${s.B}mm` : ''),
    }));
  }, [columnType]);

  const selectedSection = useMemo((): GenericSection | null => {
    const sections = columnType === 'W'
      ? (wSections as GenericSection[])
      : (hssSections as GenericSection[]);
    return sections.find(s => s.Dsg === selectedDesignation) || null;
  }, [columnType, selectedDesignation]);

  // Auto-compute default B/N when section changes
  useEffect(() => {
    if (selectedSection && overhang != null) {
      const d = parseFloat(selectedSection.D || '0');
      const b = parseFloat(selectedSection.B || '0');
      const autoSize = Math.round((Math.max(d, b) + 2 * overhang) / 10) * 10;
      setB_plate(autoSize);
      setN_plate(autoSize);
    }
  }, [selectedDesignation, selectedSection, overhang]);

  const handleColumnTypeChange = (type: string) => {
    const newType = type as BaseplateColumnType;
    setColumnType(newType);
    if (newType === 'W') {
      setSelectedDesignation('W310x97');
    } else {
      setSelectedDesignation((hssSections as GenericSection[])[0]?.Dsg || '');
    }
  };

  const result: BaseplateDesignResult | null = useMemo(() => {
    if (
      !selectedSection || Cf == null || Mx == null || My == null
      || B_plate == null || N_plate == null || B_conc == null || N_conc == null
      || grout == null || overhang == null
    ) return null;
    if (Cf <= 0) return null;

    const d_col = parseFloat(selectedSection.D || '0');
    const b_f_val = parseFloat(selectedSection.B || '0');
    const isHSS = columnType === 'HSS';
    const t_f = parseFloat(isHSS ? (selectedSection.Tdes || selectedSection.T || '0') : (selectedSection.T || '0'));
    const t_w = parseFloat(isHSS ? (selectedSection.Tdes || selectedSection.T || '0') : (selectedSection.W || '0'));
    const A_col = parseFloat(selectedSection.A || '0');

    return calculateBaseplateDesign({
      columnType, d_col, b_f: b_f_val, t_f, t_w, A_col,
      Cf, Mx, My, Fy_bp, fc,
      B_plate, N_plate,
      B_conc, N_conc, grout, overhang,
    });
  }, [selectedSection, columnType, Cf, Mx, My, Fy_bp, fc, B_plate, N_plate, B_conc, N_conc, grout, overhang]);

  const getStatusColor = (status: string) => {
    if (status === 'converged') return 'pass';
    if (status === 'not_converged') return 'fail';
    return 'warning';
  };

  return (
    <div className="beam-design-page">
      <header className="page-header">
        <h1>Baseplate Design</h1>
        <p>Size steel baseplates for W-section and HSS columns per CSA S16-19 &amp; CSA A23.3-19</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>

        <div className="input-groups-container">
          <div className="input-group">
            <h3>Column Selection</h3>
            <CustomDropdown
              label="Column Type"
              options={[
                { id: 'W', label: 'W-Section', sublabel: 'Wide flange columns' },
                { id: 'HSS', label: 'HSS Section', sublabel: 'Hollow structural sections (ASTM A500)' },
              ]}
              value={columnType}
              onChange={handleColumnTypeChange}
            />
            <CustomDropdown
              label="Section Designation"
              options={sectionOptions}
              value={selectedDesignation}
              onChange={setSelectedDesignation}
              searchable
            />
            {selectedSection && (
              <div className="section-info-mini">
                <span>d = {selectedSection.D} mm</span>
                <span>b = {selectedSection.B} mm</span>
                <span>A = {selectedSection.A} mm²</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <h3>Factored Loads</h3>
            <InputField
              label={<>Axial Compression (<MathJax dynamic inline>{"\\(C_f\\)"}</MathJax>)</>}
              value={Cf}
              onChange={setCf}
              unit="kN"
              min={0}
              step={50}
            />
            <InputField
              label={<>Moment about x-axis (<MathJax dynamic inline>{"\\(M_x\\)"}</MathJax>)</>}
              value={Mx}
              onChange={setMx}
              unit="kN·m"
              min={0}
              step={5}
            />
            <InputField
              label={<>Moment about y-axis (<MathJax dynamic inline>{"\\(M_y\\)"}</MathJax>)</>}
              value={My}
              onChange={setMy}
              unit="kN·m"
              min={0}
              step={5}
            />
          </div>

          <div className="input-group">
            <h3>Materials</h3>
            <CustomDropdown
              label="Baseplate Steel Grade"
              options={[
                { id: '300', label: 'CSA G40.21 300W', sublabel: 'Fy = 300 MPa' },
                { id: '350', label: 'CSA G40.21 350W', sublabel: 'Fy = 350 MPa' },
              ]}
              value={String(Fy_bp)}
              onChange={(v) => setFy_bp(Number(v))}
            />
            <CustomDropdown
              label="Concrete Strength (f'c)"
              options={[
                { id: '25', label: "f'c = 25 MPa", sublabel: 'Normal strength' },
                { id: '30', label: "f'c = 30 MPa", sublabel: 'Normal strength' },
                { id: '35', label: "f'c = 35 MPa", sublabel: 'High strength' },
                { id: '40', label: "f'c = 40 MPa", sublabel: 'High strength' },
              ]}
              value={String(fc)}
              onChange={(v) => setFc(Number(v))}
            />
          </div>

          <div className="input-group">
            <h3>Baseplate Dimensions</h3>
            <InputField
              label={<>Plate Width (<MathJax dynamic inline>{"\\(B\\)"}</MathJax>)</>}
              value={B_plate}
              onChange={setB_plate}
              unit="mm"
              min={0}
              step={10}
            />
            <InputField
              label={<>Plate Depth (<MathJax dynamic inline>{"\\(N\\)"}</MathJax>)</>}
              value={N_plate}
              onChange={setN_plate}
              unit="mm"
              min={0}
              step={10}
            />
          </div>

          <div className="input-group">
            <h3>Concrete Pedestal</h3>
            <InputField
              label={<>Pedestal Width (<MathJax dynamic inline>{"\\(B_{conc}\\)"}</MathJax>)</>}
              value={B_conc}
              onChange={setB_conc}
              unit="mm"
              min={0}
              step={50}
            />
            <InputField
              label={<>Pedestal Depth (<MathJax dynamic inline>{"\\(N_{conc}\\)"}</MathJax>)</>}
              value={N_conc}
              onChange={setN_conc}
              unit="mm"
              min={0}
              step={50}
            />
            <InputField
              label={<>Grout Thickness (<MathJax dynamic inline>{"\\(t_{grout}\\)"}</MathJax>)</>}
              value={grout}
              onChange={setGrout}
              unit="mm"
              min={0}
              step={5}
            />
            <InputField
              label="Minimum Overhang"
              value={overhang}
              onChange={setOverhang}
              unit="mm"
              min={50}
              step={10}
            />
          </div>
        </div>

        <div className="design-criteria full-width">
          <h3>Design Criteria</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <MathJax dynamic inline>{"\\(f_{p(max)} = \\phi_c \\cdot \\alpha_1 \\cdot f'_c \\cdot \\sqrt{A_2/A_1} \\leq 2\\phi_c \\alpha_1 f'_c\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax dynamic inline>{"\\(t_{bp} = \\sqrt{\\frac{2 \\cdot f_p \\cdot \\ell^2}{\\phi \\cdot F_y}}\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">φ_c = 0.65, α₁ = 0.85, φ = 0.9. Cantilever method per CISC / AISC DG1 adapted to CSA.</p>
        </div>
      </section>

      {/* Result Overview */}
      {result && (
        <section className="results-panel">
          <div className="results-header">
            <h2>Design Result</h2>
            <span className={`results-count ${getStatusColor(result.status)}`}>
              {result.status === 'converged' ? 'Converged' : result.status === 'eccentric_tension' ? 'Tension governs — anchors required' : 'Did not converge'}
              {result.status === 'converged' && ` in ${result.iterations} iteration${result.iterations !== 1 ? 's' : ''}`}
            </span>
          </div>

          {result.status === 'converged' && (
            <div className="results-grid">
              <div className={`result-card ${result.isAdequate ? 'optimal' : ''}`}>
                {result.isAdequate && <div className="optimal-badge">Adequate</div>}
                <div className="section-header">
                  <h3>{result.B} × {result.N} × {result.t_bp}</h3>
                  <span className="mass">B × N × t (mm)</span>
                </div>
                <div className="section-properties">
                  <div className="property">
                    <span className="label"><MathJax dynamic inline>{"\\(A_1\\)"}</MathJax></span>
                    <span className="value">{formatNumber(result.A1, 0)} mm²</span>
                  </div>
                  <div className="property">
                    <span className="label"><MathJax dynamic inline>{"\\(f_p\\)"}</MathJax></span>
                    <span className="value">{formatNumber(result.pp_max, 2)} MPa</span>
                  </div>
                  <div className="property">
                    <span className="label"><MathJax dynamic inline>{"\\(f_{p(r)}\\)"}</MathJax></span>
                    <span className="value">{formatNumber(result.phi_pp, 2)} MPa</span>
                  </div>
                  <div className="property">
                    <span className="label"><MathJax dynamic inline>{"\\(\\ell\\)"}</MathJax></span>
                    <span className="value">{formatNumber(result.lambda_cant, 1)} mm</span>
                  </div>
                </div>
                <div className="resistance-values">
                  <div className="resistance">
                    <div className="resistance-label">Bearing</div>
                    <div className="resistance-value">{formatNumber(result.bearingUtilization * 100, 1)}%</div>
                    <div className={`utilization-bar ${result.bearingUtilization <= 0.7 ? 'utilization-low' : result.bearingUtilization <= 0.9 ? 'utilization-medium' : 'utilization-high'}`}>
                      <div
                        className="utilization-fill"
                        style={{ width: `${Math.min(result.bearingUtilization * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.status === 'eccentric_tension' && (
            <div className="no-results">
              <p>The eccentricity exceeds N/2 — net uplift governs. Anchor rod design is required (not covered by this module).</p>
            </div>
          )}

          {result.status === 'not_converged' && (
            <div className="no-results">
              <p>The design did not converge within {result.iterations} iterations. Try increasing the plate or pedestal size, or reducing the applied loads.</p>
            </div>
          )}
        </section>
      )}

      {!result && (
        <section className="results-panel">
          <div className="results-header">
            <h2>Design Result</h2>
          </div>
          <div className="no-results">
            <p>Enter a factored axial compression load to design the baseplate.</p>
          </div>
        </section>
      )}

      {/* Detailed Calculations */}
      {result && result.status === 'converged' && selectedSection
        && Cf != null && Mx != null && My != null
        && B_plate != null && N_plate != null
        && B_conc != null && N_conc != null && grout != null && overhang != null && (
        <section className="calculations-panel">
          <BaseplateDesignSummary
            result={result}
            inputs={{
              columnType,
              d_col: parseFloat(selectedSection.D || '0'),
              b_f: parseFloat(selectedSection.B || '0'),
              t_f: parseFloat(columnType === 'HSS' ? (selectedSection.Tdes || selectedSection.T || '0') : (selectedSection.T || '0')),
              t_w: parseFloat(columnType === 'HSS' ? (selectedSection.Tdes || selectedSection.T || '0') : (selectedSection.W || '0')),
              A_col: parseFloat(selectedSection.A || '0'),
              Cf, Mx, My, Fy_bp, fc,
              B_plate, N_plate,
              B_conc, N_conc, grout, overhang,
            }}
            sectionDesignation={selectedSection.Dsg}
          />
        </section>
      )}
    </div>
  );
}
