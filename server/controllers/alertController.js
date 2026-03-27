import Alert from '../models/Alert.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const alerts = await Alert.find({ userId }).sort({ timestamp: -1 }).populate('sosId');

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id).populate('sosId');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndUpdate(id, { isRead: true }, { new: true });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.json({
      success: true,
      message: 'Alert marked as read',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await Alert.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All alerts marked as read',
    });
  } catch (error) {
    next(error);
  }
};
