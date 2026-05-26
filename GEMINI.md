# Motoka - Transport Agency Management SaaS

Motoka is a "Mobile First" web application designed to digitize and centralize the management of transport agencies. It follows a multi-tenant SaaS architecture allowing multiple agencies to manage their operations in logical isolation.

## Project Overview
- **Type**: SaaS (Multi-tenant)
- **Primary Target**: Transport agencies, delivery companies, interurban transport.
- **Key Features**:
  - Fleet & Driver Management
  - Trip (Course) & Package (Colis) tracking
  - Financial management (Revenue, expenses, driver salaries)
  - Real-time tracking (GPS integration planned)
  - SMS OTP for package validation
  - Role-Based Access Control (RBAC)

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **State Management**: Zustand
- **Persistence**: `localforage` (Offline-first approach using IndexedDB)
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form

## Architecture & Conventions

### Directory Structure
- `app/`: Next.js App Router routes.
  - `(app)/`: Main application routes (Dashboard, Drivers, Vehicles, etc.) protected by auth.
  - `admin/saas/`: SaaS administration.
  - `login/`: Authentication entry point.
- `components/`: UI components.
  - `ui/`: Shared shadcn/ui components.
  - `navigation-shell.tsx`: Main layout wrapper with RBAC-aware sidebar.
- `context/`: React Context providers (Auth).
- `hooks/`: Custom React hooks (e.g., `useAuthGuard`).
- `lib/`: Utility functions and Mock API.
  - `mock-api.ts`: Simulation service using `localforage`.
- `store/`: Zustand stores for global state.
- `types/`: TypeScript definitions.

### Development Guidelines
- **Mobile First**: Prioritize mobile responsiveness for all UI components.
- **RBAC**: Navigation and access are controlled via roles defined in `navigation-shell.tsx` and handled in `useAuthStore`.
  - Roles: `Super Admin SaaS`, `Admin Agence`, `Dispatcher / Opérateur`, `Chauffeur`, `Client`.
- **Offline First**: Use `localforage` via `mockApi` for data persistence to ensure functionality without a stable backend connection.
- **Type Safety**: Strictly use TypeScript interfaces defined in `types/index.ts`.

## Build & Run Commands

| Task | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Development Server** | `npm run dev` |
| **Production Build** | `npm run build` |
| **Start Production** | `npm run start` |
| **Linting** | `npm run lint` |

## Strategic Roadmap (from FICHE TECHNIQUE)
1. **Module 1-3**: Core fleet and driver management (Current focus).
2. **Module 4-5**: Trip and Package management with OTP validation.
3. **Module 7**: Financial reporting.
4. **Phase 2**: Backend integration (PostgreSQL, Redis), Real-time GPS, PWA.
