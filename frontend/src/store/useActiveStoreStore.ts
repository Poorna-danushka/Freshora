import type { Store } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveStoreState {
  activeStore: Store | null;
  setActiveStore: (store: Store) => void;
  clearActiveStore: () => void;
}

export const useActiveStoreStore = create<ActiveStoreState>()(
  persist(
    (set) => ({
      activeStore: null,
      setActiveStore: (store) => set({ activeStore: store }),
      clearActiveStore: () => set({ activeStore: null }),
    }),
    { name: 'freshora-active-store' }
  )
);
