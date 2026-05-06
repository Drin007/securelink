import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    scam: 0,
    recent: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://securelink-backend-ohtu.onrender.com/api/scan/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const scans = res.data;

        const total = scans.length;
        const safe = scans.filter(s => s.status === "Safe").length;
        const scam = scans.filter(s => s.status === "Scam").length;

        const recent = scans.slice(0, 5);

        setStats({ total, safe, scam, recent });

      } catch (err) {
        console.error("Dashboard error:", err.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Dashboard</h2>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>Total Scans</h3>
          <p>{stats.total}</p>
        </div>

        <div style={{ ...cardStyle, color: "green" }}>
          <h3>Safe</h3>
          <p>{stats.safe}</p>
        </div>

        <div style={{ ...cardStyle, color: "red" }}>
          <h3>Scam</h3>
          <p>{stats.scam}</p>
        </div>
      </div>

      {/* Recent Scans */}
      <h3 style={{ marginTop: "30px" }}>Recent Activity</h3>

      {stats.recent.length === 0 ? (
        <p>No recent scans</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: "10px", width: "100%" }}>
          <thead>
            <tr>
              <th>URL</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map(scan => (
              <tr key={scan._id}>
                <td>{scan.url}</td>
                <td style={{ color: scan.status === "Scam" ? "red" : "green" }}>
                  {scan.status}
                </td>
                <td>{new Date(scan.scannedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cardStyle = {
  padding: "20px",
  border: "1px solid #333",
  borderRadius: "10px",
  width: "150px",
  textAlign: "center",
  background: "#111"
};

export default Dashboard;