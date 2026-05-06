import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';


function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className = "navbar" >
     <div className="nav-logo">🛡️ SafeWeb Scanner</div>
     <div className = "nav-links">
      <Link to="/">Home</Link> |{' '}
      {isLoggedIn && <Link to="/my-scans">My Scans</Link>} |{' '}
      {isLoggedIn && <Link to="/reports">Reports</Link>} |{' '}
      {!isLoggedIn && <Link to="/login">Login</Link>} |{' '}
      {!isLoggedIn && <Link to="/signup">Signup</Link>} |{' '}
      {isLoggedIn && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
      
    </nav>
  );
}

export default Navbar;


