const SOSSession = require('../models/SOSSession');
const User = require('../models/User');

class LocationService {
  /**
   * Start a new SOS session
   */
  async startSOSSession(userId, notifiedContactIds = []) {
    try {
      const sosSession = new SOSSession({
        userId,
        status: 'active',
        startTime: new Date(),
        notifiedContacts: notifiedContactIds
      });
      await sosSession.save();
      return sosSession;
    } catch (error) {
      console.error('Error starting SOS session:', error);
      throw error;
    }
  }

  /**
   * Update location for active SOS session
   */
  async updateSOSLocation(userId, locationData) {
    try {
      const sosSession = await SOSSession.findOne({
        userId,
        status: 'active'
      }).sort({ startTime: -1 });

      if (!sosSession) {
        return null;
      }

      // Add location point to path
      sosSession.locationPath.push({
        latitude: locationData.lat,
        longitude: locationData.lng,
        accuracy: locationData.accuracy,
        timestamp: new Date()
      });

      // Update last location
      sosSession.lastLocation = {
        latitude: locationData.lat,
        longitude: locationData.lng,
        accuracy: locationData.accuracy,
        timestamp: new Date()
      };

      // Limit path storage (keep last 1000 points to prevent memory bloat)
      if (sosSession.locationPath.length > 1000) {
        sosSession.locationPath = sosSession.locationPath.slice(-1000);
      }

      await sosSession.save();
      return sosSession;
    } catch (error) {
      console.error('Error updating SOS location:', error);
      throw error;
    }
  }

  /**
   * End an active SOS session
   */
  async endSOSSession(userId, reason = 'User cancelled') {
    try {
      const sosSession = await SOSSession.findOneAndUpdate(
        {
          userId,
          status: 'active'
        },
        {
          status: 'resolved',
          endTime: new Date(),
          reason
        },
        { new: true }
      );
      return sosSession;
    } catch (error) {
      console.error('Error ending SOS session:', error);
      throw error;
    }
  }

  /**
   * Get active SOS session for a user
   */
  async getActiveSOSSession(userId) {
    try {
      return await SOSSession.findOne({
        userId,
        status: 'active'
      }).sort({ startTime: -1 });
    } catch (error) {
      console.error('Error fetching active SOS session:', error);
      throw error;
    }
  }

  /**
   * Get SOS session history
   */
  async getSOSHistory(userId, limit = 20, skip = 0) {
    try {
      return await SOSSession.find({ userId })
        .sort({ startTime: -1 })
        .limit(limit)
        .skip(skip)
        .populate('notifiedContacts', 'name email phone');
    } catch (error) {
      console.error('Error fetching SOS history:', error);
      throw error;
    }
  }

  /**
   * Get SOS session details with full path
   */
  async getSOSSessionDetails(sosSessionId) {
    try {
      return await SOSSession.findById(sosSessionId)
        .populate('userId', 'name email phone')
        .populate('notifiedContacts', 'name email phone');
    } catch (error) {
      console.error('Error fetching SOS session details:', error);
      throw error;
    }
  }

  /**
   * Register device for multi-device sync
   */
  async registerDevice(userId, deviceId, userAgent) {
    try {
      const sosSession = await this.getActiveSOSSession(userId);
      if (!sosSession) return null;

      // Check if device already exists
      const deviceIndex = sosSession.devices.findIndex(d => d.deviceId === deviceId);

      if (deviceIndex === -1) {
        // Add new device
        sosSession.devices.push({
          deviceId,
          userAgent,
          connectedAt: new Date()
        });
      }

      await sosSession.save();
      return sosSession;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(userId, deviceId) {
    try {
      const sosSession = await this.getActiveSOSSession(userId);
      if (!sosSession) return null;

      const deviceIndex = sosSession.devices.findIndex(d => d.deviceId === deviceId);
      if (deviceIndex !== -1) {
        sosSession.devices[deviceIndex].disconnectedAt = new Date();
      }

      await sosSession.save();
      return sosSession;
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  /**
   * Calculate SOS duration
   */
  async getSOSDuration(sosSessionId) {
    try {
      const sosSession = await SOSSession.findById(sosSessionId);
      if (!sosSession) return null;

      if (sosSession.endTime) {
        return Math.floor((sosSession.endTime - sosSession.startTime) / 1000);
      }
      return Math.floor((new Date() - sosSession.startTime) / 1000);
    } catch (error) {
      console.error('Error calculating SOS duration:', error);
      throw error;
    }
  }
}

module.exports = new LocationService();
