import { create } from 'zustand';
import * as sosApi from '../api/sos';
import * as contactsApi from '../api/contacts';
import * as fakeCallApi from '../api/fakeCall';
import * as uploadApi from '../api/upload';

// Check for existing auth on initialization
const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        return JSON.parse(auth);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialUser = getInitialAuth();

// We'll use a mock user ID for now since authentication isn't implemented
const MOCK_USER_ID = initialUser?.id || 'mock-user-123';

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
  // Authentication
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  
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
  
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  
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
  // Authentication
  isAuthenticated: !!initialUser,
  user: initialUser,
  
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
        userId: MOCK_USER_ID,
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
        userId: MOCK_USER_ID,
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
      const res = await contactsApi.getContacts(MOCK_USER_ID);
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
        userId: MOCK_USER_ID,
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
      formData.append('userId', MOCK_USER_ID);
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

  // Authentication methods
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Replace with actual API call
      // const res = await apiService.auth.login(email, password);
      
      // Mock login for now
      if (email && password) {
        const mockUser = { id: 'user-123', email, name: email.split('@')[0] };
        set({ 
          isAuthenticated: true, 
          user: mockUser, 
          isLoading: false 
        });
        // Store in localStorage for persistence
        localStorage.setItem('auth', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Replace with actual API call for registration only
      // const res = await apiService.auth.register(userData);
      
      // Mock registration for now (just simulate success, don't auto-login)
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem('auth');
  },
}));
