import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';

type DisciplineKey = 'steel' | 'concrete' | 'wood';
const DISCIPLINES: DisciplineKey[] = ['steel', 'concrete', 'wood'];

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const activeDiscipline = location.pathname.split('/')[1] as DisciplineKey | undefined;

  const [expanded, setExpanded] = useState<Record<DisciplineKey, boolean>>({
    steel: activeDiscipline === 'steel',
    concrete: activeDiscipline === 'concrete',
    wood: activeDiscipline === 'wood',
  });

  useEffect(() => {
    if (activeDiscipline && DISCIPLINES.includes(activeDiscipline)) {
      setExpanded(prev => ({ ...prev, [activeDiscipline]: true }));
    }
  }, [activeDiscipline]);

  const toggleDiscipline = (key: DisciplineKey) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="app-container">
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <nav className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <button
          className="sidebar-close"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="sidebar-header">
          <NavLink to="/" className="logo-link" onClick={closeMobile}>
            <div className="logo">
              <h1>Dino Calcs</h1>
              <span className="tagline">Structural Design</span>
            </div>
          </NavLink>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Steel Design */}
        <div className={`discipline-section ${activeDiscipline === 'steel' ? 'active-discipline' : ''}`}>
          <button
            className="discipline-header"
            onClick={() => toggleDiscipline('steel')}
            aria-expanded={expanded.steel}
          >
            <span className="discipline-icon steel-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h20M2 6v12h20V6M7 6V2M17 6V2M7 18v4M17 18v4" />
              </svg>
            </span>
            <span className="discipline-name">Steel Design</span>
            <span className="discipline-code">S16-19</span>
            <svg className={`chevron ${expanded.steel ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded.steel && (
            <div className="discipline-nav">
              <NavLink to="/steel" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                <li>
                  <span className="nav-icon">◉</span>
                  Overview
                </li>
              </NavLink>

              <div className="nav-section">
                <h3>Beam Design</h3>
                <ul>
                  <NavLink to="/steel/beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊢</span>W-Sections</li>
                  </NavLink>
                  <NavLink to="/steel/channel-beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊏</span>C-Channels</li>
                  </NavLink>
                  <NavLink to="/steel/s-beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⌶</span>S-Sections</li>
                  </NavLink>
                  <NavLink to="/steel/angle-beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">∠</span>L-Angles</li>
                  </NavLink>
                </ul>
              </div>

              <div className="nav-section">
                <h3>Capacity Checks</h3>
                <ul>
                  <NavLink to="/steel/section-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊠</span>W-Sections</li>
                  </NavLink>
                  <NavLink to="/steel/channel-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊏</span>C-Channels</li>
                  </NavLink>
                  <NavLink to="/steel/s-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⌶</span>S-Sections</li>
                  </NavLink>
                  <NavLink to="/steel/angle-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">∠</span>L-Angles</li>
                  </NavLink>
                </ul>
              </div>

              <div className="nav-section">
                <h3>Column Design</h3>
                <ul>
                  <NavLink to="/steel/column-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊡</span>W-Sections</li>
                  </NavLink>
                </ul>
              </div>

              <div className="nav-section">
                <h3>Baseplate Design</h3>
                <ul>
                  <NavLink to="/steel/baseplate-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">▭</span>W &amp; HSS Sections</li>
                  </NavLink>
                </ul>
              </div>

              <div className="nav-section">
                <h3>Reference</h3>
                <ul>
                  <NavLink to="/steel/section-browser" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">▤</span>Section Browser</li>
                  </NavLink>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Concrete Design */}
        <div className={`discipline-section ${activeDiscipline === 'concrete' ? 'active-discipline' : ''}`}>
          <button
            className="discipline-header"
            onClick={() => toggleDiscipline('concrete')}
            aria-expanded={expanded.concrete}
          >
            <span className="discipline-icon concrete-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </span>
            <span className="discipline-name">Concrete Design</span>
            <span className="discipline-code">A23.3</span>
            <svg className={`chevron ${expanded.concrete ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded.concrete && (
            <div className="discipline-nav">
              <NavLink to="/concrete" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                <li>
                  <span className="nav-icon">◉</span>
                  Overview
                </li>
              </NavLink>
              <div className="nav-section">
                <h3>Beam Design</h3>
                <ul>
                  <NavLink to="/concrete/beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊢</span>Rectangular Beam</li>
                  </NavLink>
                </ul>
              </div>
              <div className="nav-section">
                <h3>Slab Design</h3>
                <ul>
                  <NavLink to="/concrete/slab-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">▥</span>One-Way Slab</li>
                  </NavLink>
                </ul>
                <ul className="disabled">
                  <li className="coming-soon-item">
                    <span className="nav-icon">⊡</span>
                    Column Design
                    <span className="coming-soon-badge">Soon</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wood Design */}
        <div className={`discipline-section ${activeDiscipline === 'wood' ? 'active-discipline' : ''}`}>
          <button
            className="discipline-header"
            onClick={() => toggleDiscipline('wood')}
            aria-expanded={expanded.wood}
          >
            <span className="discipline-icon wood-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L7 7h3v6H7l5 5 5-5h-3V7h3L12 2z" />
                <line x1="7" y1="21" x2="17" y2="21" />
                <line x1="12" y1="18" x2="12" y2="21" />
              </svg>
            </span>
            <span className="discipline-name">Wood Design</span>
            <span className="discipline-code">O86</span>
            <svg className={`chevron ${expanded.wood ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded.wood && (
            <div className="discipline-nav">
              <NavLink to="/wood" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                <li>
                  <span className="nav-icon">◉</span>
                  Overview
                </li>
              </NavLink>
              <div className="nav-section">
                <h3>Flexure &amp; shear</h3>
                <ul>
                  <NavLink to="/wood/joist-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊢</span>Joist design</li>
                  </NavLink>
                  <NavLink to="/wood/built-up-beam" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">≡</span>Built-up beam</li>
                  </NavLink>
                  <NavLink to="/wood/sawn-timber-beam" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">▭</span>Sawn timber beam</li>
                  </NavLink>
                  <NavLink to="/wood/biaxial-bending" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobile}>
                    <li><span className="nav-icon">⊞</span>Biaxial bending</li>
                  </NavLink>
                </ul>
                <ul className="disabled">
                  <li className="coming-soon-item">
                    <span className="nav-icon">⊡</span>
                    Column design
                    <span className="coming-soon-badge">Soon</span>
                  </li>
                  <li className="coming-soon-item">
                    <span className="nav-icon">⊞</span>
                    Connections
                    <span className="coming-soon-badge">Soon</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <p>Canadian Standards</p>
          <div className="footer-codes">
            <span className="code-tag steel-tag">CSA S16-19</span>
            <span className="code-tag concrete-tag">CSA A23.3</span>
            <span className="code-tag wood-tag">CSA O86</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
