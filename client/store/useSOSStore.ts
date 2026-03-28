import { create } from 'zustand';

export interface SOS {
  latitude: number;
  longitude: number;
  silentMode: boolean;
  status: 'active' | 'resolved' | 'false_alarm' | string;
  userId: string;
}

import { triggerSOS, getFirstSOS } from '@/api/sos';

export interface Helper {
  userId: string;
  name: string;
  distance: string | number;
  status: 'PENDING' | 'RESPONDING';
}

interface SOSState {
  sos: SOS | null;
  liveHelpers: Helper[];
  setLiveHelpers: (helpers: Helper[]) => void;
  updateHelperStatus: (userId: string, status: 'PENDING' | 'RESPONDING') => void;
  removeHelper: (userId: string) => void;
//   sosList: SOS[]; // Represents all SOSes fetched for the user
  setSOS: (sos: SOS | null) => void;
  clearSOS: () => void;
  createSOS: (latitude: number, longitude: number) => Promise<void>;
  fetchFirstSOS: () => Promise<void>;
//   fetchAllSOS: () => Promise<void>;
//   fetchSingleSOS: (id: string) => Promise<void>;
//   updateSOS: (id: string, status: 'active' | 'resolved' | 'false_alarm') => Promise<void>;
}

export const useSOSStore = create<SOSState>((set) => ({
  sos: null,
  liveHelpers: [],
  setLiveHelpers: (helpers) => set({ liveHelpers: helpers }),
  updateHelperStatus: (userId, status) => set((state) => ({
    liveHelpers: state.liveHelpers.map(h => h.userId === userId ? { ...h, status } : h)
  })),
  removeHelper: (userId) => set((state) => ({
    liveHelpers: state.liveHelpers.filter(h => h.userId !== userId)
  })),
//   sosList: [],
  setSOS: (sos) => set({ sos }),
  clearSOS: () => set({ sos: null }),

  createSOS: async (latitude, longitude) => {
    try {
      const sos = await triggerSOS(latitude, longitude);
      set({ sos });
    } catch (error) {
      console.error('Failed to create SOS:', error);
    }
  },

  fetchFirstSOS: async () => {
    try {
      const response = await getFirstSOS();
      set({ sos:response });
    } catch (error) {
      console.error('Failed to fetch all SOS records:', error);
    }
  },
//   fetchAllSOS: async () => {
//     try {
//       const response = await getUserSOS();
//       set({ sos:response });
//     } catch (error) {
//       console.error('Failed to fetch all SOS records:', error);
//     }
//   },

//   fetchSingleSOS: async (id: string) => {
//     try {
//       const response = await getSOS(id);
//       set({ sos: response?.data || null });
//     } catch (error) {
//       console.error('Failed to fetch SOS by id:', error);
//     }
//   },

//   updateSOS: async (id: string, status: 'active' | 'resolved' | 'false_alarm') => {
//     try {
//       const response = await updateSOSStatus(id, status);
//       set({ sos: response?.data || null });
//     } catch (error) {
//       console.error('Failed to update SOS status:', error);
//     }
//   },
}));