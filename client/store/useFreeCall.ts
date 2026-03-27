import { createFakeCall, getUserFakeCalls } from '@/api/fakeCall';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FreeCallStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface FreeCallData {
    userId: string;
    callerName: string;
    callerNumber: string;
    delaySeconds: number;
    duration: number;
    status: FreeCallStatus;
}

interface FreeCallState {
    fakeCall: FreeCallData[];
    setFakeCall: (callerName: string, callerNumber: string) => Promise<void>;
    fetchFreeCall: () => Promise<void>;
}

export const useFreeCallStore = create<FreeCallState>()(
    persist(
        (set) => ({
            fakeCall: [],

            fetchFreeCall: async () => {
                try {
                    const data = await getUserFakeCalls();
                    set({ fakeCall: data });
                } catch (error) {
                    console.log("error while fetch fake calls: ", error);
                }
            },

            setFakeCall: async (callerName: string, callerNumber: string) => {
                try {
                    const data = await createFakeCall(callerName, callerNumber);
                    set((state) => ({
                        fakeCall: [...state.fakeCall, data]
                    }));
                    await useFreeCallStore.getState().fetchFreeCall();
                    toast.success("one fake contact added");
                } catch (error) {
                    toast.error("error while creating fake contact");
                    console.error('Failed to call API in setFreeCall:', error);
                }
            }
        }),
        {
            name: 'free-call-storage',
        }
    )
);
