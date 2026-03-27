import { v4 as uuidv4 } from 'uuid';

export interface Location {
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'SOS' | 'FAKE_CALL' | 'CUSTOM';
  location: Location;
  contacts: string[];
  evidence: string[]; // URLs
  message?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  createdAt: Date;
  resolvedAt?: Date;
  silentMode: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relation: string;
  createdAt: Date;
}

export interface Evidence {
  id: string;
  alertId: string;
  type: 'PHOTO' | 'VIDEO' | 'AUDIO';
  url: string;
  uploadedAt: Date;
}

export class AlertModel {
  static create(userId: string, data: Partial<Alert>): Alert {
    return {
      id: uuidv4(),
      userId,
      type: data.type || 'SOS',
      location: data.location || { lat: 0, lng: 0 },
      contacts: data.contacts || [],
      evidence: data.evidence || [],
      message: data.message || '',
      status: 'ACTIVE',
      createdAt: new Date(),
      silentMode: data.silentMode || false,
    };
  }
}

export class ContactModel {
  static create(userId: string, data: Partial<Contact>): Contact {
    return {
      id: uuidv4(),
      userId,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email,
      relation: data.relation || '',
      createdAt: new Date(),
    };
  }
}
