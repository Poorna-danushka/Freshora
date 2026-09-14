import type { Location } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  selectedLocation: Location | null;
  setLocation: (location: Location) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setLocation: (location) => set({ selectedLocation: location }),
      clearLocation: () => set({ selectedLocation: null }),
    }),
    { name: 'freshora-location' }
  )
);
