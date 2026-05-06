const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  url: { type: String, required: true },
  reason: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);