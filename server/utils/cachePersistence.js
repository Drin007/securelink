const fs = require('fs');
const path = require('path');

const cacheFilePath = path.resolve(__dirname, 'scamCache.json');

function saveCacheToFile(cacheSet) {
  try {
    const arr = Array.from(cacheSet);
    fs.writeFileSync(cacheFilePath, JSON.stringify(arr, null, 2));
    console.log(`✅ Scam cache saved (${arr.length} URLs)`);
  } catch (err) {
    console.error('❌ Failed to save scam cache:', err.message);
  }
}

function loadCacheFromFile() {
  try {
    if (!fs.existsSync(cacheFilePath)) return new Set();

    const data = fs.readFileSync(cacheFilePath, 'utf-8');
    const arr = JSON.parse(data);
    console.log(`✅ Loaded scam cache from file (${arr.length} URLs)`);
    return new Set(arr);
  } catch (err) {
    console.error('❌ Failed to load scam cache:', err.message);
    return new Set();
  }
}

module.exports = { saveCacheToFile, loadCacheFromFile };
