export type SubscriptionPlan = "Basique" | "Standard" | "Premium";
export type SubscriptionStatus = "Actif" | "Expiré" | "Essai";

export interface Agency {
  id: string;
  name: string;
  email: string;
  city: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  type: "Entrée" | "Sortie";
  amount: number;
  description: string;
  category: "Billet" | "Fret" | "Carburant" | "Maintenance" | "Autre";
  timestamp: string;
}

// Données par défaut pour tester le Super Admin
export const defaultAgencies: Agency[] = [
  { id: "AGE-001", name: "Kasongo Express", email: "contact@kasongo.cd", city: "Goma", plan: "Premium", status: "Actif", expiresAt: "2026-12-31", createdAt: "2026-01-10" },
  { id: "AGE-002", name: "Kivu Motors", email: "info@kivumotors.com", city: "Beni", plan: "Standard", status: "Essai", expiresAt: "2026-06-15", createdAt: "2026-05-01" },
  { id: "AGE-003", name: "Virunga Voyage", email: "direction@virunga.cd", city: "Butembo", plan: "Basique", status: "Expiré", expiresAt: "2026-04-20", createdAt: "2025-10-05" },
];