import Chat from '../models/Chat.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model = genai.getGenerativeModel({ model: 'gemini-pro' });

export const sendMessage = async (req, res, next) => {
  try {
    const { userId, sosId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId and message are required',
      });
    }

    // Find or create chat session
    let chat = await Chat.findOne({ userId, sosId });

    if (!chat) {
      chat = new Chat({
        userId,
        sosId,
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Generate AI response
    const conversationHistory = chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content,
    }));

    const chatSession = model.startChat({
      history: conversationHistory.slice(0, -1),
    });

    const result = await chatSession.sendMessage(message);
    const aiResponse = result.response.text();

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    chat.updatedAt = new Date();
    await chat.save();

    res.json({
      success: true,
      message: 'Message processed',
      data: {
        userMessage: message,
        aiResponse,
        chatId: chat._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};
