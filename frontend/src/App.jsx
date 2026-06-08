import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import MemberCard from './pages/MemberCard';
import AdminApps from './pages/AdminApps';

import { clearAuth, getAuth } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.user);

    const syncAuth = () => setUser(getAuth().user);
    window.addEventListener('auth-change', syncAuth);
    return () => window.removeEventListener('auth-change', syncAuth);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setMenuOpen(false);
    navigate('/login');
  };

  const ProtectedRoute = ({ children, adminOnly, userOnly }) => {
    if (!user) return <Navigate to="/login" replace />;

    if (adminOnly && user.role !== 'admin') {
      return (
        <section className="page">
          <p className="message">Admin access required to view this page.</p>
        </section>
      );
    }

    if (userOnly && user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }

    return children;
  };

  // Shared nav links for both desktop and mobile
  const NavLinks = ({ mobile }) => (
    <>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/contact">Contact</NavLink>

      {user ? (
        <>
          {user.role !== 'admin' && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/apply">Apply</NavLink>
              <NavLink to="/card">Card</NavLink>
            </>
          )}

          {user.role === 'admin' && (
            <NavLink to="/admin">Admin</NavLink>
          )}

          {mobile ? (
            <button className="nav-button-mobile" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </>
  );

  return (
    <div className="app-shell">

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="brand">Es'hlahleni Social Club</div>

        {/* Desktop nav */}
        <nav>
          <NavLinks mobile={false} />
        </nav>

        {/* Hamburger button (mobile only) */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <NavLinks mobile={true} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/apply"
            element={<ProtectedRoute userOnly><Apply /></ProtectedRoute>}
          />
          <Route
            path="/card"
            element={<ProtectedRoute><MemberCard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><AdminApps /></ProtectedRoute>}
          />
        </Routes>
      </main>

      {/* ── FOOTER ── */}
      <footer>
        <p>© 2026 Es'hlahleni Social Club</p>
      </footer>

    </div>
  );
}

export default App;
