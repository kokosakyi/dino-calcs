import { Link } from 'react-router';

export function SteelHome() {
  return (
    <div className="discipline-home steel-home">
      <div className="discipline-home-header">
        <div className="discipline-home-title">
          <h1>Steel Design</h1>
          <span className="discipline-home-code">CSA S16-19</span>
        </div>
        <p>Design and verify structural steel members per CSA S16-19 using CISC section databases</p>
      </div>

      <div className="tool-category">
        <h2>Beam Design</h2>
        <p className="category-desc">Select economical sections for flexural members based on factored moment, shear, and deflection criteria</p>
        <div className="tool-grid">
          <Link to="/steel/beam-design" className="tool-card">
            <span className="tool-icon">⊢</span>
            <div className="tool-info">
              <h3>W-Sections</h3>
              <p>Wide-flange beam design with multi-mode input including NBC load combinations</p>
            </div>
          </Link>
          <Link to="/steel/channel-beam-design" className="tool-card">
            <span className="tool-icon">⊏</span>
            <div className="tool-info">
              <h3>C-Channels</h3>
              <p>Channel section beam design with lateral-torsional buckling checks</p>
            </div>
          </Link>
          <Link to="/steel/s-beam-design" className="tool-card">
            <span className="tool-icon">⌶</span>
            <div className="tool-info">
              <h3>S-Sections</h3>
              <p>Standard I-beam design for legacy and specialty applications</p>
            </div>
          </Link>
          <Link to="/steel/angle-beam-design" className="tool-card">
            <span className="tool-icon">∠</span>
            <div className="tool-info">
              <h3>L-Angles</h3>
              <p>Single angle beam design with biaxial bending about x and y axes</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="tool-category">
        <h2>Capacity Checks</h2>
        <p className="category-desc">Calculate moment, shear, tension, and compression resistance for a specific section</p>
        <div className="tool-grid">
          <Link to="/steel/section-capacity" className="tool-card">
            <span className="tool-icon">⊠</span>
            <div className="tool-info">
              <h3>W-Sections</h3>
              <p>Full capacity analysis: M<sub>r</sub>, V<sub>r</sub>, T<sub>r</sub>, C<sub>r</sub> with LTB and buckling</p>
            </div>
          </Link>
          <Link to="/steel/channel-capacity" className="tool-card">
            <span className="tool-icon">⊏</span>
            <div className="tool-info">
              <h3>C-Channels</h3>
              <p>Channel section capacity with section classification</p>
            </div>
          </Link>
          <Link to="/steel/s-capacity" className="tool-card">
            <span className="tool-icon">⌶</span>
            <div className="tool-info">
              <h3>S-Sections</h3>
              <p>Standard beam section capacity checks</p>
            </div>
          </Link>
          <Link to="/steel/angle-capacity" className="tool-card">
            <span className="tool-icon">∠</span>
            <div className="tool-info">
              <h3>L-Angles</h3>
              <p>Angle section biaxial moment, shear, and compression resistance</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="tool-category">
        <h2>Column Design</h2>
        <p className="category-desc">Select economical column sections based on factored axial load and effective length</p>
        <div className="tool-grid">
          <Link to="/steel/column-design" className="tool-card">
            <span className="tool-icon">⊡</span>
            <div className="tool-info">
              <h3>W-Sections</h3>
              <p>Column selection with buckling resistance about strong or weak axis</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="tool-category">
        <h2>Baseplate Design</h2>
        <p className="category-desc">Size steel baseplates and check concrete bearing for column bases</p>
        <div className="tool-grid">
          <Link to="/steel/baseplate-design" className="tool-card">
            <span className="tool-icon">▭</span>
            <div className="tool-info">
              <h3>W &amp; HSS Sections</h3>
              <p>Baseplate sizing with factored axial load, biaxial moment, and pedestal checks</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="tool-category">
        <h2>Reference</h2>
        <p className="category-desc">Browse section properties and databases from the CISC Handbook</p>
        <div className="tool-grid">
          <Link to="/steel/section-browser" className="tool-card">
            <span className="tool-icon">▤</span>
            <div className="tool-info">
              <h3>Section Browser</h3>
              <p>Browse detailed properties for W, C, S, L, HSS, and other section types</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
