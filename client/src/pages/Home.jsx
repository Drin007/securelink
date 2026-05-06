import { useState } from "react";
import axios from "axios";
import "../styles/Home.css";

function Home() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportReason, setReportReason] = useState("Phishing");
  const [msg, setMsg] = useState("");

  const scan = async () => {
    if (!url) return;
    setLoading(true);
    setAnalysis(null);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/check-url",
        { url },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAnalysis(res.data.analysis);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setMsg(e.response?.data?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const report = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/reports",
        { url, reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg("Reported successfully");
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setMsg("Report failed");
    }
  };

  const Badge = ({ children, type }) => (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 8,
        fontSize: 12,
        background:
          type === "good"
            ? "rgba(16,185,129,.15)"
            : type === "warn"
              ? "rgba(245,158,11,.15)"
              : "rgba(239,68,68,.15)",
        color:
          type === "good" ? "#10b981" : type === "warn" ? "#f59e0b" : "#ef4444",
      }}
    >
      {children}
    </span>
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {" "}
        🔗 Scan a URL here :{" "}
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="url"
          placeholder="Enter a link to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
            color: "#eee",
          }}
        />
        <button
          onClick={scan}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: 8 }}
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      {analysis && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #333",
            borderRadius: 12,
            background: "#0b0b0b",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{analysis.hostname}</h3>
              <div style={{ marginTop: 6 }}>
                <Badge type={analysis.status === "Safe" ? "good" : "bad"}>
                  {analysis.status}
                </Badge>{" "}
                {analysis.threatType && (
                  <Badge type="bad">{analysis.threatType}</Badge>
                )}{" "}
                {typeof analysis.score === "number" && (
                  <Badge type={analysis.score >= 60 ? "good" : "bad"}>
                    Score: {analysis.score}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick report */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Phishing">Phishing</option>
                <option value="Fake Store">Fake Store</option>
                <option value="Malware">Malware</option>
                <option value="Scam">Scam</option>
                <option value="Other">Other</option>
              </select>
              <button onClick={report}>Report</button>
            </div>
          </div>

          <hr style={{ borderColor: "#222", margin: "12px 0" }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 12,
            }}
          >
            <div>
              <h4>Network</h4>
              <ul>
                <li>
                  <b>IP:</b> {analysis.ip || "-"}
                </li>
                <li>
                  <b>Country/Region:</b> {analysis.country || "-"}{" "}
                  {analysis.regionName ? `• ${analysis.regionName}` : ""}
                </li>
                <li>
                  <b>ISP:</b> {analysis.isp || "-"}
                </li>
              </ul>
            </div>

            <div>
              <h4>Domain</h4>
              <ul>
                <li>
                  <b>Age:</b>{" "}
                  {analysis.domainAgeDays != null
                    ? `${Math.floor(analysis.domainAgeDays)} days`
                    : "Unknown"}
                </li>
                <li>
                  <b>TLD Suspicious:</b>{" "}
                  {analysis.checks?.suspiciousTld ? "Yes" : "No"}
                </li>
                <li>
                  <b>HTTPS:</b> {analysis.checks?.https ? "Yes" : "No"}
                </li>
              </ul>
            </div>

            <div>
              <h4>SSL</h4>
              {analysis.ssl ? (
                <ul>
                  <li>
                    <b>Issuer:</b> {analysis.ssl.issuerCN || "-"}
                  </li>
                  <li>
                    <b>Subject:</b> {analysis.ssl.subjectCN || "-"}
                  </li>
                  <li>
                    <b>Valid to:</b>{" "}
                    {analysis.ssl.validTo
                      ? new Date(analysis.ssl.validTo).toLocaleString()
                      : "-"}
                  </li>
                  <li>
                    <b>Days left:</b> {analysis.ssl.daysRemaining ?? "-"}
                  </li>
                  <li>
                    <b>Expired:</b> {analysis.checks?.sslExpired ? "Yes" : "No"}
                  </li>
                  <li>
                    <b>Self-signed:</b>{" "}
                    {analysis.checks?.sslSelfSigned ? "Yes" : "No"}
                  </li>
                </ul>
              ) : (
                <p>— Not available (non-HTTPS or handshake failed)</p>
              )}
            </div>

            <div>
              <h4>Signals</h4>
              <ul>
                <li>
                  <b>Google Safe Browsing:</b>{" "}
                  {analysis.checks?.googleSafeBrowsing ? "⚠️ Flagged" : "Clear"}
                </li>
                <li>
                  <b>OpenPhish:</b>{" "}
                  {analysis.checks?.openPhish ? "⚠️ Listed" : "Clear"}
                </li>
                <li>
                  <b>Suspicious keyword:</b>{" "}
                  {analysis.checks?.keyword ? "Yes" : "No"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
