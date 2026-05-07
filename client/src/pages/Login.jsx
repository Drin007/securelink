import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../utils/auth';
import '../styles/Auth.css';

function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://securelink-backend-ohtu.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        navigate('/');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch {
      setError('Server error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-card card">
        <div className="auth-card__header">
          <span className="auth-card__icon">🛡️</span>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Sign in to your SafeWeb account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field__label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field__label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
