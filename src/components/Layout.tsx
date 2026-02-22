import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <button
          className="sidebar-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="sidebar-header">
          <div className="logo">
            <h1>Dino Calcs</h1>
            <span className="tagline">Structural Analysis</span>
          </div>
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

        <div className="nav-section">
          <h3>Beam Design</h3>
          <ul>
            <NavLink to="/steel/beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⊢</span>
                W-Sections
              </li>
            </NavLink>
            <NavLink to="/steel/channel-beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⊏</span>
                C-Channels
              </li>
            </NavLink>
            <NavLink to="/steel/s-beam-design" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⌶</span>
                S-Sections
              </li>
            </NavLink>
          </ul>
        </div>

        <div className="nav-section">
          <h3>Capacity Checks</h3>
          <ul>
            <NavLink to="/steel/section-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⊠</span>
                W-Sections
              </li>
            </NavLink>
            <NavLink to="/steel/channel-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⊏</span>
                C-Channels
              </li>
            </NavLink>
            <NavLink to="/steel/s-capacity" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">⌶</span>
                S-Sections
              </li>
            </NavLink>
          </ul>
        </div>

        <div className="nav-section">
          <h3>Reference</h3>
          <ul>
            <NavLink to="/steel/section-browser" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              <li>
                <span className="nav-icon">▤</span>
                Section Browser
              </li>
            </NavLink>
          </ul>
        </div>

        <div className="nav-section">
          <h3>Coming Soon</h3>
          <ul className="disabled">
            <li>
              <span className="nav-icon">⊡</span>
              Column Design
            </li>
            <li>
              <span className="nav-icon">⊞</span>
              Connections
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <p>CISC Standards</p>
          <p className="version">CSA S16-19</p>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
