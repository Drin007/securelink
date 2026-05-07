import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <Link to="/" className="nav-logo">
        <span className="nav-logo__icon">🛡️</span>
        <span className="nav-logo__text">SafeWeb<span className="nav-logo__accent">Scanner</span></span>
      </Link>

      <div className="nav-links">
        <Link to="/" className={`nav-link${isActive('/') ? ' nav-link--active' : ''}`}>Home</Link>

        {isLoggedIn && <>
          <Link to="/my-scans"  className={`nav-link${isActive('/my-scans')  ? ' nav-link--active' : ''}`}>My Scans</Link>
          <Link to="/reports"   className={`nav-link${isActive('/reports')   ? ' nav-link--active' : ''}`}>Reports</Link>
          <Link to="/dashboard" className={`nav-link${isActive('/dashboard') ? ' nav-link--active' : ''}`}>Dashboard</Link>
        </>}

        {!isLoggedIn && <>
          <Link to="/login"  className={`nav-link${isActive('/login')  ? ' nav-link--active' : ''}`}>Login</Link>
          <Link to="/signup" className="btn btn-primary nav-cta">Get Started</Link>
        </>}

        {isLoggedIn && (
          <button onClick={handleLogout} className="btn btn-ghost nav-logout">Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
