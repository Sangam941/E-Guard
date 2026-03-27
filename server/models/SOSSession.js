const mongoose = require('mongoose');

const LocationPointSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SOSSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    },
    reason: {
      type: String,
      default: null
    },
    notifiedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    locationPath: [LocationPointSchema],
    lastLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date
    },
    devices: [
      {
        deviceId: String,
        userAgent: String,
        connectedAt: Date,
        disconnectedAt: Date
      }
    ],
    duration: {
      type: Number,
      default: 0 // in seconds
    },
    isEmergency: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Auto-calculate duration before saving
SOSSessionSchema.pre('save', function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// Index for querying active SOS sessions
SOSSessionSchema.index({ userId: 1, status: 1 });
SOSSessionSchema.index({ startTime: -1 });

module.exports = mongoose.model('SOSSession', SOSSessionSchema);
