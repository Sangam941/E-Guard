import mongoose from 'mongoose';

const fakeCallSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  callerName: { type: String, required: true },
  callerNumber: { type: String, required: true },
  delaySeconds: { type: Number, default: 5 },
  scheduleTime: { type: Date },
  duration: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'active', 'stopped'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('FakeCall', fakeCallSchema);
