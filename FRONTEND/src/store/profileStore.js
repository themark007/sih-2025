// profileStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProfileStore = create(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "agri-profile-store", // localStorage key
      getStorage: () => localStorage,
    }
  )
);

export default useProfileStore;
