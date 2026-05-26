/**
 * MOTOKA — Middleware de Routage
 * Protège les routes selon le rôle de l'utilisateur
 * 
 * Logique:
 * - SuperAdmin SaaS → /admin/saas/*
 * - Admin Agence → /app/*
 * - Chauffeur → /driver/*
 * - Client → /client/*
 * 
 * Redirection automatique + blocage des accès non-autorisés
 */

import { NextRequest, NextResponse } from "next/server";

// Cartographie des rôles vers leurs routes autorisées
const ROLE_ROUTES: Record<string, string[]> = {
  "Super Admin SaaS": ["/super-admin", "/admin"],
  "Admin Agence": ["/dashboard", "/courses", "/colis", "/vehicules", "/chauffeurs", "/caisse", "/utilisateurs", "/settings", "/rapports", "/succursales"],
  "Admin Succursale": ["/dashboard", "/courses", "/colis", "/vehicules", "/chauffeurs", "/caisse", "/utilisateurs", "/settings", "/rapports"],
  "Dispatcher": ["/dashboard", "/courses", "/colis", "/vehicules", "/chauffeurs", "/caisse"],
  "Comptable": ["/dashboard", "/caisse", "/rapports", "/settings"],
  "Chauffeur": ["/courses"],
  "Client": ["/client"],
};

// Routes publiques (sans authentification requise)
const PUBLIC_ROUTES = ["/login", "/", "/auth"];

/**
 * Retourne la route home selon le rôle
 */
export function getHomeRouteByRole(role: string | undefined): string {
  switch (role) {
    case "Super Admin SaaS":
      return "/super-admin";
    case "Admin Agence":
    case "Admin Succursale":
    case "Dispatcher":
    case "Comptable":
      return "/dashboard";
    case "Chauffeur":
      return "/courses";
    case "Client":
      return "/client";
    default:
      return "/login";
  }
}

/**
 * Vérifie si une route est autorisée pour un rôle donné
 */
export function isRouteAllowedForRole(pathname: string, role: string | undefined): boolean {
  if (!role) return PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some((r) => pathname.startsWith(r));
}

/**
 * Middleware Next.js (à configurer dans middleware.ts à la racine)
 * 
 * Usage: Appeler ce middleware dans le middleware.ts du projet
 */
export function motoka_routingMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques : laisser passer
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Récupérer la session depuis les headers (ou cookies)
  // ATTENTION: En production, valider le JWT/session token
  const sessionCookie = request.cookies.get("motoka_session")?.value;

  if (!sessionCookie) {
    // Pas de session : rediriger vers login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie));
    const { role } = session;

    // Vérifier si la route est autorisée
    if (!isRouteAllowedForRole(pathname, role)) {
      // Route non-autorisée : rediriger vers home
      const homeRoute = getHomeRouteByRole(role);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erreur parsing session middleware:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
