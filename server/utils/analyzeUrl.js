const dns = require("dns").promises;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const whois = require("whois-json");
const { getOpenPhishSet } = require("./openPhishLoader");
const { saveCacheToFile, loadCacheFromFile } = require("./cachePersistence");
const { getSSLCertificateInfo } = require("./sslInfo"); // ⬅️ NEW

let scamUrlCache = loadCacheFromFile();

setInterval(() => {
  saveCacheToFile(scamUrlCache);
}, 600000);

process.on("exit", () => saveCacheToFile(scamUrlCache));
process.on("SIGINT", () => {
  saveCacheToFile(scamUrlCache);
  process.exit();
});
process.on("SIGTERM", () => {
  saveCacheToFile(scamUrlCache);
  process.exit();
});

async function getDomainAgeDays(domain) {
  try {
    const data = await whois(domain);
    const creationDate =
      data.creationDate || data.createdDate || data.created || data.registered;
    if (!creationDate) return null;
    const created = new Date(creationDate);
    if (isNaN(created)) return null;
    const ageMs = Date.now() - created.getTime();
    return ageMs / (1000 * 60 * 60 * 24);
  } catch (err) {
    console.error("❌ WHOIS lookup failed:", err.message);
    return null;
  }
}

async function analyzeUrl(url) {
  if (scamUrlCache.has(url)) {
    return {
      hostname: new URL(url).hostname,
      status: "Scam",
      score: 0,
      cached: true,
      message: "URL found in local scam cache",
      checks: {
        cachedBlacklist: true,
      },
    };
  }

  try {
    const { hostname, protocol } = new URL(url);

    // 1️ Google Safe Browsing API check
    let safeBrowsingResult = { isScam: false, threatType: null };
    try {
      const gsbRes = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "scam-link-detector", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "PHISHING",
                "UNWANTED_SOFTWARE",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url }],
            },
          }),
        },
      );
      const gsbData = await gsbRes.json();
      if (gsbData && gsbData.matches && gsbData.matches.length > 0) {
        safeBrowsingResult.isScam = true;
        safeBrowsingResult.threatType = gsbData.matches[0].threatType;
      }
    } catch (err) {
      console.error("⚠ Google Safe Browsing API failed:", err.message);
    }

    // 2️ OpenPhish check (cached set)
    const openPhishSet = getOpenPhishSet();
    const isUnsafeOpenPhish = [...openPhishSet].some(
      (phishUrl) => phishUrl && url.includes(phishUrl),
    );

    // 3️ WHOIS domain age check
    const domainAgeDays = await getDomainAgeDays(hostname);
    const isNewDomain = domainAgeDays !== null && domainAgeDays < 30;

    // 4️ DNS lookup to get IP
    const [ip] = await dns.lookup(hostname).then((res) => [res.address]);

    // 5️ IP location
    const locationRes = await fetch(`http://ip-api.com/json/${ip}`);
    const locationData = await locationRes.json();

    // 6️ Custom keyword-based heuristic
    const suspiciousKeywords = [
      "login",
      "verify",
      "update",
      "secure",
      "bank",
      "account",
      "free",
      "gift",
      "win",
    ];
    const hasSuspiciousKeyword = suspiciousKeywords.some((keyword) =>
      hostname.toLowerCase().includes(keyword),
    );

    // 7️ Suspicious TLD check
    const tld = hostname.split(".").pop().toLowerCase();
    const suspiciousTlds = [
      "xyz",
      "top",
      "club",
      "live",
      "win",
      "work",
      "gq",
      "tk",
    ];
    const hasSuspiciousTld = suspiciousTlds.includes(tld);

    // 8) HTTPS check
    const isHttps = protocol === "https:" || url.startsWith("https://");

    // 9) SSL certificate (only attempt for HTTPS)
    let ssl = null;
    let sslExpired = false;
    let sslSelfSigned = false;
    let sslExpiringSoon = false;

    if (isHttps) {
      ssl = await getSSLCertificateInfo(hostname);
      if (ssl) {
        sslExpired = !!ssl.isExpired;
        sslSelfSigned = !!ssl.isSelfSigned;
        sslExpiringSoon =
          typeof ssl.daysRemaining === "number" && ssl.daysRemaining <= 14;
      }
    }
    // 10) Final scam decision
    const isScamFinal =
      safeBrowsingResult.isScam ||
      isUnsafeOpenPhish ||
      isNewDomain ||
      hasSuspiciousKeyword ||
      hasSuspiciousTld ||
      !isHttps ||
      sslExpired ||
      sslSelfSigned;

    let score = 100;
    if (safeBrowsingResult.isScam) score -= 80;
    if (isUnsafeOpenPhish) score -= 60;
    if (isNewDomain) score -= 15;
    if (hasSuspiciousKeyword) score -= 10;
    if (hasSuspiciousTld) score -= 10;
    if (!isHttps) score -= 20;
    if (sslExpired) score -= 20;
    if (sslSelfSigned) score -= 15;
    if (sslExpiringSoon) score -= 5;
    if (isScamFinal) {
      scamUrlCache.add(url);
    }
    score = Math.max(0, Math.min(100, score));

    return {
      hostname,
      ip,
      country: locationData.country,
      regionName: locationData.regionName,
      isp: locationData.isp,
      status: isScamFinal ? "Scam" : "Safe",
      score: isScamFinal ? 20 : 90,
      threatType: safeBrowsingResult.threatType,
      domainAgeDays,
      ssl,
      checks: {
        googleSafeBrowsing: safeBrowsingResult.isScam,
        openPhish: isUnsafeOpenPhish,
        whoisNewDomain: isNewDomain,
        keyword: hasSuspiciousKeyword,
        suspiciousTld: hasSuspiciousTld,
        https: isHttps,
        sslExpired,
        sslSelfSigned,
        sslExpiringSoon,
      },
    };
  } catch (err) {
    console.error("❌ analyzeUrl failed:", err);
    return { error: "Failed to analyze URL", details: err.message };
  }
}

module.exports = analyzeUrl;
