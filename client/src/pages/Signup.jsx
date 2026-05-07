import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../utils/auth';
import '../styles/Auth.css';

function Signup() {
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://securelink-backend-ohtu.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        navigate('/');
      } else {
        setError(data.msg || 'Signup failed');
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
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__sub">Start scanning URLs for free</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field__label">Name</label>
            <input
              name="name"
              placeholder="Your name"
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary auth-submit">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
