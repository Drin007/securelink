import { useEffect, useState } from 'react';
import API from "../utils/api";
import "../styles/MyScans.css";

const MyScans = () => {
  const [scans, setScans]   = useState([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await API.get("/api/scan/history");
        setScans(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        setError(err.response?.data?.message || err.message || 'Failed to load scan history');
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <main className="page">
      <div className="myscans__header">
        <p className="page-eyebrow">History</p>
        <h1 className="page-title">My Scans</h1>
      </div>

      {error && <p className="myscans__error">{error}</p>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p className="myscans__empty">Loading…</p>
        ) : scans.length === 0 ? (
          <p className="myscans__empty">No scans yet. Head to the home page to scan a URL.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>IP</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {scans.map(scan => (
                  <tr key={scan._id}>
                    <td className="myscans__url">{scan.url}</td>
                    <td className="text-muted myscans__ip">{scan.ip || '—'}</td>
                    <td>
                      <span className={`badge ${scan.status?.toLowerCase() === 'safe' ? 'badge-safe' : 'badge-danger'}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(scan.scannedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyScans;
