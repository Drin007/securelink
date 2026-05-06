const express = require('express');
const Scan = require('../models/Scan');
const analyzeUrl = require('../utils/analyzeUrl');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/check-url', protect, async (req, res) => {
  const { url, isScam } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  } 
  try {
    const analysis = await analyzeUrl(url);
    if (analysis.error) {
      return res.status(500).json(analysis);
    }

    // Determine isScam from your logic or passed value (this is minimal)
    const scan = new Scan({
      user: req.user._id,
      url,
      ip: analysis.ip,
      hostname: analysis.hostname,
      country: analysis.country,
      regionName: analysis.regionName,
      isp: analysis.isp,
      status: analysis.status,
      score: analysis.score,
      isScam: !!isScam,
      scannedAt: new Date()
    });

    const saved = await scan.save();
    res.status(201).json({ analysis, saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Check URL failed', error: err.message });
  }
});

module.exports = router;