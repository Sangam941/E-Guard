import { Request, Response } from 'express';
import { AlertService } from '../services/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class AlertController {
  static async getAll(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        throw new AppError(400, 'Missing required query param: userId');
      }

      const alerts = AlertService.getAllAlerts(userId as string);

      res.json({
        success: true,
        alerts: alerts.map(a => ({
          id: a.id,
          type: a.type,
          status: a.status,
          location: a.location,
          silentMode: a.silentMode,
          createdAt: a.createdAt,
          resolvedAt: a.resolvedAt,
          evidenceCount: a.evidence.length,
        })),
      });
    } catch (error) {
      throw error;
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { alertId } = req.params;

      if (!alertId) {
        throw new AppError(400, 'Missing alertId param');
      }

      const alert = AlertService.getAlert(alertId);

      if (!alert) {
        throw new AppError(404, 'Alert not found');
      }

      res.json({
        success: true,
        alert: {
          id: alert.id,
          type: alert.type,
          status: alert.status,
          location: alert.location,
          evidence: alert.evidence,
          silentMode: alert.silentMode,
          createdAt: alert.createdAt,
          resolvedAt: alert.resolvedAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
