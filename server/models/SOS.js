import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: { type: String, default: '' },
  silentMode: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active',
  },
}, { timestamps: true });

export default mongoose.model('SOS', sosSchema);
