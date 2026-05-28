import { create } from "zustand";
import localforage from "localforage";
import { STORAGE_KEYS, SessionUser, UserRole } from "@/types";
import apiClient from "@/lib/api-client";

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
  loginReel: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchAgency: (agencyId: string | null) => Promise<void>;  // Pour SuperAdmin
  switchBranch: (branchId: string | null) => Promise<void>;  // Pour Admin Agence
  setOfflineStatus: (offline: boolean) => void;
  addToSyncQueue: (action: any) => void;
  clearSyncQueue: () => void;
}

// Helper pour mapper les rôles Laravel vers le Frontend
const mapBackendRoleToFrontend = (role: string): UserRole => {
  switch (role) {
    case 'superAdmin': return "Super Admin SaaS";
    case 'adminAgence': return "Admin Agence";
    case 'dispatcher': return "Dispatcher";
    case 'chauffeur': return "Chauffeur";
    case 'adminSuccursale': return "Admin Succursale";
    default: return "Client";
  }
};

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
      const savedSession = await localforage.getItem<SessionUser & { token?: string }>(
        STORAGE_KEYS.CURRENT_SESSION
      );
      if (savedSession) {
        set({ user: savedSession, loading: false });
        document.cookie = `motoka_session=${encodeURIComponent(JSON.stringify(savedSession))}; path=/; max-age=86400`;
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error("Erreur d'initialisation de session :", error);
      set({ user: null, loading: false });
    }
  },

  // ========================================================================
  // CONNEXION RÉELLE (Laravel Sanctum)
  // ========================================================================
  loginReel: async (email, password) => {
    set({ loading: true });
    try {
      const response = await apiClient.post("/login", { email, password });
      const { user, token } = response.data;

      const sessionUser: SessionUser & { token: string } = {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: mapBackendRoleToFrontend(user.role_enum),
        agencyId: user.Idagence ? user.Idagence.toString() : null,
        branchId: user.Idsuccursale ? user.Idsuccursale.toString() : null,
        siteAccess: user.role_enum === 'superAdmin' 
          ? 'Global' 
          : (user.Idsuccursale ? user.succursale?.nom || 'Succursale' : user.agence?.nom || 'Agence'),
        token: token,
      };

      await get().login(sessionUser);
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.message || "Erreur d'authentification");
    } finally {
      set({ loading: false });
    }
  },

  // ========================================================================
  // CONNEXION (Mise en cache)
  // ========================================================================
  login: async (userSession: SessionUser) => {
    set({ user: userSession });
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, userSession);
    // SET COOKIE POUR LE MIDDLEWARE
    document.cookie = `motoka_session=${encodeURIComponent(JSON.stringify(userSession))}; path=/; max-age=86400`;
  },

  // ========================================================================
  // DÉCONNEXION
  // ========================================================================
  logout: async () => {
    try {
      await apiClient.post("/logout");
    } catch (e) {
      console.warn("Logout backend failed or session already cleared");
    }
    set({ user: null, syncQueue: [] });
    await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    // CLEAR COOKIE POUR LE MIDDLEWARE
    document.cookie = "motoka_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

    set({ user: updatedUser });
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

    set({ user: updatedUser });
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
