# Project A — Lash by Nadia (v2 — Demo Scope)

> **What this proves:** A solo beauty operator's booking flow, fully branded, with deposit enforcement, policy baked in, automated emails, no-show handling, and a calm owner dashboard — demo-ready for potential clients.

---

## Tech Stack (Actual vs Spec)

| Concern | Original Spec | Actual (Drifted) | Why |
|---|---|---|---|
| Framework | Next.js 15 | Next.js 16.2.6 | `create-next-app` default |
| Prisma generator | `prisma-client-js` | `prisma-client` (v7.8.0) | Prisma 7 requires it |
| Prisma adapter | (none, used driver) | `@prisma/adapter-pg` + `pg` | Prisma 7 client requires adapter |
| Zod | v3 | v4.4.3 | Latest install, classic API preserved |
| react-day-picker | (via shadcn) | v10.0.1 | shadcn Calendar pinned version |
| Component base | Radix UI | Base UI (`base-nova` style) | shadcn init default |
| Form component | `form` (shadcn v3) | `field` (shadcn v4) | shadcn deprecated `form` |
| Toast | `toast` | `sonner` | shadcn deprecated `toast` |
| CSS radius | `0.5rem` (new-york) | `0.125rem` (architectural) | Lovable design decision |
| Fonts | 4 (Inter, Inter Tight, Playfair, JetBrains) | 2 (Inter, JetBrains Mono) | Reduced to essentials |
| Smooth scroll | None | Lenis v1.3.23 | Added for landing page polish |
| Env file | `.env.local` | `.env` + `.env.example` | Prisma requires `.env` |

---

## Phase Status

### Phase 0 — Project Setup ✅
- [x] Next.js 16 + TypeScript + App Router
- [x] All dependencies installed
- [x] shadcn/ui initialized (11 components: button, card, input, label, select, dialog, badge, separator, sonner, calendar, field, checkbox)
- [x] Prisma initialized + schema written + migrated + generated
- [x] Folder structure created
- [x] `.env` + `.env.example` configured
- [x] ESLint + Prettier configured
- [x] Husky + lint-staged configured
- [x] README written
- [x] `predev` / `prebuild` scripts configured

### Phase 1 — Database ✅
- [x] Prisma schema (6 models, 2 enums)
- [x] Migration applied (Neon PostgreSQL)
- [x] `lib/db.ts` — PrismaPg adapter + singleton
- [x] `prisma/seed.ts` — 5 services, 5 availability rows, 1 blocked date

### Phase 2 — Core Library ✅
- [x] `lib/utils.ts` — `cn`, `formatCurrency`, `formatDate`, `formatTime`
- [x] `lib/availability.ts` — slot generation, 15-min intervals, `isDateAvailable`
- [x] `lib/policy.ts` — `getCancellationOutcome`, `isRescheduleAllowed`, `canMarkNoShow`
- [x] `lib/tokens.ts` — `generateManageToken`, `getAppointmentByToken`
- [x] `lib/session.ts` — iron-session config, `getSession`, `requireOwner`
- [x] `lib/stripe.ts` — server-side Stripe singleton
- [x] `lib/stripe-client.ts` — lazy `getStripe()` for client
- [x] `lib/resend.ts` — Resend client
- [x] `lib/studio-data.ts` — demo data (services, policy, appointments, clients, revenue)

### Phase 3 — Zod Schemas ✅
- [x] `schemas/booking.schema.ts` — 6 schemas
- [x] `schemas/appointment.schema.ts` — 3 schemas
- [x] `schemas/settings.schema.ts` — 3 schemas
- [x] `schemas/auth.schema.ts` — Login schema
- [x] `schemas/availability.schema.ts` — query validation

### Phase 4 — API Routes (Booking-Critical Only) ✅
- [x] `GET /api/availability` — available slots by service + date
- [x] `POST /api/clients/lookup` — returning client email lookup
- [x] `POST /api/stripe/checkout` — create PaymentIntent for deposit
- [x] `POST /api/stripe/webhook` — handle `payment_intent.succeeded`

### Phase 5 — Email Templates ⏭️ **SKIPPED**
- Bare text email in webhook is sufficient for demo. React Email templates deferred.

### Phase 6 — Booking Flow (Client Side) ✅
- [x] `hooks/use-booking-state.ts` — Zustand wizard store
- [x] `hooks/use-availability.ts` — TanStack Query
- [x] `hooks/use-client-lookup.ts` — TanStack Query mutation
- [x] `hooks/use-stripe-checkout.ts` — TanStack Query
- [x] `(booking)/layout.tsx` — studio branding shell
- [x] `(booking)/[serviceSlug]/page.tsx` — date + time picker
- [x] `(booking)/intake/page.tsx` — client intake form
- [x] `(booking)/policy/page.tsx` — policy display + agreement
- [x] `(booking)/payment/page.tsx` — Stripe Elements checkout
- [x] `(booking)/confirmation/page.tsx` — confirmation screen

### Phase 7 — Client Self-Service ⬜ **NEXT UP**
- [ ] `/appointment/[token]/page.tsx` — view appointment
- [ ] `/appointment/[token]/cancel/page.tsx` — policy preview + confirm cancel
- [ ] `/appointment/[token]/reschedule/page.tsx` — new date/time picker
- [ ] `GET /api/appointments/[token]` — fetch appointment
- [ ] `POST /api/appointments/[token]/cancel` — execute cancellation
- [ ] `POST /api/appointments/[token]/reschedule` — execute reschedule

### Phase 8 — Owner Dashboard ⬜
- [ ] `(owner)/login/page.tsx` — login form
- [ ] `(owner)/layout.tsx` — auth guard + sidebar
- [ ] `(owner)/dashboard/page.tsx` — today view
- [ ] `POST /api/auth/login` — authenticate
- [ ] `POST /api/auth/logout` — destroy session
- [ ] `POST /api/appointments/[id]/complete` — mark completed
- [ ] `POST /api/appointments/[id]/no-show` — mark no-show + flag client

### Phase 9 — Reminders ⏭️ **SKIPPED**
- Vercel Cron requires Pro plan. Deferred beyond demo scope.

### Phase 10 — Polish ⬜
- [ ] Wire landing page "Continue →" to booking flow
- [ ] `pnpm build` passes

### Phase 11 — Portfolio Writeup ⏭️ **POST-DEMO**

---

## Demo-Scoped Additions (Not in Original Spec)

| Addition | Why |
|---|---|
| Lenis smooth scroll on landing page | Cinematic feel, Lovable demo intent |
| Lovable design system (colors, radius, animations) | Brand identity for the demo |
| `SlotHold` table + `/api/slots/hold` | Prevents double-booking (visible bug in demo) |
| 15-min slot intervals (was: service-duration) | Calendar feels populated with options |
| `components/providers.tsx` (QueryClient + Theme) | Required for TanStack Query |
| `components/shared/` (LashMark, StudioLogo, StatusBadge, SmoothScroll) | Reusable design primitives |

---

## Explicitly Dropped (Not Building for Demo)

| Item | Reason |
|---|---|
| `ProcessedWebhook` table | Stripe test mode doesn't retry webhooks — nobody triggers this in a demo |
| `Outbox` table + Vercel Cron | Free tier has no cron; inline email is reliable enough for demo traffic |
| `stripeEventId` on Appointment | Second idempotency guard — belt AND suspenders for a demo |
| React Email templates (Phase 5) | Bare text in Resend is sufficient |
| 24h/2h reminders (Phase 9) | Needs Vercel Cron (pro only) |
| Full appointments list with filters | Dashboard today view is sufficient |
| Client list with search + flagging | "Coming soon" placeholder is fine |
| Availability/weekly hours editor | Static seed data works |
| Service settings editor | Static seed data works |
| Rate limiting | Single-user demo, no abuse vector |
| Per-service buffer minutes | Global 15min is fine |
| Token rotation on reschedule | Demo clients don't test this |
| Client.creditBalance for deposit-as-credit | Manual tracking for demo |
| Timezone handling (UTC store, local display) | UK-only demo, BST/GMT not visible |
| Middleware-based auth | Layout-level guard is simpler |
| tanstack query eslint plugin | not installed |

---

## Build Commands

```bash
pnpm dev          # Start dev server (runs prisma generate first)
pnpm build        # Full build: prisma generate + lint + typecheck + next build
pnpm lint         # ESLint check
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
pnpm prisma:studio # Database browser
pnpm prisma:migrate # Create + apply migration
```

---

## Routes Map

```
/                                    Landing page (Lenis smooth scroll)
/(booking)/[serviceSlug]             Date + time picker
/(booking)/intake                    Client intake form
/(booking)/policy                    Policy agreement
/(booking)/payment                   Stripe deposit payment
/(booking)/confirmation              Booking confirmed
/appointment/[token]                 Client manage-booking view
/appointment/[token]/cancel          Policy preview + confirm cancel
/appointment/[token]/reschedule      New date/time picker
/login                               Owner login
/dashboard                           Owner today view
/api/availability                    GET available slots
/api/slots/hold                      POST create slot reservation
/api/clients/lookup                  POST returning client email lookup
/api/stripe/checkout                 POST create Stripe PaymentIntent
/api/stripe/webhook                  POST handle payment_intent.succeeded
/api/appointments/[token]            GET appointment by manage token
/api/appointments/[token]/cancel     POST cancel appointment
/api/appointments/[token]/reschedule POST reschedule appointment
/api/appointments/[id]/complete      POST mark appointment complete
/api/appointments/[id]/no-show       POST mark appointment no-show
/api/auth/login                      POST owner login
/api/auth/logout                     POST owner logout
/api/cron/outbox                     Inactive (Vercel free tier)
```
