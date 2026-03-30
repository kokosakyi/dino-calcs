import { Link } from 'react-router';

export function ConcreteHome() {
  return (
    <div className="discipline-home concrete-home">
      <div className="discipline-home-header">
        <div className="discipline-home-title">
          <h1>Concrete Design</h1>
          <span className="discipline-home-code">CSA A23.3</span>
        </div>
        <p>Reinforced concrete design tools per CSA A23.3 &mdash; Design of Concrete Structures</p>
      </div>

      <div className="tool-category">
        <h2>Available Tools</h2>
        <p className="category-desc">Flexure, shear, and crack control checks for beams and one-way slabs per CSA A23.3</p>
        <div className="tool-grid">
          <Link to="/concrete/beam-design" className="tool-card">
            <span className="tool-icon">⊢</span>
            <div className="tool-info">
              <h3>Rectangular Beam Design</h3>
              <p>Flexural and shear design with crack control checks</p>
            </div>
          </Link>
          <Link to="/concrete/slab-design" className="tool-card">
            <span className="tool-icon">▥</span>
            <div className="tool-info">
              <h3>One-Way Slab Design</h3>
              <p>Flexural design per 1 m strip with shear and crack control</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="coming-soon-section">
        <h2>Coming Soon</h2>
        <p>Additional concrete design tools are being developed:</p>

        <div className="planned-tools">
          <div className="planned-tool">
            <span className="planned-icon">⊤</span>
            <div>
              <h3>T-Beam Design</h3>
              <p>Flanged beam design with effective flange width calculations</p>
            </div>
          </div>
          <div className="planned-tool">
            <span className="planned-icon">⊡</span>
            <div>
              <h3>Column Design</h3>
              <p>Column interaction diagrams, slenderness effects, biaxial bending</p>
            </div>
          </div>
          <div className="planned-tool">
            <span className="planned-icon">⊞</span>
            <div>
              <h3>Development Lengths</h3>
              <p>Bar development, lap splice lengths, and hook geometry per A23.3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
