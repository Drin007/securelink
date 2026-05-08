const tls = require('tls');

function daysLeft(to) {
  return Math.ceil((new Date(to) - new Date()) / (1000 * 60 * 60 * 24));
}

function getSSLCertificateInfo(hostname) {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (val) => {
      if (!resolved) { resolved = true; resolve(val); }
    };

    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 10000,
        minVersion: 'TLSv1.2',
        ciphers: 'DEFAULT',
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          socket.destroy();


          if (!cert || Object.keys(cert).length === 0) {
            return done({
              subjectCN:        null,
              issuerCN:         null,
              validFrom:        null,
              validTo:          null,
              altNames:         [],
              daysRemaining:    null,
              isExpired:        false,
              isSelfSigned:     false,
              detailsAvailable: false,
            });
          }

          const subjectCN = cert.subject?.CN || null;
          const issuerCN  = cert.issuer?.CN  || null;
          const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
          const validTo   = cert.valid_to   ? new Date(cert.valid_to)   : null;

          const altNames = cert.subjectaltname
            ? cert.subjectaltname.replace(/DNS:/g, '').split(',').map(s => s.trim())
            : [];

          done({
            subjectCN,
            issuerCN,
            validFrom,
            validTo,
            altNames,
            daysRemaining:    validTo ? daysLeft(validTo) : null,
            isExpired:        validTo ? validTo < new Date() : false,
            isSelfSigned:     subjectCN && issuerCN ? subjectCN === issuerCN : false,
            detailsAvailable: true,
          });
        } catch {
          done(null);
        }
      }
    );

    socket.on('error',   () => done(null));
    socket.on('timeout', () => { socket.destroy(); done(null); });
  });
}

module.exports = { getSSLCertificateInfo };
