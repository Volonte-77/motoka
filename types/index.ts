/**
 * MOTOKA — Types & Interfaces Augmentées
 * Architecture Multi-Agences, Multi-Tenant, Multi-Rôles
 * 
 * Structure centralisée pour garantir la cohérence et le cloisonnement des données.
 */

// ============================================================================
// ENUMS & TYPES ÉNUMÉRÉS
// ============================================================================

export type UserRole = 
  | "Super Admin SaaS"
  | "Admin Agence"
  | "Admin Succursale"
  | "Dispatcher"
  | "Comptable"
  | "Chauffeur"
  | "Client";

export type SubscriptionPlan = "Basique" | "Standard" | "Premium";
export type SubscriptionStatus = "Actif" | "Essai" | "Expiré";

export type TripStatus = "Planifiée" | "En cours" | "Terminée" | "Annulée";
export type VehicleStatus = "Disponible" | "Mission" | "Maintenance" | "Hors service";
export type PackageStatus = "En attente" | "En transit" | "Livré" | "Annulé";
export type CashTransactionType = "Entrée" | "Sortie";
export type CashCategory = "Billet" | "Fret" | "Carburant" | "Maintenance" | "Autre";

// ============================================================================
// UTILISATEURS & AUTHENTIFICATION
// ============================================================================

/**
 * Utilisateur en session (après authentification)
 * Champ clé: agencyId = null pour SuperAdmin (vue globale)
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string | null;        // null = SuperAdmin (vue globale), sinon ID agence
  branchId: string | null;        // null = Vue globale agence ou SuperAdmin
  siteAccess: string;              // "Global" ou nom du site spécifique
  driverId?: string;               // Si Chauffeur assigné
  clientId?: string;               // Si Client agence
  mustChangePassword?: boolean;    // Pour forcer le changement au premier login
}

/**
 * Utilisateur applicatif complet (stocké dans localforage)
 */
export interface AppUser extends SessionUser {
  password?: string;
  phone?: string;
  vehicleAssigned?: string;
  joinedDate?: string;
  license?: string;
  status?: VehicleStatus;
  rating?: string;
}

// ============================================================================
// AGENCES & SUCCURSALES
// ============================================================================

export interface Agency {
  id: string;
  name: string;
  email: string;
  city: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string;
  createdAt: string;
  logo?: string;
}

export interface Branch {
  id: string;
  agencyId: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  managerId?: string;
  createdAt: string;
}

// ============================================================================
// VÉHICULES (Parc automobile)
// ============================================================================

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  type: "Bus" | "Taxi" | "Camion" | "Moto" | "Autre";
  status: VehicleStatus;
  owner: "Agence Interne" | "Chauffeur Partenaire" | string;
  mileage: string;
  lastService: string;
  agencyId: string;                // Cloisonnement: propriétaire agence
  branchId: string | null;         // Assignation à une succursale spécifique
}

// ============================================================================
// COURSES / TRAJETS
// ============================================================================

export interface Trip {
  id: string;
  route: string;                   // Format: "Goma → Butembo"
  driver: string;                  // Nom du chauffeur
  vehicle: string;                 // Format: "Bus Coaster (C042-GMA)"
  vehicleId?: string;              // Référence à la clé Vehicle pour les requêtes
  driverId?: string;               // Référence au chauffeur pour les mises à jour
  status: TripStatus;
  departureTime: string;           // Format: "20/05/2026 à 07:30"
  eta: string;                     // Format: "Env. 6 heures"
  passengers: number;
  load: string;                    // Description du fret
  agencyId: string;                // Cloisonnement multi-agence
  branchId: string | null;         // Succursale de départ
}

// ============================================================================
// COLIS / FRET & SUIVI
// ============================================================================

export interface Package {
  id: string;
  sender: string;
  receiver: string;
  phoneReceiver: string;
  description: string;
  route: string;
  status: PackageStatus;
  weight: string;
  value: string;
  otp: string;                     // One-Time Password pour vérification à la livraison
  agencyId: string;                // Cloisonnement multi-agence
  branchId: string | null;         // Succursale d'enregistrement
  tripId?: string;                 // Lien optionnel avec la course transportant le colis
}

// ============================================================================
// TRANSACTIONS DE CAISSE
// ============================================================================

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  amount: number;
  description: string;
  category: CashCategory;
  timestamp: string;
  agencyId: string;                // Cloisonnement multi-agence
  branchId: string | null;         // Succursale concernée
  userId?: string;                 // Qui a enregistré la transaction
}

// ============================================================================
// CLÉS DE PERSISTANCE LOCALFORAGE (Centralisées)
// ============================================================================

export const STORAGE_KEYS = {
  // Auth & Session
  CURRENT_SESSION: "motoka_current_session",
  
  // Agences & Succursales (SaaS Admin)
  AGENCIE_LIST: "saas_agencies_data",
  BRANCH_LIST: "motoka_branches_data",
  
  // Utilisateurs
  USERS_LIST: "motoka_users_data",
  
  // Données opérationnelles (Offline-First)
  VEHICLES_LIST: "volenium_vehicles_list",
  TRIPS_LIST: "volenium_trips_list",
  PACKAGES_LIST: "volenium_packages_list",
  CASH_TRANSACTIONS: "motoka_cash_transactions",
  
  // Sync queue (pour résolution de conflits offline)
  SYNC_QUEUE: "motoka_sync_queue",
} as const;

// ============================================================================
// TYPES UTILITAIRES POUR L'ARCHITECTURE
// ============================================================================

/**
 * État global de synchronisation et authentification
 */
export interface AuthStoreState {
  user: SessionUser | null;
  loading: boolean;
  isOffline: boolean;
  syncQueue: any[];
}

/**
 * Réponse générique API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Contexte multi-tenant pour filtrage
 */
export interface TenantContext {
  agencyId: string | null;         // null = SuperAdmin (vue globale)
  branchId: string | null;         // null = Vue globale agence
  userId: string;
  role: UserRole;
}
