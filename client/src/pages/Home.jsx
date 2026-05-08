import { useState } from "react";
import API from "../utils/api";
import "../styles/Home.css";

const Badge = ({ children, type }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || "—"}</span>
  </div>
);

function Home() {
  const [url, setUrl]               = useState("");
  const [analysis, setAnalysis]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [reportReason, setReportReason] = useState("Phishing");
  const [msg, setMsg]               = useState("");
  const [msgType, setMsgType]       = useState(""); // "ok" | "err"

  const scan = async () => {
    if (!url) return;
    setLoading(true);
    setAnalysis(null);
    setMsg("");
    try {
      const res = await API.post("/api/check-url", { url });
      setAnalysis(res.data.analysis);
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      setMsg(e.response?.data?.message || "Scan failed");
      setMsgType("err");
    } finally {
      setLoading(false);
    }
  };

  const report = async () => {
    try {
      await API.post("/api/reports", { url, reason: reportReason });
      setMsg("Reported successfully");
      setMsgType("ok");
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      setMsg("Report failed");
      setMsgType("err");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") scan(); };

  const isSafe = analysis?.status === "Safe";

  return (
    <main className="page home">

      <section className="hero">
        <p className="hero__eyebrow">URL Safety Scanner</p>
        <h1 className="hero__title">Is this link safe<span className="hero__dot">?</span></h1>
        <p className="hero__sub">
          Paste any URL and get an instant threat analysis — SSL, domain age,
          phishing signals, and more.
        </p>

        <div className="scan-bar">
          <div className="scan-bar__input-wrap">
            <span className="scan-bar__icon">🔗</span>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKey}
              className="scan-bar__input"
            />
          </div>
          <button
            onClick={scan}
            disabled={loading}
            className="btn btn-primary scan-bar__btn"
          >
            {loading ? (
              <><span className="spinner" /> Scanning…</>
            ) : "Scan URL"}
          </button>
        </div>

        {msg && (
          <p className={`home-msg home-msg--${msgType}`}>{msg}</p>
        )}
      </section>

      {analysis && (
        <section className="result card">

          <div className="result__header">
            <div className="result__title-row">
              <div className={`result__status-dot result__status-dot--${isSafe ? 'safe' : 'danger'}`} />
              <h2 className="result__hostname">{analysis.hostname}</h2>
            </div>
            <div className="result__badges">
              <Badge type={isSafe ? "safe" : "danger"}>{analysis.status}</Badge>
              {analysis.threatType && <Badge type="danger">{analysis.threatType}</Badge>}
              {typeof analysis.score === "number" && (
                <Badge type={analysis.score >= 60 ? "safe" : "danger"}>
                  Score {analysis.score}
                </Badge>
              )}
            </div>
          </div>

          <div className="result__report-bar">
            <span className="result__report-label">Flag this URL:</span>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option>Phishing</option>
              <option>Fake Store</option>
              <option>Malware</option>
              <option>Scam</option>
              <option>Other</option>
            </select>
            <button onClick={report} className="btn btn-ghost">Report</button>
          </div>

          <hr className="divider" />

          <div className="detail-grid">

            <div className="detail-section">
              <h4 className="detail-section__title">Network</h4>
              <InfoRow label="IP"             value={analysis.ip} />
              <InfoRow label="Country"        value={[analysis.country, analysis.regionName].filter(Boolean).join(" · ")} />
              <InfoRow label="ISP"            value={analysis.isp} />
            </div>

            <div className="detail-section">
              <h4 className="detail-section__title">Domain</h4>
              <InfoRow
                label="Age"
                value={analysis.domainAgeDays != null
                  ? `${Math.floor(analysis.domainAgeDays)} days`
                  : "Unknown"}
              />
              <InfoRow label="TLD Suspicious" value={analysis.checks?.suspiciousTld ? "Yes" : "No"} />
              <InfoRow label="HTTPS"          value={analysis.checks?.https ? "Yes" : "No"} />
            </div>

            <div className="detail-section">
              <h4 className="detail-section__title">SSL Certificate</h4>
              {analysis.ssl ? (
                analysis.ssl.detailsAvailable === false ? (

                  <InfoRow label="Status" value="✓ Valid (details withheld by CDN)" />
                ) : <>
                  <InfoRow label="Issuer"      value={analysis.ssl.issuerCN} />
                  <InfoRow label="Subject"     value={analysis.ssl.subjectCN} />
                  <InfoRow label="Valid to"    value={analysis.ssl.validTo ? new Date(analysis.ssl.validTo).toLocaleDateString() : null} />
                  <InfoRow label="Days left"   value={analysis.ssl.daysRemaining} />
                  <InfoRow label="Expired"     value={analysis.checks?.sslExpired ? "Yes" : "No"} />
                  <InfoRow label="Self-signed" value={analysis.checks?.sslSelfSigned ? "Yes" : "No"} />
                </>
              ) : (
                <p className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>Not available — non-HTTPS or handshake failed</p>
              )}
            </div>

            <div className="detail-section">
              <h4 className="detail-section__title">Threat Signals</h4>
              <InfoRow
                label="Google Safe Browsing"
                value={analysis.checks?.googleSafeBrowsing ? "⚠ Flagged" : "Clear"}
              />
              <InfoRow
                label="OpenPhish"
                value={analysis.checks?.openPhish ? "⚠ Listed" : "Clear"}
              />
              <InfoRow
                label="Suspicious keyword"
                value={analysis.checks?.keyword ? "Yes" : "No"}
              />
            </div>

          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
