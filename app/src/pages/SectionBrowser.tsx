import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { WSection } from '../types/steel';
import wSections from '../data/W_Section.json';

export function SectionBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<WSection | null>(null);
  const [depthFilter, setDepthFilter] = useState<string>('all');

  const sections = wSections as WSection[];

  // Get unique nominal depths for filtering
  const nominalDepths = useMemo(() => {
    const depths = [...new Set(sections.map(s => s.Dnom))];
    return depths.sort((a, b) => parseInt(b) - parseInt(a));
  }, [sections]);

  // Filter sections based on search and depth filter
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.Dsg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.Ds_i.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepth = depthFilter === 'all' || section.Dnom === depthFilter;
      return matchesSearch && matchesDepth;
    });
  }, [sections, searchTerm, depthFilter]);

  // Group sections by nominal depth for display
  const groupedSections = useMemo(() => {
    const groups: Record<string, WSection[]> = {};
    filteredSections.forEach(section => {
      const depth = section.Dnom;
      if (!groups[depth]) groups[depth] = [];
      groups[depth].push(section);
    });
    return groups;
  }, [filteredSections]);

  const sortedDepths = Object.keys(groupedSections).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="section-browser-page">
      <header className="page-header">
        <h1>W-Section Browser</h1>
        <p>Browse and view detailed properties of all W-sections from the CISC Handbook</p>
      </header>

      <div className="browser-layout">
        <section className="section-list-panel">
          <div className="search-controls">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search sections (e.g., W310x97, W12x65)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-wrapper">
              <label>Nominal Depth</label>
              <select
                value={depthFilter}
                onChange={(e) => setDepthFilter(e.target.value)}
              >
                <option value="all">All Depths</option>
                {nominalDepths.map(depth => (
                  <option key={depth} value={depth}>W{depth}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sections-count">
            {filteredSections.length} sections
          </div>

          <div className="sections-list">
            {sortedDepths.map(depth => (
              <div key={depth} className="depth-group">
                <h3 className="depth-header">W{depth} Series</h3>
                <div className="sections-grid">
                  {groupedSections[depth].map(section => (
                    <button
                      key={section.Dsg}
                      className={`section-btn ${selectedSection?.Dsg === section.Dsg ? 'selected' : ''}`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <span className="section-name">{section.Dsg}</span>
                      <span className="section-mass">{section.Mass} kg/m</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-details-panel">
          {selectedSection ? (
            <SectionDetails section={selectedSection} />
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">⊢</div>
              <p>Select a section from the list to view its properties</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionDetails({ section }: { section: WSection }) {
  return (
    <div className="section-details">
      <div className="section-title">
        <h2>{section.Dsg}</h2>
        <span className="imperial-name">{section.Ds_i}</span>
      </div>

      <div className="properties-grid">
        <PropertySection title="Basic Information">
          <PropertyRow label="Designation" value={section.Dsg} />
          <PropertyRow label="Imperial Designation" value={section.Ds_i} />
          <PropertyRow label="Mass" value={`${section.Mass} kg/m`} />
          <PropertyRow label="Imperial Weight" value={`${section.Wt_i} lb/ft`} />
          <PropertyRow label="Cross-sectional Area (A)" value={`${section.A} mm²`} />
          <PropertyRow label="Surface Area" value={`${section.SA} m²/m`} />
        </PropertySection>

        <PropertySection title="Dimensions">
          <PropertyRow label="Depth (d)" value={`${section.D} mm`} />
          <PropertyRow label="Nominal Depth" value={`${section.Dnom} mm`} />
          <PropertyRow label="Flange Width (b)" value={`${section.B} mm`} />
          <PropertyRow label="Flange Thickness (t)" value={`${section.T} mm`} />
          <PropertyRow label="Web Thickness (w)" value={`${section.W} mm`} />
          <PropertyRow label="k dimension" value={`${section.K} mm`} />
          <PropertyRow label="k₁ dimension" value={`${section.K1} mm`} />
        </PropertySection>

        <PropertySection title="Slenderness Ratios">
          <PropertyRow
            label={<MathJax inline>{"\\(b/t\\)"}</MathJax>}
            value={section.BT}
            description="Flange slenderness"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(h/w\\)"}</MathJax>}
            value={section.HW}
            description="Web slenderness"
          />
        </PropertySection>

        <PropertySection title="Strong Axis (x-x) Properties">
          <PropertyRow
            label={<MathJax inline>{"\\(I_x\\)"}</MathJax>}
            value={`${section.Ix} ×10⁶ mm⁴`}
            description="Moment of inertia"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(S_x\\)"}</MathJax>}
            value={`${section.Sx} ×10³ mm³`}
            description="Elastic section modulus"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(Z_x\\)"}</MathJax>}
            value={`${section.Zx} ×10³ mm³`}
            description="Plastic section modulus"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(r_x\\)"}</MathJax>}
            value={`${section.Rx} mm`}
            description="Radius of gyration"
          />
        </PropertySection>

        <PropertySection title="Weak Axis (y-y) Properties">
          <PropertyRow
            label={<MathJax inline>{"\\(I_y\\)"}</MathJax>}
            value={`${section.Iy} ×10⁶ mm⁴`}
            description="Moment of inertia"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(S_y\\)"}</MathJax>}
            value={`${section.Sy} ×10³ mm³`}
            description="Elastic section modulus"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(Z_y\\)"}</MathJax>}
            value={`${section.Zy} ×10³ mm³`}
            description="Plastic section modulus"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(r_y\\)"}</MathJax>}
            value={`${section.Ry} mm`}
            description="Radius of gyration"
          />
        </PropertySection>

        <PropertySection title="Torsional Properties">
          <PropertyRow
            label={<MathJax inline>{"\\(J\\)"}</MathJax>}
            value={`${section.J} ×10³ mm⁴`}
            description="Torsional constant"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(C_w\\)"}</MathJax>}
            value={`${section.Cw} ×10⁹ mm⁶`}
            description="Warping constant"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(W_n\\)"}</MathJax>}
            value={`${section.Wn}`}
            description="Normalized warping function"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(S_w\\)"}</MathJax>}
            value={`${section.Sw}`}
            description="Warping statical moment"
          />
        </PropertySection>

        <PropertySection title="Shear Properties">
          <PropertyRow
            label={<MathJax inline>{"\\(Q_f\\)"}</MathJax>}
            value={`${section.Qf} ×10³ mm³`}
            description="First moment of flange"
          />
          <PropertyRow
            label={<MathJax inline>{"\\(Q_w\\)"}</MathJax>}
            value={`${section.Qw} ×10³ mm³`}
            description="First moment of half-section"
          />
        </PropertySection>
      </div>
    </div>
  );
}

function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="property-section">
      <h3>{title}</h3>
      <div className="property-list">
        {children}
      </div>
    </div>
  );
}

function PropertyRow({
  label,
  value,
  description
}: {
  label: React.ReactNode;
  value: string;
  description?: string;
}) {
  return (
    <div className="property-row">
      <div className="property-label">
        {label}
        {description && <span className="property-description">{description}</span>}
      </div>
      <div className="property-value">{value}</div>
    </div>
  );
}
