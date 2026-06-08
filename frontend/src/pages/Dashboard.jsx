import { useEffect, useState } from 'react';
import api, { getAuth, setToken } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [message, setMessage]           = useState('');
  const [messageType, setMessageType]   = useState('');
  const [userName, setUserName]         = useState('');

  useEffect(() => {
    const { token, user } = getAuth();

    if (!token) {
      setMessageType('error');
      setMessage('Please login first.');
      return;
    }

    setToken(token);
    setUserName(user?.name || 'Member');

    api.get('/applications/mine')
      .then((res) => setApplications(res.data.applications))
      .catch(() => {
        setMessageType('error');
        setMessage('Unable to load your applications.');
      });
  }, []);

  const statusClass = (status) => {
    if (status === 'approved') return 'status approved';
    if (status === 'declined') return 'status declined';
    return 'status pending';
  };

  const total    = applications.length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const pending  = applications.filter(a => a.status === 'pending').length;

  return (
    <section className="dashboard-page">

      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <span className="dash-eyebrow">Membership Portal</span>
          <h1>
            Member<br />
            <em>Dashboard.</em>
          </h1>
        </div>
        <div className="dashboard-header-right">
          <span className="dash-welcome">Welcome back</span>
          <span className="dash-name">{userName}</span>
        </div>
      </div>

      {/* ── MESSAGE ── */}
      {message && (
        <p className={`dash-message ${messageType}`}>{message}</p>
      )}

      {/* ── STATS ── */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat-num">{total}</span>
          <span className="dash-stat-label">Total Applications</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-num">{approved}</span>
          <span className="dash-stat-label">Approved</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-num">{pending}</span>
          <span className="dash-stat-label">Pending</span>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="dash-table-section">

        <div className="dash-table-header">
          <h2>Your <em>Applications</em></h2>
          {total > 0 && (
            <span className="dash-table-count">
              {total} {total === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>

        <div className="dash-table-wrap">
          {applications.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-num">0</span>
              <h3>No applications <em>yet.</em></h3>
              <p>Visit the Apply page to submit your membership request.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Membership No.</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span className={statusClass(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td>{app.membershipNumber || '—'}</td>
                    <td>
                      {app.expiryDate
                        ? new Date(app.expiryDate).toLocaleDateString('en-ZA', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div className="dash-footer">
        <span className="brand">Es'hlahleni</span>
        <span className="tagline">Private · Social · Good Vibes Only</span>
        <span className="age-badge">18+ Only</span>
      </div>

    </section>
  );
};

export default Dashboard;
