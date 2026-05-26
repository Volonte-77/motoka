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

### Hierarchical Multi-tenancy
Motoka uses a deep multi-tenant structure to support large organizations:
1.  **Level 1: Super Admin SaaS**: Global overview across all agencies.
2.  **Level 2: Agency (Agence)**: Isolated logical entity. Each agency has its own branding, users, and settings.
3.  **Level 3: Branch (Succursale)**: Sub-entities within an agency. Data (vehicles, trips, packages) can be scoped to a specific branch.

### Role-Based Access Control (RBAC)
- **Super Admin SaaS**: Full system access.
- **Admin Agence**: Full access to agency-wide data and branch management.
- **Admin Succursale**: Access to data scoped to their specific branch.
- **Dispatcher / Opérateur**: Daily operations (trips, packages) within a branch or agency.
- **Chauffeur**: Access to assigned trips and personal profile.
- **Client**: Access to package tracking and history.

### Data Scoping Rules
- All operational entities (`Vehicle`, `Trip`, `Package`, `CashTransaction`) MUST include `agencyId`.
- Operational entities SHOULD include `branchId` if they are specific to a branch.
- Global agency views (accessible by `Admin Agence`) should filter by `agencyId`.
- Branch-specific views (accessible by `Admin Succursale`) should filter by both `agencyId` and `branchId`.
- Filtering logic is centralized in `mock-api.ts` and managed via `useAuthStore`.

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
