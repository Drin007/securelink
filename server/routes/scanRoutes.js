const express   = require('express');
const Scan =  require('../models/Scan.js');
const  protect  =  require('../middleware/authMiddleware.js');


const router = express.Router();

// Get user's scan history
router.get('/history', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id }).sort({ scannedAt: -1 });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

// Save scan result
router.post('/', protect, async (req, res) => {
  const { url, isScam } = req.body;

  if (!url) return res.status(400).json({ message: 'URL is required' });

  try {
    const scan = new Scan({
      user: req.user._id,
      url,
      isScam
    });

    const savedScan = await scan.save();
    res.status(201).json(savedScan);
  } catch (error) {
    res.status(500).json({ message: 'Scan save failed', error: error.message });
  }
});



module.exports =  router;
