import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  relationship: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
