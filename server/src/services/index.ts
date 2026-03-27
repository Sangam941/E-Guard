import { Alert, Contact, Location } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
let alerts: Alert[] = [];
let contacts: Contact[] = [];

export class AlertService {
  static createAlert(userId: string, location: Location, silentMode: boolean = false) {
    const alert: Alert = {
      id: uuidv4(),
      userId,
      type: 'SOS',
      location,
      contacts: [],
      evidence: [],
      status: 'ACTIVE',
      createdAt: new Date(),
      silentMode,
    };
    alerts.push(alert);
    return alert;
  }

  static getAlert(alertId: string) {
    return alerts.find(a => a.id === alertId);
  }

  static getAllAlerts(userId: string) {
    return alerts.filter(a => a.userId === userId);
  }

  static updateAlert(alertId: string, data: Partial<Alert>) {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return null;

    Object.assign(alert, {
      ...data,
      id: alert.id, // Prevent ID change
      userId: alert.userId, // Prevent userId change
      createdAt: alert.createdAt, // Prevent date change
    });
    return alert;
  }

  static resolveAlert(alertId: string) {
    return this.updateAlert(alertId, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
    });
  }

  static addEvidence(alertId: string, evidenceUrl: string) {
    const alert = this.getAlert(alertId);
    if (!alert) return null;
    alert.evidence.push(evidenceUrl);
    return alert;
  }
}

export class ContactService {
  static createContact(userId: string, name: string, phone: string, relation: string, email?: string): Contact {
    const contact: Contact = {
      id: uuidv4(),
      userId,
      name,
      phone,
      email,
      relation,
      createdAt: new Date(),
    };
    contacts.push(contact);
    return contact;
  }

  static getContact(contactId: string) {
    return contacts.find(c => c.id === contactId);
  }

  static getUserContacts(userId: string) {
    return contacts.filter(c => c.userId === userId);
  }

  static updateContact(contactId: string, data: Partial<Contact>) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return null;

    contact.name = data.name || contact.name;
    contact.phone = data.phone || contact.phone;
    contact.email = data.email || contact.email;
    contact.relation = data.relation || contact.relation;

    return contact;
  }

  static deleteContact(contactId: string) {
    const index = contacts.findIndex(c => c.id === contactId);
    if (index === -1) return false;
    contacts.splice(index, 1);
    return true;
  }
}

export class NotificationService {
  static async sendSMS(phone: string, message: string) {
    // Integration with Twilio or similar SMS service
    console.log(`[SMS] Sending to ${phone}: ${message}`);
    return { success: true, messageId: uuidv4() };
  }

  static async sendEmail(email: string, subject: string, message: string) {
    // Integration with email service
    console.log(`[EMAIL] Sending to ${email}: ${subject}`);
    return { success: true, messageId: uuidv4() };
  }

  static async notifyContacts(contacts: Contact[], alertId: string, location: Location) {
    const message = `[E-Guard AI Alert] Emergency alert triggered! Location: ${location.lat}, ${location.lng}. Alert ID: ${alertId}`;

    const results = await Promise.all(
      contacts.map(contact => 
        this.sendSMS(contact.phone, message).catch(err => {
          console.error(`Failed to notify ${contact.name}:`, err);
          return { success: false };
        })
      )
    );

    return results;
  }
}
