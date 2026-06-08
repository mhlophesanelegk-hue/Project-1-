import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { saveAuth } from '../api';
import './Login.css';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      saveAuth(user, token);

      window.dispatchEvent(new Event('auth-change'));

      setMessageType('success');
      setMessage('Login successful. Redirecting...');

      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">

      {/* ── LEFT PANEL — form ── */}
      <div className="login-panel-left">

        <div className="login-form-header">
          <span className="login-eyebrow">Member Sign In</span>
          <h1>
            Welcome<br />
            <em>back.</em>
          </h1>
          <p>
            Sign in to access your membership, upcoming
            events, and the Es'hlahleni community.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <Link to="/forgot-password" className="login-forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="login-submit-row">
            <button
              type="submit"
              className="login-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <span className="login-register-link">
              Not a member?{' '}
              <Link to="/register">Apply now</Link>
            </span>
          </div>
        </form>

        {message && (
          <p className={`login-message ${messageType}`}>
            {message}
          </p>
        )}

        <div className="login-form-footer">
          <span className="brand">Es'hlahleni</span>
          <span className="age-badge">18+ Only</span>
        </div>

      </div>

      {/* ── RIGHT PANEL — editorial black ── */}
      <div className="login-panel-right">

        <div className="login-right-top">
          <p className="lux-tag">Private Members Club</p>
        </div>

        <div className="login-right-mid">
          <h2>
            Good to have<br />
            <em>you back.</em>
          </h2>
          <p>
            Your community, your events, your space.
            Es'hlahleni is always open for those who belong.
          </p>
        </div>

        <div className="login-right-bottom">
          <div className="login-stat-row">
            <span className="stat-label">Operating Hours</span>
            <span className="stat-value">07:00 – 00:00</span>
          </div>
          <div className="login-stat-row">
            <span className="stat-label">Membership</span>
            <span className="stat-value">By Invitation</span>
          </div>
          <div className="login-stat-row">
            <span className="stat-label">Community</span>
            <span className="stat-value">Verified Only</span>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Login;
