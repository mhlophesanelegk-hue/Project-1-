import { useEffect, useState } from 'react';
import api, { setToken } from '../api';
import './AdminApps.css';

const AdminApps = () => {
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(12);
  const [durations, setDurations] = useState({});
  const [loadingIds, setLoadingIds] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Admin login required.');
      return;
    }

    setToken(token);
    load();
  }, []);

  const load = () => {
    api.get('/admin/applications')
      .then(res => setApps(res.data.applications))
      .catch(() => setMessage('Failed to load applications.'));
  };

  const action = async (id, verb) => {
    setLoadingIds(s => ({ ...s, [id]: true }));

    try {
      if (verb === 'approve') {
        await api.post(`/admin/applications/${id}/approve`, {
          duration: durations[id] ?? duration,
        });
      }

      if (verb === 'decline') {
        await api.post(`/admin/applications/${id}/decline`);
      }

      if (verb === 'delete') {
        const confirmed = window.confirm(
          'Delete this application? This cannot be undone.'
        );

        if (!confirmed) return;

        await api.delete(`/admin/applications/${id}`);
      }

      await load();

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        err.message ||
        'Action failed.'
      );
    } finally {
      setLoadingIds(s => ({ ...s, [id]: false }));
    }
  };

  const getStatusClass = (status) => {
    if (status === 'approved') return 'status approved';
    if (status === 'declined') return 'status declined';
    return 'status pending';
  };

  return (
    <section className="admin-page">

      <div className="admin-header">
        <p className="admin-header-tag">
          Es'hlahleni Social Club
        </p>
        <h1>Admin Panel</h1>
        <p>Applications & Memberships</p>
      </div>

      {message && (
        <p className="admin-message">{message}</p>
      )}

      <div className="membership-info">
        <p>
          Select membership duration per applicant before approving
        </p>
      </div>

      <div className="table-card">

        {apps.length === 0 ? (
          <div className="admin-empty">
            <p>No applications to review.</p>
          </div>
        ) : (

          <table>
            <thead>
              <tr>
                <th className="col-member">Member</th>
                <th className="col-status">Status</th>
                <th className="col-proof">Proof</th>
                <th className="col-membership">Membership</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>

                  <td>
                    <span className="user-name">
                      {a.User?.name}
                    </span>

                    <span className="user-email">
                      {a.User?.email}
                    </span>
                  </td>

                  <td>
                    <span className={getStatusClass(a.status)}>
                      {a.status}
                    </span>
                  </td>

                  <td>
                    {a.proofFile ? (
                      <a
                        className="proof-link"
                        href={`${API_URL}/uploads/${a.proofFile}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <span className="proof-none">—</span>
                    )}
                  </td>

                  <td>

                    <div className="membership-number">
                      {a.membershipNumber || '—'}
                    </div>

                    <div className="membership-duration">
                      <label>Duration</label>

                      <select
                        value={durations[a.id] ?? duration}
                        onChange={(e) =>
                          setDurations(prev => ({
                            ...prev,
                            [a.id]: Number(e.target.value),
                          }))
                        }
                        disabled={a.status === 'approved'}
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                      </select>
                    </div>

                    {a.expiryDate && (
                      <span className="expiry-date">
                        Expires{' '}
                        {new Date(a.expiryDate).toLocaleDateString()}
                      </span>
                    )}

                  </td>

                  <td>

                    <div className="actions">

                      <button
                        className="lux-action-btn btn-approve"
                        onClick={() => action(a.id, 'approve')}
                        disabled={loadingIds[a.id]}
                      >
                        {loadingIds[a.id]
                          ? 'Working…'
                          : 'Approve'}
                      </button>

                      <button
                        className="lux-action-btn btn-decline"
                        onClick={() => action(a.id, 'decline')}
                        disabled={loadingIds[a.id]}
                      >
                        {loadingIds[a.id]
                          ? 'Working…'
                          : 'Decline'}
                      </button>

                      <button
                        className="lux-action-btn btn-delete"
                        onClick={() => action(a.id, 'delete')}
                        disabled={loadingIds[a.id]}
                      >
                        {loadingIds[a.id]
                          ? 'Working…'
                          : 'Delete'}
                      </button>

                    </div>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        )}

      </div>

      <div className="admin-footer">
        <span className="brand">Es'hlahleni</span>
        <span className="panel-label">
          Admin · Private · Members Only
        </span>
      </div>

    </section>
  );
};

export default AdminApps;
