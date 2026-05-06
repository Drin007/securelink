const axios = require("axios");

const reportToGoogleSafeBrowsing = async (url) => {
    const API_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

    try {
        const payload = {
            threatInfo: {
                threatTypes: [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url }]
            }
        };

        const res = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
            payload
        );

        return res.data;
    } catch (err) {
        console.error("❌ Cybercrime API report failed:", err.message);
        return null;
    }
};

module.exports = { reportToGoogleSafeBrowsing };
