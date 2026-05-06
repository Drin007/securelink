// controllers/reportController.js
exports.createReport = async (req, res) => {
  try {
    const { url, reason } = req.body;
    if (!url || !reason) {
      return res.status(400).json({ msg: 'URL and reason are required' });
    }

    const report = await Report.create({
      url,
      reason,
      reportedBy: req.user ? req.user.id : null,
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
