/**
 * MOTOKA — useAuthGuard Hook
 * Protections côté client pour les redirections de rôle
 * 
 * Usage:
 * - useAuthGuard() : redirige si pas authentifié
 * - useAuthGuard("Admin Agence") : redirige si rôle != Admin Agence
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";
import { getHomeRouteByRole } from "@/lib/routing-middleware";

/**
 * Hook: Protège une page selon l'authentification et le rôle
 * 
 * @param requiredRole - Rôle requis (optionnel). Si absent, vérifie juste l'authentification.
 * @param allowedRoles - Tableau de rôles autorisés (alternative à requiredRole)
 */
export function useAuthGuard(
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Attendre le chargement de la session
    if (loading) return;

    // Pas d'utilisateur : rediriger vers login
    if (!user) {
      console.log("[useAuthGuard] Pas d'utilisateur, redirection vers /login");
      router.push("/login");
      return;
    }

    // --- LOGIQUE DE VALIDATION DES RÔLES ---
    let isAllowed = true;

    // 1. Vérifier requiredRole (exclusif)
    if (requiredRole && user.role !== requiredRole) {
      isAllowed = false;
    }

    // 2. Vérifier allowedRoles (inclusif)
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      isAllowed = false;
    }

    if (!isAllowed) {
      const homeRoute = getHomeRouteByRole(user.role);
      console.warn(`[useAuthGuard] Rôle ${user.role} non autorisé. Redirection vers ${homeRoute}`);
      router.push(homeRoute);
    }
  }, [user, loading, requiredRole, allowedRoles, router]);

  // Retourner l'état pour les composants qui en ont besoin
  return {
    user,
    loading,
    isAuthenticated: !!user,
    canAccess: user && (!requiredRole || user.role === requiredRole),
  };
}

/**
 * Hook: Vérifie simplement si l'utilisateur a accès aux données d'une agence donnée
 * (Multi-tenant isolation)
 * 
 * Règles:
 * - SuperAdmin : peut accéder à n'importe quelle agence
 * - Autres rôles : uniquement leur agencyId
 */
export function useMultiTenantAccess(agencyId: string | null) {
  const { user } = useAuthStore();

  if (!user) return false;

  // SuperAdmin peut accéder à tout
  if (user.role === "Super Admin SaaS") return true;

  // Autres rôles : doivent matcher agencyId
  return user.agencyId === agencyId;
}

/**
 * Hook: Obtenir le contexte tenant actuel pour filtrer les données
 * Retourne agencyId ou null selon le rôle
 */
import { useMemo } from "react";

export function useTenantContext() {
  const { user } = useAuthStore();

  return useMemo(() => {
    if (!user) return null;

    // SuperAdmin voit tout (agencyId = null = pas de filtre)
    if (user.role === "Super Admin SaaS") {
      return { agencyId: null, viewAll: true };
    }

    // Autres rôles : filtrer par leur agencyId
    return {
      agencyId: user.agencyId,
      viewAll: false,
    };
  }, [user?.agencyId, user?.role]);
}
