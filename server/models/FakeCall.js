const mongoose = require('mongoose');

const fakeCallSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  callerId: String, // Who is calling
  callerName: String,
  voiceProfile: String,
  callTheme: String, // e.g., "Work", "Urgent", etc.
  delay: Number, // milliseconds
  duration: Number,
  isActive: Boolean,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FakeCall', fakeCallSchema);
