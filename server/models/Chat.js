const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  sosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOS',
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant'],
      },
      content: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);
