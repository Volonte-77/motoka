"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import localforage from "localforage";
import { STORAGE_KEYS, SessionUser } from "@/components/saas-mock";

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (userSession: SessionUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger la session persistée au démarrage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = await localforage.getItem<SessionUser>(STORAGE_KEYS.CURRENT_SESSION);
        if (savedSession) {
          setUser(savedSession);
        }
      } catch (error) {
        console.error("Erreur de récupération de session :", error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (userSession: SessionUser) => {
    setUser(userSession);
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, userSession);
  };

  const logout = async () => {
    setUser(null);
    await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer l'authentification n'importe où
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}