import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  latitude: Number,
  longitude: Number,
  address: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active',
  },
  contactsNotified: [String],
  audioEvidence: String, // Cloudinary URL
  videoEvidence: String, // Cloudinary URL
  aiAnalysis: String,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  silentMode: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('SOS', sosSchema);
