import asyncHandler from 'express-async-handler';
import SOS from '../models/SOS.js';
import Contact from '../models/Contact.js';
import Alert from '../models/Alert.js';

// POST /api/sos
export const triggerSOS = asyncHandler(async (req, res) => {
  const { latitude, longitude, address, silentMode } = req.body;
  const userId = req.user._id;

  if (!userId || latitude === undefined || longitude === undefined) {
    res.status(400).json({ success: false, message: 'userId, latitude, and longitude are required' });
    return;
  }

  const sos = await SOS.create({ userId, latitude, longitude, address, silentMode });

  // Create an alert for the user themselves
  await Alert.create({
    userId,
    title: 'SOS Triggered',
    message: `SOS alert was triggered at coordinates (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})${address ? ' — ' + address : ''}.`,
    sosId: sos._id,
  });

  // Create alerts for all of this user's contacts (so they can see the notification)
  const contacts = await Contact.find({ userId });
  if (contacts.length > 0) {
    const alertDocs = contacts.map((c) => ({
      userId: c.userId,
      title: 'Emergency Alert Sent',
      message: `Alert sent to ${contacts.length} contact(s). Location shared.`,
      sosId: sos._id,
    }));
    await Alert.insertMany(alertDocs);
  }

  res.status(201).json({ success: true, data: sos });
});

// GET /api/sos/:id
export const getSOSById = asyncHandler(async (req, res) => {
  const sos = await SOS.findById(req.params.id);
  if (!sos) {
    res.status(404).json({ success: false, message: 'SOS record not found' });
    return;
  }
  res.json({ success: true, data: sos });
});

// GET /api/sos/user/:userId
export const getUserSOS = asyncHandler(async (req, res) => {
  const sosList = await SOS.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: sosList });
});

// PATCH /api/sos/:id/status
export const updateSOSStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'resolved', 'false_alarm'];
  if (!status || !allowed.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status value' });
    return;
  }

  const sos = await SOS.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!sos) {
    res.status(404).json({ success: false, message: 'SOS record not found' });
    return;
  }
  res.json({ success: true, data: sos });
});
