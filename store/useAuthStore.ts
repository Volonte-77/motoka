import { create } from "zustand";
import localforage from "localforage";
import { STORAGE_KEYS, SessionUser } from "@/types";

interface AuthState {
  // User & Session
  user: SessionUser | null;
  loading: boolean;
  
  // Offline-First
  isOffline: boolean;
  syncQueue: any[];
  
  // Methods
  initializeAuth: () => Promise<void>;
  login: (userSession: SessionUser) => Promise<void>;
  logout: () => Promise<void>;
  switchAgency: (agencyId: string | null) => Promise<void>;  // Pour SuperAdmin
  switchBranch: (branchId: string | null) => Promise<void>;  // Pour Admin Agence
  setOfflineStatus: (offline: boolean) => void;
  addToSyncQueue: (action: any) => void;
  clearSyncQueue: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isOffline: false,
  syncQueue: [],

  // ========================================================================
  // INITIALISATION DE L'AUTHENTIFICATION
  // ========================================================================
  initializeAuth: async () => {
    try {
      const savedSession = await localforage.getItem<SessionUser>(
        STORAGE_KEYS.CURRENT_SESSION
      );
      set({ user: savedSession, loading: false });
    } catch (error) {
      console.error("Erreur d'initialisation de session :", error);
      set({ user: null, loading: false });
    }
  },

  // ========================================================================
  // CONNEXION
  // ========================================================================
  login: async (userSession: SessionUser) => {
    set({ user: userSession });
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, userSession);
  },

  // ========================================================================
  // DÉCONNEXION
  // ========================================================================
  logout: async () => {
    set({ user: null, syncQueue: [] });
    await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  // ========================================================================
  // CHANGEMENT D'AGENCE (SuperAdmin uniquement)
  // ========================================================================
  switchAgency: async (agencyId: string | null) => {
    const { user } = get();
    if (!user || user.role !== "Super Admin SaaS") {
      console.warn("Seul le Super Admin peut changer d'agence");
      return;
    }

    const updatedUser: SessionUser = {
      ...user,
      agencyId, 
      branchId: null, // Reset de la succursale lors du changement d'agence
    };

    await set({ user: updatedUser });
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, updatedUser);
  },

  // ========================================================================
  // CHANGEMENT DE SUCCURSALE (Admin Agence uniquement)
  // ========================================================================
  switchBranch: async (branchId: string | null) => {
    const { user } = get();
    if (!user || (user.role !== "Admin Agence" && user.role !== "Super Admin SaaS")) {
      console.warn("Permission insuffisante pour changer de succursale");
      return;
    }

    const updatedUser: SessionUser = {
      ...user,
      branchId,
    };

    await set({ user: updatedUser });
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, updatedUser);
  },

  // ========================================================================
  // GESTION DU MODE OFFLINE
  // ========================================================================
  setOfflineStatus: (offline: boolean) => {
    set({ isOffline: offline });
  },

  // ========================================================================
  // QUEUE DE SYNCHRONISATION (Actions en attente)
  // ========================================================================
  addToSyncQueue: (action: any) => {
    const { syncQueue } = get();
    set({ syncQueue: [...syncQueue, action] });
  },

  clearSyncQueue: () => {
    set({ syncQueue: [] });
  },
}));