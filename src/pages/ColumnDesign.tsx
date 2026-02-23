import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { InputField } from '../components/InputField';
import { ColumnResultCard } from '../components/ColumnResultCard';
import { ColumnDesignSummary } from '../components/ColumnDesignSummary';
import { CustomDropdown } from '../components/CustomDropdown';
import { findOptimalColumnSection } from '../utils/steelDesign';
import type { WSection, SteelGrade, ColumnDesignResult, BucklingAxis, SectionFilters } from '../types/steel';
import wSections from '../assets/W_Section.json';

export function ColumnDesign() {
  const [factoredAxialLoad, setFactoredAxialLoad] = useState<number>(1500);
  const [effectiveLengthFactor, setEffectiveLengthFactor] = useState<number>(1.0);
  const [unbracedLength, setUnbracedLength] = useState<number>(4000);
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('350W');
  const [bucklingAxis, setBucklingAxis] = useState<BucklingAxis>('weak');
  const [selectedResult, setSelectedResult] = useState<ColumnDesignResult | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  // Section dimension filters
  const [showFilters, setShowFilters] = useState(false);
  const [minDepth, setMinDepth] = useState<number | undefined>(undefined);
  const [minFlangeWidth, setMinFlangeWidth] = useState<number | undefined>(undefined);
  const [minFlangeThickness, setMinFlangeThickness] = useState<number | undefined>(undefined);
  const [minWebThickness, setMinWebThickness] = useState<number | undefined>(undefined);

  const sectionFilters: SectionFilters | undefined = useMemo(() => {
    if (!showFilters) return undefined;

    const filters: SectionFilters = {};
    if (minDepth !== undefined && minDepth > 0) filters.minDepth = minDepth;
    if (minFlangeWidth !== undefined && minFlangeWidth > 0) filters.minFlangeWidth = minFlangeWidth;
    if (minFlangeThickness !== undefined && minFlangeThickness > 0) filters.minFlangeThickness = minFlangeThickness;
    if (minWebThickness !== undefined && minWebThickness > 0) filters.minWebThickness = minWebThickness;

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [showFilters, minDepth, minFlangeWidth, minFlangeThickness, minWebThickness]);

  const activeFilterCount = sectionFilters ? Object.keys(sectionFilters).length : 0;

  const results = useMemo(() => {
    if (factoredAxialLoad <= 0) return [];

    return findOptimalColumnSection(
      wSections as WSection[],
      {
        factoredAxialLoad,
        effectiveLengthFactor,
        unbracedLength,
        steelGrade,
        bucklingAxis,
        sectionFilters,
      }
    );
  }, [factoredAxialLoad, effectiveLengthFactor, unbracedLength, steelGrade, bucklingAxis, sectionFilters]);

  const displayedResults = showAllResults ? results : results.slice(0, 6);
  const optimalResult = results[0] || null;

  return (
    <div className="beam-design-page">
      <header className="page-header">
        <h1>W-Section Column Design</h1>
        <p>Select the most economical W-section column based on factored axial load per CSA S16-19</p>
      </header>

      <section className="input-panel">
        <h2>Design Inputs</h2>

        <div className="input-groups-container">
          <div className="input-group">
            <h3>Factored Load</h3>
            <InputField
              label="Factored Axial Load (Cf)"
              value={factoredAxialLoad}
              onChange={setFactoredAxialLoad}
              unit="kN"
              min={0}
              step={50}
            />
          </div>

          <div className="input-group">
            <h3>Column Geometry</h3>
            <InputField
              label="Unbraced Length (L)"
              value={unbracedLength}
              onChange={setUnbracedLength}
              unit="mm"
              min={0}
              step={100}
            />
            <CustomDropdown
              label="Effective Length Factor (K)"
              options={[
                { id: '0.65', label: 'K = 0.65', sublabel: 'Fixed–Fixed (rotation & translation)' },
                { id: '0.80', label: 'K = 0.80', sublabel: 'Fixed–Pinned (practical)' },
                { id: '1.0', label: 'K = 1.0', sublabel: 'Pinned–Pinned' },
                { id: '1.2', label: 'K = 1.2', sublabel: 'Fixed–Free (partial sway)' },
                { id: '2.0', label: 'K = 2.0', sublabel: 'Fixed–Free (cantilever)' },
              ]}
              value={String(effectiveLengthFactor)}
              onChange={(v) => setEffectiveLengthFactor(Number(v))}
            />
            <CustomDropdown
              label="Buckling Axis"
              options={[
                { id: 'weak', label: 'Weak Axis (y-y)', sublabel: 'Typically governs for W-sections' },
                { id: 'strong', label: 'Strong Axis (x-x)', sublabel: 'When braced about weak axis' },
              ]}
              value={bucklingAxis}
              onChange={(v) => setBucklingAxis(v as BucklingAxis)}
            />
          </div>

          <div className="input-group">
            <h3>Material</h3>
            <CustomDropdown
              label="Steel Grade"
              options={[
                { id: '300W', label: 'CSA G40.21 300W', sublabel: 'Fy = 300 MPa' },
                { id: '350W', label: 'CSA G40.21 350W', sublabel: 'Fy = 350 MPa' },
                { id: '345W', label: 'ASTM A992', sublabel: 'Fy = 345 MPa' },
              ]}
              value={steelGrade}
              onChange={(v) => setSteelGrade(v as SteelGrade)}
            />
          </div>
        </div>

        <div className="design-criteria full-width">
          <h3>Design Criteria</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <MathJax inline>{"\\(C_r = \\frac{\\phi F_y A_g}{(1 + \\lambda^{2n})^{1/n}}\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">where</span>
              <MathJax inline>{"\\(\\lambda = \\sqrt{F_y / F_e}\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <MathJax inline>{"\\(F_e = \\frac{\\pi^2 E}{(KL/r)^2}\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">φ = 0.9, n = 1.34. Sections up to Class 3 permitted for compression members.</p>
        </div>

        {/* Section Dimension Filters */}
        <div className="filters-section">
          <button
            className={`filters-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Section Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount} active</span>
            )}
            <span className={`toggle-icon ${showFilters ? 'open' : ''}`}>▼</span>
          </button>

          {showFilters && (
            <div className="filters-content">
              <p className="filters-note">Set minimum values to restrict section selection. Leave empty to ignore.</p>
              <div className="filters-grid">
                <div className="filter-field">
                  <label>Min. Depth (d)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minDepth ?? ''}
                      onChange={(e) => setMinDepth(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={10}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Flange Width (b)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minFlangeWidth ?? ''}
                      onChange={(e) => setMinFlangeWidth(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={5}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Flange Thickness (t)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minFlangeThickness ?? ''}
                      onChange={(e) => setMinFlangeThickness(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={1}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Web Thickness (w)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minWebThickness ?? ''}
                      onChange={(e) => setMinWebThickness(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={1}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setMinDepth(undefined);
                    setMinFlangeWidth(undefined);
                    setMinFlangeThickness(undefined);
                    setMinWebThickness(undefined);
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Design Calculations */}
      {(selectedResult || optimalResult) && (
        <section className="calculations-panel">
          <ColumnDesignSummary
            result={selectedResult || optimalResult!}
            factoredAxialLoad={factoredAxialLoad}
            steelGrade={steelGrade}
            bucklingAxis={bucklingAxis}
            effectiveLengthFactor={effectiveLengthFactor}
          />
        </section>
      )}

      {/* Suitable Sections */}
      <section className="results-panel">
        <div className="results-header">
          <h2>Suitable Sections</h2>
          <span className="results-count">{results.length} sections found</span>
        </div>

        {results.length === 0 ? (
          <div className="no-results">
            <p>Enter a factored axial load to find suitable column sections.</p>
          </div>
        ) : (
          <>
            <div className="results-grid">
              {displayedResults.map((result, index) => (
                <ColumnResultCard
                  key={result.section.Dsg}
                  result={result}
                  rank={index + 1}
                  isSelected={selectedResult?.section.Dsg === result.section.Dsg}
                  onSelect={() => setSelectedResult(result)}
                  steelGrade={steelGrade}
                  bucklingAxis={bucklingAxis}
                />
              ))}
            </div>

            {results.length > 6 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllResults(!showAllResults)}
              >
                {showAllResults ? 'Show Less' : `Show All ${results.length} Sections`}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
