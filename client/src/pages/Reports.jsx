// ... imports stay the same
import { useEffect, useState, useMemo } from "react";
// import axios from "axios";
import "../styles/Reports.css";

// const API = import.meta.env.VITE_API_URL;

import API from "../utils/api";

function StatusBadge({ reason }) {
  const statusColors = {
    phishing: { backgroundColor: "#dc2626", color: "white" },
    malware: { backgroundColor: "#ea580c", color: "white" },
    "fake store": { backgroundColor: "#eab308", color: "black" },
    scam: { backgroundColor: "#774b34ff", color: "white" },
    other: { backgroundColor: "#6b7280", color: "white" },
  };
  const key = reason?.toLowerCase() || "other";
  return (
    <span
      className="status-badge"
      style={statusColors[key] || statusColors.other}
    >
      {reason || "Unknown"}
    </span>
  );
}

function Reports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [reason, setReason] = useState("Phishing");
  const [priority, setPriority] = useState("low"); // NEW
  const [message, setMessage] = useState("");
  const [filterReason, setFilterReason] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
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
    try {
      await API.post("/api/reports", {
  url,
  reason,
  priority,
});

      setMessage("Report submitted successfully");

      // ✅ If high priority, open cybercrime portal in new tab
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
}
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    let data = [...reports];

    if (filterReason !== "all") {
      data = data.filter((r) => r.reason?.toLowerCase() === filterReason);
    }
    if (searchTerm.trim() !== "") {
      data = data.filter((r) =>
        r.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOrder === "newest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return data;
  }, [reports, filterReason, sortOrder, searchTerm]);

  return (
    <div>
      <div className="reports-container">
        <h2 className="reports-heading">🚨 Reported Sites</h2>

        {/* New Report Form */}
        <form onSubmit={handleSubmit} className="report-form">
          <input
            type="url"
            placeholder="URL to report"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="Phishing">Phishing</option>
            <option value="Fake Store">Fake Store</option>
            <option value="Malware">Malware</option>
            <option value="Other">Other</option>
          </select>

          {/* NEW Priority Dropdown */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="high">High</option>
          </select>

          {priority === "high" && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠ This report will be sent to cybercrime authorities.
            </p>
          )}

          <button type="submit">Report</button>
        </form>

        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}

        {/* Filters */}
        <div className="filters">
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
          >
            <option value="all">All Reasons</option>
            <option value="phishing">Phishing</option>
            <option value="malware">Malware</option>
            <option value="fake store">Fake Store</option>
            <option value="other">Other</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <input
            type="text"
            placeholder="Search URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>

        {/* Reports Table */}
        {filteredReports.length === 0 ? (
          <p className="no-data">No reports yet.</p>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th style={{ color: "black" }}>URL</th>
                <th style={{ color: "black" }}>Reason</th>
                <th style={{ color: "black" }}>Reported By</th>
                <th style={{ color: "black" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report._id}
                  className={
                    report.reason?.toLowerCase() === "phishing"
                      ? "row-phishing"
                      : report.reason?.toLowerCase() === "malware"
                      ? "row-malware"
                      : ""
                  }
                >
                  <td>{report.url}</td>
                  <td>
                    <StatusBadge reason={report.reason} />
                  </td>
                  <td>{report.reportedBy?.email || "Unknown"}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;
