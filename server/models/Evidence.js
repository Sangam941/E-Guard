import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  sosId: { type: mongoose.Schema.Types.ObjectId, ref: 'SOS' },
  type: { type: String, enum: ['photo', 'video', 'audio'], required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Evidence', evidenceSchema);
