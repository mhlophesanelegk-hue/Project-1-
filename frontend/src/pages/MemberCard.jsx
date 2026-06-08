import { useState, useEffect } from 'react';
import api, { getAuth, setToken } from '../api';
import './MemberCard.css';

const MemberCard = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage]           = useState('');
  const [messageType, setMessageType]   = useState('');

  useEffect(() => {
    const { token } = getAuth();
    if (!token) {
      setMessageType('error');
      setMessage('Please login to view your membership card.');
      return;
    }
    setToken(token);

    api.get('/applications/mine')
      .then((res) => setApplications(res.data.applications || []))
      .catch(() => {
        setMessageType('error');
        setMessage('Unable to load applications.');
      });
  }, []);

  const approvedApps = applications.filter(
    (app) => app.status === 'approved' && app.cardPath
  );

  return (
    <section className="member-card-page">

      {/* ── PAGE HEADER ── */}
      <div className="member-card-header">
        <div>
          <span className="member-card-eyebrow">Exclusive Member Access</span>
          <h1>
            Membership<br />
            <em>Card.</em>
          </h1>
        </div>
        <p>
          Your verified Es'hlahleni membership credentials
          for access, identity, and event entry.
        </p>
      </div>

      {/* ── MESSAGE ── */}
      {message && (
        <p className={`member-card-message ${messageType}`}>{message}</p>
      )}

      {/* ── CARDS or EMPTY ── */}
      {approvedApps.length > 0 ? (
        <>
          <div className="member-card-count-bar">
            <span>
              {approvedApps.length} active membership card{approvedApps.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="member-card-list">
            {approvedApps.map((app) => (
              <article key={app.id} className="membership-card">

                {/* Top-right chip */}
                <div className="membership-chip">Member</div>

                {/* Left: badge + title + tagline */}
                <div className="membership-card-left">
                  <div className="membership-badge">Es'hlahleni Social Club</div>
                  <h2 className="membership-title">
                    Elite Member <em>Access.</em>
                  </h2>
                  <p className="membership-tagline">
                    Premium access to private events and member-only experiences.
                  </p>
                </div>

                {/* Info row */}
                <div className="membership-info-grid">
                  <div className="membership-info-item">
                    <span>Membership Number</span>
                    <strong>{app.membershipNumber}</strong>
                  </div>
                  <div className="membership-info-item">
                    <span>Expiry Date</span>
                    <strong>
                      {new Date(app.expiryDate).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div className="membership-info-item">
                    <span>Member Since</span>
                    <strong>
                      {new Date(app.approvedAt).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                </div>

                {/* Download */}
                <a
                  className="membership-button"
                  href={`http://localhost:5000/uploads/${app.cardPath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF Card
                </a>

              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="member-card-empty">
          <span className="member-card-empty-num">0</span>
          <h3>No active cards <em>yet.</em></h3>
          <p>
            Once your application is approved, your membership card will appear here.
          </p>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="member-card-footer">
        <span className="brand">Es'hlahleni</span>
        <span className="tagline">Private · Social · Good Vibes Only</span>
        <span className="age-badge">18+ Only</span>
      </div>

    </section>
  );
};

export default MemberCard;
