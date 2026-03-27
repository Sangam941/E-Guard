const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  sosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOS',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['sos_triggered', 'alert_sent', 'false_alarm', 'resolved'],
    required: true,
  },
  title: String,
  description: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
