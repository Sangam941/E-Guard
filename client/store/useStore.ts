import { create } from 'zustand';
import * as sosApi from '../api/sos';
import * as contactsApi from '../api/contacts';
import * as fakeCallApi from '../api/fakeCall';
import * as uploadApi from '../api/upload';


export interface Contact {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  relationship?: string;
  relation?: string; // For backward compatibility with components
  isPrimary?: boolean;
}

interface AppState {
  isSOSActive: boolean;
  currentSOSId: string | null;
  isSilentModeActive: boolean;
  isFakeCallActive: boolean;
  currentFakeCallId: string | null;
  location: { lat: number; lng: number } | null;
  contacts: Contact[];
  evidence: { type: 'photo' | 'video' | 'audio'; url: string; timestamp: Date }[];
  isLoading: boolean;
  error: string | null;
  
  activateSOS: (address?: string) => Promise<void>;
  deactivateSOS: () => Promise<void>;
  toggleSilentMode: () => void;
  triggerFakeCall: (callerName: string, callerNumber: string) => Promise<void>;
  endFakeCall: () => Promise<void>;
  setLocation: (loc: { lat: number; lng: number }) => void;
  
  // Contacts
  fetchContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | '_id'>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  
  // Evidence
  addEvidence: (file: File | Blob, type: 'photo' | 'video' | 'audio') => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  isSOSActive: false,
  currentSOSId: null,
  isSilentModeActive: false,
  isFakeCallActive: false,
  currentFakeCallId: null,
  location: null,
  contacts: [],
  evidence: [],
  isLoading: false,
  error: null,

  activateSOS: async (address?: string) => {
    try {
      set({ isLoading: true, error: null });
      const { location, isSilentModeActive } = get();
      
      const res = await sosApi.triggerSOS({
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        address: address || '',
        silentMode: isSilentModeActive
      });
      
      set({ isSOSActive: true, currentSOSId: res.data._id, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, isSOSActive: true }); // keep true for UI optimism
    }
  },

  deactivateSOS: async () => {
    try {
      const { currentSOSId } = get();
      if (currentSOSId) {
        await sosApi.updateSOSStatus(currentSOSId, 'resolved');
      }
      set({ isSOSActive: false, currentSOSId: null });
    } catch (error: any) {
      set({ error: error.message });
      set({ isSOSActive: false }); // force deactivate
    }
  },

  toggleSilentMode: () => set((state) => ({ isSilentModeActive: !state.isSilentModeActive })),

  triggerFakeCall: async (callerName: string = 'Mom', callerNumber: string = '+1234567890') => {
    try {
      set({ isLoading: true, error: null });
      const res = await fakeCallApi.createFakeCall({
        callerName,
        callerNumber,
      });
      set({ isFakeCallActive: true, currentFakeCallId: res.data._id, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, isFakeCallActive: true });
    }
  },

  endFakeCall: async () => {
    try {
      const { currentFakeCallId } = get();
      if (currentFakeCallId) {
        await fakeCallApi.stopFakeCall(currentFakeCallId);
      }
      set({ isFakeCallActive: false, currentFakeCallId: null });
    } catch (error: any) {
      set({ error: error.message });
      set({ isFakeCallActive: false });
    }
  },

  setLocation: (location) => set({ location }),

  fetchContacts: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await contactsApi.getContacts();
      // Map _id to id for existing components
      const contacts = res.data.map((c: any) => ({
        ...c,
        id: c._id,
        relation: c.relationship
      }));
      set({ contacts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addContact: async (contact) => {
    try {
      set({ isLoading: true, error: null });
      const payload = {
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relation || contact.relationship,
        isPrimary: contact.isPrimary
      };
      const res = await contactsApi.createContact(payload);
      
      const newContact = {
        ...res.data,
        id: res.data._id,
        relation: res.data.relationship
      };
      
      set((state) => ({ 
        contacts: [...state.contacts, newContact],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeContact: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await contactsApi.deleteContact(id);
      set((state) => ({ 
        contacts: state.contacts.filter((c) => c.id !== id && c._id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addEvidence: async (file, type) => {
    try {
      set({ isLoading: true, error: null });
      const { currentSOSId } = get();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (currentSOSId) {
        formData.append('sosId', currentSOSId);
      }

      const res = await uploadApi.uploadEvidence(formData);
      
      const newEvidence = {
        type: res.data.type,
        url: res.data.fileUrl,
        timestamp: new Date(res.data.timestamp || Date.now())
      };
      
      set((state) => ({ 
        evidence: [newEvidence, ...state.evidence],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
