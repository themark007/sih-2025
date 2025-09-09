// src/stores/profileStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProfileStore = create(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      error: null,

      setProfile: (profile) => set({ profile, error: null, loading: false }),
      clearProfile: () => set({ profile: null, error: null }),

      loadProfileFromPhone: async (phone) => {
        if (!phone) {
          set({ error: "No phone provided", loading: false });
          return;
        }

        try {
          set({ loading: true, error: null });

          // Step 1: resolve user by phone
          const userRes = await fetch(
            `http://localhost:3000/api/users/by-phone?phone=${encodeURIComponent(phone)}`
          );
          const userData = await userRes.json();

          if (!userData.success || !userData.user) {
            set({ error: "User not found", loading: false });
            return;
          }
          const userId = userData.user.id;

          // Step 2: fetch profile by user id
          const profileRes = await fetch(
            `http://localhost:3000/api/profiles/by-user/${userId}`
          );
          const profileData = await profileRes.json();

          if (!profileData.success) {
            set({ profile: null, loading: false });
            return;
          }

          set({ profile: profileData.profile, loading: false, error: null });
        } catch (err) {
          set({ error: String(err.message || err), loading: false });
        }
      },
    }),
    {
      name: "agri-profile-store",
      getStorage: () => localStorage,
    }
  )
);

export default useProfileStore;
