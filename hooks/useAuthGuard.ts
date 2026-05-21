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
      router.push("/login");
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole && user.role !== requiredRole) {
      const homeRoute = getHomeRouteByRole(user.role);
      router.push(homeRoute);
      return;
    }

    // Vérifier dans le tableau de rôles autorisés
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const homeRoute = getHomeRouteByRole(user.role);
      router.push(homeRoute);
      return;
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
