import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';

export class ChatController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        throw new AppError(400, 'Missing required fields: userId, message');
      }

      // This will be called from the frontend which handles the Gemini AI directly
      // The backend can be used for logging and storing chat history
      res.json({
        success: true,
        message: 'Chat message received and can be logged',
      });
    } catch (error) {
      throw error;
    }
  }
}
