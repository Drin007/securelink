const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

let openPhishSet = new Set();

async function loadOpenPhish() {
  try {
    console.log('Fetching OpenPhish feed...');
    const res = await fetch('https://openphish.com/feed.txt');
    const text = await res.text();
    const urls = text.split('\n').filter(Boolean);
    openPhishSet = new Set(urls);
    console.log(`✅ Loaded ${urls.length} OpenPhish URLs`);
  } catch (err) {
    console.error('❌ Failed to fetch OpenPhish feed:', err.message);
  }
}

function getOpenPhishSet() {
  return openPhishSet;
}

module.exports = { loadOpenPhish, getOpenPhishSet };
