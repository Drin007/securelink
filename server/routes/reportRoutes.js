const express = require('express');
const Report = require('../models/Report');
const { reportToGoogleSafeBrowsing } = require('../utils/reportToCybercrime'); // new utility
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url, reason, reportedBy, priority } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // 1️⃣ Save in your database
    const newReport = new Report({ url, reason, reportedBy });
    await newReport.save();

    // 2️⃣ Optionally forward to Google Safe Browsing if priority is high
    // if (priority && priority.toLowerCase() === 'high') {
    //   const result = await reportToGoogleSafeBrowsing(url);
    //   console.log('📤 Sent to Google Safe Browsing:', result);
    // }

    console.log(`🚨 Report received for: ${url}`);
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    console.error('❌ Report failed:', err);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error('❌ Failed to fetch reports:', err);
    res.status(500).json({ message: 'Failed to load reports' });
  }
});

module.exports = router;
