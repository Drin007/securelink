import { useEffect, useState } from "react";
import API from "../utils/api";
import "../styles/Dashboard.css";

const StatCard = ({ value, label, accent }) => (
  <div className="stat-card card" style={{ borderTop: `3px solid ${accent}` }}>
    <span className="stat-card__value" style={{ color: accent }}>{value}</span>
    <span className="stat-card__label">{label}</span>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, safe: 0, dangerous: 0, scans: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await API.get("/api/scan/history");
        const scans = res.data;
        const safe      = scans.filter(s => s.status?.toLowerCase() === "safe").length;
        const dangerous = scans.filter(s => s.status?.toLowerCase() !== "safe").length;
        setStats({ total: scans.length, safe, dangerous, scans: scans.slice(0, 8) });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <main className="page dashboard">
      <div className="dashboard__header">
        <div>
          <p className="page-eyebrow">Overview</p>
          <h1 className="page-title">Security Dashboard</h1>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard value={stats.total}     label="Total Scans"    accent="var(--accent2)" />
        <StatCard value={stats.safe}      label="Safe URLs"      accent="var(--safe)" />
        <StatCard value={stats.dangerous} label="Dangerous URLs" accent="var(--danger)" />
      </div>

      <div className="card dashboard__table-card">
        <h2 className="dashboard__table-title">Recent Scans</h2>

        {loading ? (
          <p className="text-muted" style={{ padding: '1rem 0', fontSize: 14 }}>Loading…</p>
        ) : stats.scans.length === 0 ? (
          <p className="text-muted" style={{ padding: '1rem 0', fontSize: 14 }}>No scans yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.scans.map((scan) => (
                  <tr key={scan._id}>
                    <td className="td-url">{scan.url}</td>
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

export default Dashboard;
