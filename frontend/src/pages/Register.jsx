import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { saveAuth } from '../api';
import './Register.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/register', form);
      const { token, user } = response.data;
      saveAuth(user, token);

      window.dispatchEvent(new Event('auth-change'));

      setMessageType('success');
      setMessage('Account created. Redirecting...');

      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-page">

      {/* ── LEFT PANEL ── */}
      <div className="register-panel-left">
        <div className="reg-left-top">
          <p className="lux-tag">Private Members Club</p>
        </div>

        <div className="reg-left-mid">
          <h2>
            Join the<br />
            <em>inner circle.</em>
          </h2>
          <p>
            Es'hlahleni is built for those who value real
            connection, curated experiences, and a verified
            community of like-minded individuals.
          </p>
        </div>

        <div className="reg-left-bottom">
          <div className="reg-pillar">
            <span className="reg-pillar-num">01</span>
            <span className="reg-pillar-text">Exclusive Access</span>
          </div>
          <div className="reg-pillar">
            <span className="reg-pillar-num">02</span>
            <span className="reg-pillar-text">Premium Events</span>
          </div>
          <div className="reg-pillar">
            <span className="reg-pillar-num">03</span>
            <span className="reg-pillar-text">Verified Community</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="register-panel-right">

        <div className="reg-form-header">
          <span className="reg-eyebrow">Membership Application</span>
          <h1>
            Create your<br />
            <em>account.</em>
          </h1>
          <p>
            Complete the form below to apply for membership.
            All accounts are reviewed before activation.
          </p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit}>
          <div className="reg-field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="reg-field">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="reg-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="reg-submit-row">
            <button
              type="submit"
              className="reg-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="reg-loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                'Apply Now'
              )}
            </button>

            <span className="reg-login-link">
              Already a member?{' '}
              <Link to="/login">Sign in</Link>
            </span>
          </div>
        </form>

        {message && (
          <p className={`reg-message ${messageType}`}>
            {message}
          </p>
        )}

        <div className="reg-form-footer">
          <span className="brand">Es'hlahleni</span>
          <span className="age-badge">18+ Only</span>
        </div>

      </div>
    </section>
  );
};

export default Register;
