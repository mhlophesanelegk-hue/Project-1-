import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      const resetUrl = response.data?.resetUrl || '';

      setMessageType('success');
      setMessage(response.data?.message || 'Password reset link has been sent to your email. Check your inbox.');
      setSubmitted(true);
      setEmail('');
      setResetUrl(resetUrl);

      if (!resetUrl) {
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resetUrl) return;

    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  return (
    <section className="forgot-password-page">
      <div className="forgot-password-card">
        <h1>Reset Your Password</h1>
        <p>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : null}

        {message && (
          <p className={`message ${messageType}`}>{message}</p>
        )}

        {resetUrl && (
          <div className="reset-preview">
            <p>Use this link to reset your password:</p>
            <div className="reset-preview-row">
              <a className="reset-link" href={resetUrl} target="_blank" rel="noreferrer">
                {resetUrl}
              </a>
              <button type="button" className="copy-reset-button" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        )}

        <div className="forgot-password-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login">Back to login</Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
