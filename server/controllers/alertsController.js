import asyncHandler from 'express-async-handler';
import Alert from '../models/Alert.js';

// GET /api/alerts/:userId
export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: alerts });
});

// GET /api/alerts/detail/:id
export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }
  res.json({ success: true, data: alert });
});

// PATCH /api/alerts/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alert not found' });
    return;
  }
  res.json({ success: true, data: alert });
});

// PATCH /api/alerts/user/:userId/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Alert.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All alerts marked as read' });
});
