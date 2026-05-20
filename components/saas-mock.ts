export type SubscriptionPlan = "Basique" | "Standard" | "Premium";
export type SubscriptionStatus = "Actif" | "Expiré" | "Essai";
export type UserRole = "Super Admin SaaS" | "Admin Agence" | "Dispatcher / Opérateur" | "Chauffeur" | "Client";

export interface Agency {
  id: string;
  name: string;
  email: string;
  city: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string;
  createdAt: string;
  branches?: string[]; // Extensible de manière optionnelle pour le multi-sites
}

export interface CashTransaction {
  id: string;
  type: "Entrée" | "Sortie";
  amount: number;
  description: string;
  category: "Billet" | "Fret" | "Carburant" | "Maintenance" | "Autre";
  timestamp: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string | null; // null pour le Super Admin SaaS
  siteAccess: string;       // "Global" ou le nom d'un site spécifique (ex: "Goma Dépôt")
}

// Interface globale pour la BDD locale d'utilisateurs
export interface AppUser extends SessionUser {
  password?: string;
  phone?: string;
  vehicleAssigned?: string;
  joinedDate?: string;
  license?: string;
  vehicle?:string;
  rating?:string;
}

// Données par défaut pour tester le Super Admin
export const defaultAgencies: Agency[] = [
  { id: "AGE-001", name: "Kasongo Express", email: "contact@kasongo.cd", city: "Goma", plan: "Premium", status: "Actif", expiresAt: "2026-12-31", createdAt: "2026-01-10", branches: ["Goma Centre", "Goma Dépôt"] },
  { id: "AGE-002", name: "Kivu Motors", email: "info@kivumotors.com", city: "Beni", plan: "Standard", status: "Essai", expiresAt: "2026-06-15", createdAt: "2026-05-01", branches: ["Beni Antenne"] },
  { id: "AGE-003", name: "Virunga Voyage", email: "direction@virunga.cd", city: "Butembo", plan: "Basique", status: "Expiré", expiresAt: "2026-04-20", createdAt: "2025-10-05", branches: ["Butembo Centre"] },
];

// Clés constantes pour localforage conformes à vos exigences
export const STORAGE_KEYS = {
  CURRENT_SESSION: "motoka_current_session",
  AGENCIE_LIST: "saas_agencies_data",
  USERS_LIST: "motoka_users_data" // Ajouté pour l'identification réelle
};