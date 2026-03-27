import { Request, Response } from 'express';
import { ContactService } from '../services/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ContactController {
  static async create(req: Request, res: Response) {
    try {
      const { userId, name, phone, relation, email } = req.body;

      if (!userId || !name || !phone || !relation) {
        throw new AppError(400, 'Missing required fields');
      }

      const contact = ContactService.createContact(userId, name, phone, relation, email);

      res.status(201).json({
        success: true,
        contact,
      });
    } catch (error) {
      throw error;
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        throw new AppError(400, 'Missing required query param: userId');
      }

      const contacts = ContactService.getUserContacts(userId as string);

      res.json({
        success: true,
        contacts,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { contactId } = req.params;
      const { name, phone, relation, email } = req.body;

      if (!contactId) {
        throw new AppError(400, 'Missing contactId param');
      }

      const contact = ContactService.updateContact(contactId, {
        name,
        phone,
        relation,
        email,
      });

      if (!contact) {
        throw new AppError(404, 'Contact not found');
      }

      res.json({
        success: true,
        contact,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { contactId } = req.params;

      if (!contactId) {
        throw new AppError(400, 'Missing contactId param');
      }

      const success = ContactService.deleteContact(contactId);

      if (!success) {
        throw new AppError(404, 'Contact not found');
      }

      res.json({
        success: true,
        message: 'Contact deleted',
      });
    } catch (error) {
      throw error;
    }
  }
}
