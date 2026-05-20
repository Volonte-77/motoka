import { create } from "zustand";
import localforage from "localforage";
import { STORAGE_KEYS, SessionUser } from "@/components/saas-mock";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  initializeAuth: () => Promise<void>;
  login: (userSession: SessionUser) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  // Initialisation : charge la session au démarrage depuis localforage
  initializeAuth: async () => {
    try {
      const savedSession = await localforage.getItem<SessionUser>(STORAGE_KEYS.CURRENT_SESSION);
      set({ user: savedSession, loading: false });
    } catch (error) {
      console.error("Erreur d'initialisation de session :", error);
      set({ user: null, loading: false });
    }
  },

  // Connexion de l'utilisateur
  login: async (userSession) => {
    set({ user: userSession });
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, userSession);
  },

  // Déconnexion de l'utilisateur
  logout: async () => {
    set({ user: null });
    await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },
}));