import asyncHandler from 'express-async-handler';
import FakeCall from '../models/FakeCall.js';

// POST /api/fake-call
export const createFakeCall = asyncHandler(async (req, res) => {
  const { callerName, callerNumber } = req.body;
  const userId = req.user._id;
  if (!userId) {
    res.status(400).json({ success: false, message: 'userId is required' });
    return;
  }
  if (!callerName) {
    res.status(400).json({ success: false, message: 'callerName, are required' });
    return;
  }
  if (callerNumber) {
    res.status(400).json({ success: false, message: 'callerNumber are required' });
    return;
  }
  const fakeCall = await FakeCall.create({
    userId, callerName, callerNumber,
    delaySeconds: delaySeconds ?? 5,
    scheduleTime,
    duration: duration ?? 0,
    status: 'pending',
  });
  res.status(201).json({ success: true, data: fakeCall });
});

// PATCH /api/fake-call/:id/stop
export const stopFakeCall = asyncHandler(async (req, res) => {
  const fakeCall = await FakeCall.findByIdAndUpdate(
    req.params.id,
    { status: 'stopped' },
    { new: true }
  );
  if (!fakeCall) {
    res.status(404).json({ success: false, message: 'Fake call not found' });
    return;
  }
  res.json({ success: true, data: fakeCall });
});

// GET /api/fake-call/user/:userId
export const getUserFakeCalls = asyncHandler(async (req, res) => {
  const calls = await FakeCall.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: calls });
});
