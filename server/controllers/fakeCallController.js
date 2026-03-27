import FakeCall from '../models/FakeCall.js';

export const createFakeCall = async (req, res, next) => {
  try {
    const { userId, callerId, callerName, voiceProfile, callTheme, delay } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const fakeCall = new FakeCall({
      userId,
      callerId: callerId || 'Unknown',
      callerName: callerName || 'Emergency Contact',
      voiceProfile: voiceProfile || 'Standard Male',
      callTheme: callTheme || 'Work / Urgent',
      delay: delay || 0,
      isActive: true,
    });

    await fakeCall.save();

    // Auto-deactivate after 5 minutes
    setTimeout(async () => {
      await FakeCall.findByIdAndUpdate(fakeCall._id, { isActive: false });
    }, 5 * 60 * 1000);

    res.status(201).json({
      success: true,
      message: 'Fake call initiated',
      data: fakeCall,
    });
  } catch (error) {
    next(error);
  }
};

export const stopFakeCall = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fakeCall = await FakeCall.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!fakeCall) {
      return res.status(404).json({
        success: false,
        message: 'Fake call not found',
      });
    }

    res.json({
      success: true,
      message: 'Fake call stopped',
      data: fakeCall,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFakeCalls = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const calls = await FakeCall.find({ userId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};
