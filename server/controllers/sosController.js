const SOS = require('../models/SOS');
const Alert = require('../models/Alert');
const Contact = require('../models/Contact');
const { GoogleGenerativeAI } = require('google-generative-ai');

const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

exports.triggerSOS = async (req, res, next) => {
  try {
    const { userId, latitude, longitude, address, silentMode } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, latitude, longitude',
      });
    }

    // Create SOS record
    const sosRecord = new SOS({
      userId,
      latitude,
      longitude,
      address,
      silentMode: silentMode || false,
      status: 'active',
    });

    await sosRecord.save();

    // Get emergency contacts
    const contacts = await Contact.find({ userId, isPrimary: true });

    // Notify contacts
    const contactsNotified = contacts.map(c => c.phone);
    sosRecord.contactsNotified = contactsNotified;
    await sosRecord.save();

    // Create alert
    const alert = new Alert({
      sosId: sosRecord._id,
      userId,
      type: 'sos_triggered',
      title: 'SOS Emergency Alert',
      description: 'Emergency SOS triggered at your location',
      location: { latitude, longitude },
    });

    await alert.save();

    // AI Analysis
    const model = genai.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `You are an emergency response AI. A user has triggered an SOS at coordinates ${latitude}, ${longitude}. 
    Address: ${address || 'Unknown'}. 
    Provide immediate safety recommendations in 2-3 short sentences.`;

    const result = await model.generateContent(prompt);
    const aiAnalysis = result.response.text();
    sosRecord.aiAnalysis = aiAnalysis;
    await sosRecord.save();

    res.status(201).json({
      success: true,
      message: 'SOS triggered successfully',
      data: sosRecord,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSOS = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sos = await SOS.findById(id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: 'SOS record not found',
      });
    }

    res.json({
      success: true,
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserSOS = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sosList = await SOS.find({ userId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: sosList,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSOSStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const sos = await SOS.findByIdAndUpdate(id, { status }, { new: true });

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: 'SOS record not found',
      });
    }

    res.json({
      success: true,
      message: 'SOS status updated',
      data: sos,
    });
  } catch (error) {
    next(error);
  }
};
