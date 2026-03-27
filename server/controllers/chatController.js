import asyncHandler from 'express-async-handler';
import { randomUUID } from 'crypto';
import Chat from '../models/Chat.js';
import { generateContent } from '../services/gemini.services.js';

// Simple rule-based safety responses (used when no Gemini key)
function getRuleBased(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('help') || msg.includes('danger') || msg.includes('unsafe') || msg.includes('emergency')) {
    return `I understand you need help. Here are immediate steps to keep you safe:

1. **Assess your environment** — Find a safe location if possible
2. **Contact authorities** — Call 911 or your local emergency number immediately
3. **Trigger SOS** — Use the SOS button in the app to alert your emergency contacts
4. **Document everything** — Use the Evidence Capture feature to record your surroundings
5. **Share your location** — Your location is being shared with your contacts

Stay calm and stay safe. I am monitoring your situation.`;
  }
  if (msg.includes('sos') || msg.includes('alert')) {
    return 'To trigger an SOS alert, go to the SOS page and hold the red button for 1 second. Your emergency contacts will be notified immediately with your location.';
  }
  if (msg.includes('contact') || msg.includes('number')) {
    return 'You can manage your emergency contacts on the Contacts page. Add trusted people who will receive your SOS alerts.';
  }
  if (msg.includes('fake call') || msg.includes('fakecall')) {
    return 'The Fake Call feature lets you simulate an incoming call to help you exit uncomfortable situations. Go to the Fake Call page and set up your caller details.';
  }
  return `I heard you: "${userMessage}". I am your safety assistant. If you feel unsafe, please trigger an SOS or describe your situation so I can provide specific guidance. Type "help" for emergency steps.`;
}

// POST /api/chat
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, message } = req.body;
  const userId = req.user._id;

  if (!userId || !message) {
    res.status(400).json({ success: false, message: 'message are required' });
    return;
  }

  const resolvedChatId = chatId || randomUUID();

  // Get or create chat document
  let chat = await Chat.findOne({ chatId: resolvedChatId });
  if (!chat) {
    chat = await Chat.create({ chatId: resolvedChatId, userId, messages: [] });
  }

  // Save user message
  chat.messages.push({ role: 'user', content: message });

  // Generate AI reply
  let aiReply = '';

    try {
      const systemPrompt = `You are Sentinel AI, an emergency safety assistant for the E-Guard app. 
Your role is to provide calm, clear, and actionable safety guidance. 
Always prioritize user safety. If someone is in immediate danger, instruct them to call 911 and use SOS.
Keep responses concise and practical.`;

      aiReply = await generateContent(systemPrompt)
      console.log("aiReply:: ", aiReply)
      // // Build conversation history
      // const history = chat.messages.slice(-10).map((m) => ({
      //   role: m.role === 'assistant' ? 'model' : 'user',
      //   parts: [{ text: m.content }],
      // }));

      // const chatSession = model.startChat({ history: history.slice(0, -1), systemInstruction: systemPrompt });
      // const result = await chatSession.sendMessage(message);
      // aiReply = result.response.text();
    } catch (err) {
      console.error('Gemini error:', err.message);
      aiReply = getRuleBased(message);
    }

  // Save assistant reply
  chat.messages.push({ role: 'assistant', content: aiReply });
  await chat.save();

  res.json({
    success: true,
    data: {
      chatId: resolvedChatId,
      userMessage: message,
      aiMessage: aiReply,
    },
  });
});

// GET /api/chat/:chatId
export const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ chatId: req.params.chatId });
  if (!chat) {
    res.status(404).json({ success: false, message: 'Chat not found' });
    return;
  }
  res.json({ success: true, data: chat });
});

// GET /api/chat/user/:userId
export const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: chats });
});
