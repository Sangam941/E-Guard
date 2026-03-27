import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sosId: { type: mongoose.Schema.Types.ObjectId, ref: 'SOS' },
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);
