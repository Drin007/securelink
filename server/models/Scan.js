const { Schema, model } = require('mongoose');

const scanSchema = new Schema({
  url: { type: String, required: true },
  ip: String,
  hostname: String,
  country: String,
  regionName: String,
  isp: String,
  status: String,
  score: Number,
  scannedAt: { type: Date, default: Date.now },

  // ✅ New fields
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isScam: { type: Boolean, default: false },
  reported: { type: Boolean, default: false },
  reportDate: { type: Date }
});

module.exports = model('Scan', scanSchema);