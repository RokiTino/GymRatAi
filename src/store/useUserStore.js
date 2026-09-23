import { create } from 'zustand';

export const useUserStore = create((set) => ({
  profile: null,
  currentPlan: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearUser: () => set({ profile: null, currentPlan: null }),
}));
