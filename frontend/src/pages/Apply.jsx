import { useState, useEffect } from 'react';
import api, { setToken } from '../api';
import './Apply.css';

// ── EDIT PRICES HERE ──────────────────────────────
const MEMBERSHIP_TIERS = [
  { id: 1, months: 1,  label: '1',  unit: 'Month',  price: 'R 000', featured: false },
  { id: 2, months: 3,  label: '3',  unit: 'Months', price: 'R 000', featured: false },
  { id: 3, months: 6,  label: '6',  unit: 'Months', price: 'R 000', featured: true  }, // featured = black card
  { id: 4, months: 12, label: '12', unit: 'Months', price: 'R 000', featured: false },
];
// ─────────────────────────────────────────────────

const Apply = () => {
  const [file, setFile]               = useState(null);
  const [message, setMessage]         = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!file) {
      setMessageType('error');
      setMessage('Please upload proof of payment.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('proof', file);

    try {
      await api.post('/applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessageType('success');
      setMessage('Application submitted successfully.');
      setFile(null);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="apply-page">

      {/* ── PAGE HEADER ── */}
      <div className="apply-header">
        <span className="apply-eyebrow">Membership Application</span>
        <h1>
          Choose your<br />
          <em>membership.</em>
        </h1>
        <p>
          Select a plan, complete your payment, then upload
          your proof of payment below to activate your membership.
        </p>
      </div>

      {/* ── PRICING TIERS ── */}
      <div className="apply-pricing">
        {MEMBERSHIP_TIERS.map((tier, i) => (
          <div
            key={tier.id}
            className={`pricing-card${tier.featured ? ' featured' : ''}`}
          >
            <span className="pricing-num">0{i + 1}</span>
            <div className="pricing-duration">{tier.label}</div>
            <span className="pricing-unit">{tier.unit}</span>
            <span className="pricing-price">{tier.price}</span>
            <span className="pricing-currency">ZAR · Incl. VAT</span>
            {tier.featured && (
              <span className="pricing-badge">Most Popular</span>
            )}
          </div>
        ))}
      </div>

      {/* ── BANK + FORM ── */}
      <div className="apply-body">

        {/* Bank Details */}
        <div className="apply-bank">
          <span className="apply-section-eyebrow">Payment Details</span>
          <h2>
            Capitec<br />
            <em>Bank Details.</em>
          </h2>

          <div className="bank-row">
            <span className="bank-label">Bank</span>
            <span className="bank-value">Capitec Bank</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Account Name</span>
            <span className="bank-value">Es'hlahleni Social Club</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Account Number</span>
            <span className="bank-value">1234567890</span>
          </div>
          <div className="bank-row">
            <span className="bank-label">Branch Code</span>
            <span className="bank-value">470010</span>
          </div>

          <p className="bank-note">
            Use your email address as the payment reference so we
            can match your proof of payment to your account.
          </p>
        </div>

        {/* Upload Form */}
        <div className="apply-form-panel">
          <span className="apply-section-eyebrow">Step 2 of 2</span>
          <h2>
            Upload proof<br />
            <em>of payment.</em>
          </h2>

          <form className="apply-form" onSubmit={handleSubmit}>
            <div className="apply-file-field">
              <label className="apply-file-label">
                Proof of Payment
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>

            <button
              type="submit"
              className="apply-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="apply-loading-dots">
                  <span /><span /><span />
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          {message && (
            <p className={`apply-message ${messageType}`}>
              {message}
            </p>
          )}
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div className="apply-footer">
        <span className="brand">Es'hlahleni</span>
        <span className="tagline">Private · Social · Good Vibes Only</span>
        <span className="age-badge">18+ Only</span>
      </div>

    </section>
  );
};

export default Apply;
