import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';

export class FakeCallController {
  static async trigger(req: Request, res: Response) {
    try {
      const { userId, contactName, callDuration } = req.body;

      if (!userId || !contactName) {
        throw new AppError(400, 'Missing required fields: userId, contactName');
      }

      res.json({
        success: true,
        message: 'Fake call triggered successfully',
        data: {
          contactName,
          callDuration: callDuration || 0,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async end(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        throw new AppError(400, 'Missing required field: userId');
      }

      res.json({
        success: true,
        message: 'Fake call ended',
      });
    } catch (error) {
      throw error;
    }
  }
}
