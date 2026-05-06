// utils/sslInfo.js
const tls = require('tls');

function daysLeft(to) {
  return Math.ceil((new Date(to) - new Date()) / (1000 * 60 * 60 * 24));
}

function getSSLCertificateInfo(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,       // SNI for modern hosts/CDNs
        rejectUnauthorized: false,  // we only want metadata, not validation here
        timeout: 8000,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          socket.end();

          if (!cert || Object.keys(cert).length === 0) return resolve(null);

          const subjectCN = cert.subject?.CN || cert.subject?.commonName;
          const issuerCN  = cert.issuer?.CN || cert.issuer?.commonName;
          const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
          const validTo   = cert.valid_to   ? new Date(cert.valid_to)   : null;

          const altNames = cert.subjectaltname
            ? cert.subjectaltname.replace(/DNS:/g, '').split(',').map(s => s.trim())
            : [];

          const data = {
            subjectCN,
            issuerCN,
            validFrom,
            validTo,
            altNames,
            daysRemaining: validTo ? daysLeft(validTo) : null,
            isExpired: validTo ? validTo < new Date() : null,
            // crude self-signed heuristic
            isSelfSigned: subjectCN && issuerCN ? subjectCN === issuerCN : null,
          };

          resolve(data);
        } catch {
          resolve(null);
        }
      }
    );

    socket.on('error', () => resolve(null));
    socket.on('timeout', () => { socket.destroy(); resolve(null); });
  });
}

module.exports = { getSSLCertificateInfo };
