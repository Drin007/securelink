import { useEffect, useState } from 'react';
import API from "../utils/api";


const MyScans = () => {
  const [scans, setScans] = useState([]);
  const [error, setError] = useState('');
  

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

        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load scan history'
        );
      }
    };

    fetchScans();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        🔍 My Scan History
      </h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {scans.length === 0 ? (
        <p>No scans found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <td>{scan.url}</td>
                <td>{scan.ip}</td>

                <td style={{ color: scan.status === 'Scam' ? 'red' : 'green' }}>
                  {scan.status}
                </td>

                <td>
                  {new Date(scan.scannedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyScans;