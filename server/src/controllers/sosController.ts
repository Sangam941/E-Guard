import { Request, Response } from 'express';
import { AlertService, NotificationService, ContactService } from '../services/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class SOSController {
  static async activate(req: Request, res: Response) {
    try {
      const { userId, location, silentMode, contactIds } = req.body;

      if (!userId || !location) {
        throw new AppError(400, 'Missing required fields: userId, location');
      }

      // Create alert
      const alert = AlertService.createAlert(userId, location, silentMode);

      // Get contact details and notify
      if (contactIds && contactIds.length > 0) {
        const contacts = contactIds
          .map((id: string) => ContactService.getContact(id))
          .filter(Boolean);

        alert.contacts = contactIds;

        // Send notifications
        await NotificationService.notifyContacts(contacts, alert.id, location);
      }

      res.json({
        success: true,
        alert: {
          id: alert.id,
          status: alert.status,
          createdAt: alert.createdAt,
          silentMode: alert.silentMode,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async deactivate(req: Request, res: Response) {
    try {
      const { alertId } = req.body;

      if (!alertId) {
        throw new AppError(400, 'Missing required field: alertId');
      }

      const alert = AlertService.resolveAlert(alertId);

      if (!alert) {
        throw new AppError(404, 'Alert not found');
      }

      res.json({
        success: true,
        alert: {
          id: alert.id,
          status: alert.status,
          resolvedAt: alert.resolvedAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStatus(req: Request, res: Response) {
    try {
      const { alertId } = req.query;

      if (!alertId) {
        throw new AppError(400, 'Missing required query param: alertId');
      }

      const alert = AlertService.getAlert(alertId as string);

      if (!alert) {
        throw new AppError(404, 'Alert not found');
      }

      res.json({
        alert: {
          id: alert.id,
          status: alert.status,
          location: alert.location,
          evidence: alert.evidence,
          createdAt: alert.createdAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
