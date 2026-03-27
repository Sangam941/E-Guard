import { create } from 'zustand';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface AppState {
  isSOSActive: boolean;
  isSilentModeActive: boolean;
  isFakeCallActive: boolean;
  location: { lat: number; lng: number } | null;
  contacts: Contact[];
  evidence: { type: 'photo' | 'video' | 'audio'; url: string; timestamp: Date }[];
  
  activateSOS: () => void;
  deactivateSOS: () => void;
  toggleSilentMode: () => void;
  triggerFakeCall: () => void;
  endFakeCall: () => void;
  setLocation: (loc: { lat: number; lng: number }) => void;
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  addEvidence: (item: { type: 'photo' | 'video' | 'audio'; url: string; timestamp: Date }) => void;
}

export const useStore = create<AppState>((set) => ({
  isSOSActive: false,
  isSilentModeActive: false,
  isFakeCallActive: false,
  location: null,
  contacts: [
    { id: '1', name: 'Dad', phone: '+1234567890', relation: 'Parent' },
    { id: '2', name: 'Mom', phone: '+0987654321', relation: 'Parent' },
  ],
  evidence: [],

  activateSOS: () => set({ isSOSActive: true }),
  deactivateSOS: () => set({ isSOSActive: false }),
  toggleSilentMode: () => set((state) => ({ isSilentModeActive: !state.isSilentModeActive })),
  triggerFakeCall: () => set({ isFakeCallActive: true }),
  endFakeCall: () => set({ isFakeCallActive: false }),
  setLocation: (location) => set({ location }),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
  addEvidence: (item) => set((state) => ({ evidence: [item, ...state.evidence] })),
}));
