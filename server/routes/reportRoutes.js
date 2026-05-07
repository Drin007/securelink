const express = require('express');
const Report = require('../models/Report');
const protect = require('../middleware/authMiddleware');
const { reportToGoogleSafeBrowsing } = require('../utils/reportToCybercrime');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { url, reason, priority } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const newReport = new Report({ url, reason, reportedBy: req.user._id });
    await newReport.save();


    console.log(`🚨 Report received for: ${url}`);
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    console.error('❌ Report failed:', err);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

router.get('/', protect, async (req, res) => {
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
