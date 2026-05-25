import localforage from "localforage";
import { STORAGE_KEYS, Vehicle, AppUser, Trip, Package, CashTransaction } from "@/types";

/**
 * Service de simulation API utilisant localforage
 * Permet de manipuler les données en attendant le backend réel.
 */
export const mockApi = {
  // --- VÉHICULES ---
  vehicles: {
    getAll: async (agencyId: string | null) => {
      const data = await localforage.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES_LIST) || [];
      if (!agencyId) return data;
      return data.filter(v => v.agencyId === agencyId);
    },
    save: async (vehicle: Vehicle) => {
      const data = await localforage.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES_LIST) || [];
      const index = data.findIndex(v => v.id === vehicle.id);
      if (index >= 0) data[index] = vehicle;
      else data.push(vehicle);
      await localforage.setItem(STORAGE_KEYS.VEHICLES_LIST, data);
      return vehicle;
    },
    delete: async (id: string) => {
      const data = await localforage.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES_LIST) || [];
      const filtered = data.filter(v => v.id !== id);
      await localforage.setItem(STORAGE_KEYS.VEHICLES_LIST, filtered);
    }
  },

  // --- CHAUFFEURS (Utilisateurs avec rôle Chauffeur) ---
  drivers: {
    getAll: async (agencyId: string | null) => {
      const data = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
      const drivers = data.filter(u => u.role === "Chauffeur");
      if (!agencyId) return drivers;
      return drivers.filter(u => u.agencyId === agencyId);
    },
    save: async (driver: AppUser) => {
      const data = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
      const index = data.findIndex(u => u.id === driver.id);
      if (index >= 0) data[index] = driver;
      else data.push(driver);
      await localforage.setItem(STORAGE_KEYS.USERS_LIST, data);
      return driver;
    }
  },

  // --- COURSES (TRIPS) ---
  trips: {
    getAll: async (agencyId: string | null) => {
      const data = await localforage.getItem<Trip[]>(STORAGE_KEYS.TRIPS_LIST) || [];
      if (!agencyId) return data;
      return data.filter(t => t.agencyId === agencyId);
    },
    save: async (trip: Trip) => {
      const data = await localforage.getItem<Trip[]>(STORAGE_KEYS.TRIPS_LIST) || [];
      const index = data.findIndex(t => t.id === trip.id);
      if (index >= 0) data[index] = trip;
      else data.push(trip);
      await localforage.setItem(STORAGE_KEYS.TRIPS_LIST, data);
      return trip;
    }
  },

  // --- COLIS (PACKAGES) ---
  packages: {
    getAll: async (agencyId: string | null) => {
      const data = await localforage.getItem<Package[]>(STORAGE_KEYS.PACKAGES_LIST) || [];
      if (!agencyId) return data;
      return data.filter(p => p.agencyId === agencyId);
    },
    save: async (pkg: Package) => {
      const data = await localforage.getItem<Package[]>(STORAGE_KEYS.PACKAGES_LIST) || [];
      const index = data.findIndex(p => p.id === pkg.id);
      if (index >= 0) data[index] = pkg;
      else data.push(pkg);
      await localforage.setItem(STORAGE_KEYS.PACKAGES_LIST, data);
      return pkg;
    }
  },

  // --- CAISSE (TRANSACTIONS) ---
  cash: {
    getAll: async (agencyId: string | null) => {
      const data = await localforage.getItem<CashTransaction[]>(STORAGE_KEYS.CASH_TRANSACTIONS) || [];
      if (!agencyId) return data;
      return data.filter(t => t.agencyId === agencyId);
    },
    save: async (transaction: CashTransaction) => {
      const data = await localforage.getItem<CashTransaction[]>(STORAGE_KEYS.CASH_TRANSACTIONS) || [];
      data.push(transaction);
      await localforage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, data);
      return transaction;
    }
  }
};
