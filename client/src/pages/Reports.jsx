import { useEffect, useState, useMemo } from "react";
import API from "../utils/api";
import "../styles/Reports.css";

const reasonColors = {
  phishing:    { bg: "#dc2626", color: "#fff" },
  malware:     { bg: "#ea580c", color: "#fff" },
  "fake store":{ bg: "#ca8a04", color: "#fff" },
  scam:        { bg: "#7c3aed", color: "#fff" },
  other:       { bg: "#475569", color: "#fff" },
};

function StatusBadge({ reason }) {
  const key    = reason?.toLowerCase() || "other";
  const styles = reasonColors[key] || reasonColors.other;
  return (
    <span className="status-badge" style={styles}>{reason || "Unknown"}</span>
  );
}

function Reports() {
  const [reports, setReports]       = useState([]);
  const [error, setError]           = useState("");
  const [url, setUrl]               = useState("");
  const [reason, setReason]         = useState("Phishing");
  const [priority, setPriority]     = useState("low");
  const [message, setMessage]       = useState("");
  const [msgType, setMsgType]       = useState("");
  const [filterReason, setFilterReason] = useState("all");
  const [sortOrder, setSortOrder]   = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    try {
      const res = await API.get("/api/reports");
      setReports(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      setError(err.response?.data?.msg || "Failed to load reports");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/api/reports", { url, reason, priority });
      setMessage("Report submitted successfully");
      setMsgType("ok");
      if (priority === "high") {
        window.open("https://cybercrime.gov.in/Webform/Index.aspx", "_blank");
      }
      setUrl("");
      setPriority("low");
      fetchReports();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      setMessage("Failed to submit report");
      setMsgType("err");
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const filteredReports = useMemo(() => {
    let data = [...reports];
    if (filterReason !== "all")
      data = data.filter(r => r.reason?.toLowerCase() === filterReason);
    if (searchTerm.trim())
      data = data.filter(r => r.url.toLowerCase().includes(searchTerm.toLowerCase()));
    data.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    return data;
  }, [reports, filterReason, sortOrder, searchTerm]);

  return (
    <main className="page reports-page">

      <div className="reports__header">
        <p className="page-eyebrow">Community</p>
        <h1 className="page-title">Reported Sites</h1>
      </div>

      {/* Submit form */}
      <div className="card reports__form-card">
        <h2 className="reports__form-title">Submit a Report</h2>
        <form onSubmit={handleSubmit} className="reports__form">
          <div className="field reports__field-url">
            <label className="field__label">URL</label>
            <input
              type="url"
              placeholder="https://suspicious-site.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Phishing</option>
              <option>Fake Store</option>
              <option>Malware</option>
              <option>Scam</option>
              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label className="field__label">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="reports__form-actions">
            {priority === "high" && (
              <p className="reports__high-priority-warn">
                ⚠ High priority reports are forwarded to cybercrime authorities.
              </p>
            )}
            <button type="submit" className="btn btn-primary">Submit Report</button>
          </div>
        </form>

        {message && (
          <p className={`reports__msg reports__msg--${msgType}`}>{message}</p>
        )}
        {error && <p className="reports__msg reports__msg--err">{error}</p>}
      </div>

      {/* Filters */}
      <div className="reports__filters">
        <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)}>
          <option value="all">All Reasons</option>
          <option value="phishing">Phishing</option>
          <option value="malware">Malware</option>
          <option value="fake store">Fake Store</option>
          <option value="scam">Scam</option>
          <option value="other">Other</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <div className="reports__search-wrap">
          <span className="reports__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search URL…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="reports__search"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredReports.length === 0 ? (
          <p className="reports__empty">No reports match your filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Reason</th>
                  <th>Reported By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report._id}>
                    <td className="reports__td-url">{report.url}</td>
                    <td><StatusBadge reason={report.reason} /></td>
                    <td className="text-muted">{report.reportedBy?.email || "—"}</td>
                    <td className="text-muted">{new Date(report.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </main>
  );
}

export default Reports;
