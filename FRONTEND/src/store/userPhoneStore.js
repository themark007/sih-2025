// src/stores/userPhoneStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserPhoneStore = create(
  persist(
    (set) => ({
      phone: null,
      setPhone: (phone) => set({ phone }),
      clearPhone: () => set({ phone: null }),
    }),
    {
      name: 'user-phone-store', // key in localStorage
      getStorage: () => localStorage, // (default) use localStorage
    }
  )
);

export default useUserPhoneStore;
