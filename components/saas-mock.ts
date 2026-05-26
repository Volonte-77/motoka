import { SessionUser, Agency, STORAGE_KEYS as GLOBAL_STORAGE_KEYS } from "@/types";

// Données par défaut pour tester le Super Admin
export const defaultAgencies: Agency[] = [
  { id: "AGE-001", name: "Kasongo Express", email: "contact@kasongo.cd", city: "Goma", plan: "Premium", status: "Actif", expiresAt: "2026-12-31", createdAt: "2026-01-10" },
  { id: "AGE-002", name: "Kivu Motors", email: "info@kivumotors.com", city: "Beni", plan: "Standard", status: "Essai", expiresAt: "2026-06-15", createdAt: "2026-05-01" },
  { id: "AGE-003", name: "Virunga Voyage", email: "direction@virunga.cd", city: "Butembo", plan: "Basique", status: "Expiré", expiresAt: "2026-04-20", createdAt: "2025-10-05" },
];

export const defaultSuperAdmin: SessionUser = {
  id: "SUPER-ADMIN-001",
  name: "Super Admin SaaS",
  email: "superadmin@motoka.com",
  role: "Super Admin SaaS",
  agencyId: null,
  branchId: null,
  siteAccess: "Global",
};

export const backupSuperAdmin: SessionUser = {
  id: "SUPER-ADMIN-002",
  name: "Admin de Secours",
  email: "admin@motoka.com",
  role: "Super Admin SaaS",
  agencyId: null,
  branchId: null,
  siteAccess: "Global",
};

export const defaultSuperAdminPassword = "motoka123";
export const backupSuperAdminPassword = "admin123";

// Clés constantes pour localforage
export const STORAGE_KEYS = GLOBAL_STORAGE_KEYS;