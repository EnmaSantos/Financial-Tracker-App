# Equitas Financial — Project Status

## Current State (as of April 19, 2026)

The project has been restructured to separate the interactive design prototype from the production codebase. The production app is now initialized with a modern Next.js architecture.

### 1. Architecture & Tech Stack
*   **Production App (`apps/web`):** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma (Direct DB Access).
*   **Design Prototype (`apps/mockup`):** Vite, React 19, Tailwind CSS v4 (Design Reference).
*   **Database (`packages/db`):** Prisma ORM with SQLite for local-first, private storage.
*   **Shared Logic (`packages/shared`):** Zod schemas for data validation and shared types.
*   **API (`apps/api`):** Hono-based microservice (available for external consumers).

### 2. Implementation Progress
- [x] **Monorepo Restructuring:** Isolated mockup and production app into separate workspaces.
- [x] **Design System Porting:** Successfully moved OKLCH color tokens and brand typography to the Next.js application.
- [x] **Database Integration:** Verified end-to-end connectivity between Next.js Server Components and the SQLite database.
- [x] **Persona Data:** Maya Chen's data (assets, debts, goals) is seeded and ready for production use.
- [x] **Initial Build:** Production app successfully passes build and type-checking.

---

## Next Steps

### Phase 1: Application Shell & Navigation
*   **Port Layout:** Implement the "Shell" (Sidebar, Header, and Mobile Frame) in `apps/web/src/app/layout.tsx`.
*   **Navigation:** Set up the main app routes (`/accounts`, `/debt`, `/goals`, `/scenarios`).
*   **Theme Switcher:** Re-implement the light/dark and accent color toggles in the production app.

### Phase 2: Core Dashboard (RSC Implementation)
*   **Net Worth Hero:** Build the high-fidelity net worth display using React Server Components.
*   **In/Out/Saved Strip:** Implement the live monthly flow summary.
*   **Asset/Debt Lists:** Create the categorized account lists with the Best Buy promo warning system.

### Phase 3: Manual Account Management (Server Actions)
*   **Quick Update Flow:** Build the inline balance update system using Next.js Server Actions for zero-latency feel.
*   **Account Creation:** Implement the "Add Account" flow with full validation against `@ledger/shared` schemas.

### Phase 4: Financial Intelligence Engine
*   **Debt Payoff Logic:** Port the avalanche/snowball math to a shared utility or server-side service.
*   **Scenario Engine:** Build the "What-If" projection UI, leveraging the existing forecast logic but optimized for the production stack.
*   **Reminders:** Set up the notification system for upcoming due dates and promo expirations.

### Phase 5: Authentication & Multi-Tenancy
*   **Auth Integration:** Integrate an authentication provider (e.g., Clerk or NextAuth/Auth.js).
*   **User Sessions:** Replace the hardcoded `maya` ID with dynamic session-based user identification.

---
*Status Document Generated: April 19, 2026*
