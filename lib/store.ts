import { create } from "zustand";
import type { User, SamaritanAlert, Business } from "./types";

interface StoreState {
  // Users
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  updateUser: (user: User) => void;

  // Samaritan Alerts
  samaritanAlerts: SamaritanAlert[];
  addSamaritanAlert: (alert: SamaritanAlert) => void;
  resolveSamaritanAlert: (alertId: string) => void;
  respondToAlert: (alertId: string, userId: string) => void;

  // Businesses
  businesses: Business[];
  addBusinessRecommendation: (businessId: string, userId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Users
  currentUser: null,
  users: [],
  setCurrentUser: (user) => set({ currentUser: user }),
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
      currentUser: state.currentUser?.id === user.id ? user : state.currentUser,
    })),

  // Samaritan Alerts
  samaritanAlerts: [],
  addSamaritanAlert: (alert) =>
    set((state) => ({
      samaritanAlerts: [alert, ...state.samaritanAlerts],
    })),
  resolveSamaritanAlert: (alertId) =>
    set((state) => ({
      samaritanAlerts: state.samaritanAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
      ),
    })),
  respondToAlert: (alertId, userId) =>
    set((state) => ({
      samaritanAlerts: state.samaritanAlerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              responses: [...(alert.responses || []), userId],
            }
          : alert
      ),
    })),

  // Businesses
  businesses: [],
  addBusinessRecommendation: (businessId, userId) =>
    set((state) => ({
      businesses: state.businesses.map((b) =>
        b.id === businessId
          ? {
              ...b,
              communityRecommendations: [
                ...new Set([...b.communityRecommendations, userId]),
              ],
            }
          : b
      ),
    })),
}));
