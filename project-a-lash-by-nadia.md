# Project A — Lash by Nadia
## Demola Studio Portfolio · Starter Tier Demo

> **What this proves:** A solo beauty operator's booking flow, fully branded, with deposit
> enforcement, policy baked in, automated emails, no-show handling, and a calm owner dashboard.
> No Fresha. No Acuity. No marketplace fees. Her brand. Her data.

---

## Fictional Studio

| | |
|---|---|
| **Studio** | Lash by Nadia |
| **Location** | Bethnal Green, East London |
| **Operator** | Nadia — solo lash artist, 3 years in business |
| **Suite** | Rented room inside a shared beauty suite |
| **Current flow** | Instagram DMs → bank transfer deposit → manual WhatsApp reminders |
| **Problem** | Policy exists on Instagram. Nothing enforces it. Deposits chased manually. No-shows eat income. |

### Services

| Service | Duration | Price | Deposit |
|---|---|---|---|
| Classic Lash Set | 90 min | £65 | £20 |
| Hybrid Lash Set | 120 min | £80 | £25 |
| Volume Lash Set | 150 min | £95 | £30 |
| Lash Fill | 60 min | £45 | £15 |
| Lash Removal | 30 min | £20 | £0 |

### Cancellation Policy (industry standard — enforced by the system)

| Notice given | Outcome |
|---|---|
| 48hrs or more | Full deposit refund |
| 24–48hrs | Deposit held, applied as credit to next visit |
| Under 24hrs | Deposit forfeited |
| No-show | Deposit forfeited, client flagged in dashboard |
| 15+ mins late | Appointment may be cancelled at Nadia's discretion |

---

## Tech Stack

### Core Framework
- **Next.js 15** — App Router, Server Components, Route Handlers
- **React 19**
- **TypeScript** — strict mode

> TanStack Start is chosen for greenfield apps. Next.js 15 is used here because the
> booking flow needs SSR for SEO (studio landing page) and server-side deposit
> verification before Stripe checkout. TanStack Start is the right pick for Project B.

### Data & Validation
- **Prisma** — ORM, schema-first, migrations
- **PostgreSQL** — via Railway or Neon (local: Docker)
- **Zod** — all input validation, form schemas, API payloads

### Client State & Fetching
- **TanStack Query v5** — server state, cache invalidation, dashboard polling
- **Zustand** — booking flow wizard state (multi-step form, persisted across steps)

### UI
- **shadcn/ui** — base component library
- **Tailwind CSS v4**
- **Radix UI** — via shadcn (Dialog, Select, Calendar, etc.)
- **Lucide React** — icons
- **date-fns** — all date/time calculations, formatting, timezone handling

### Payments
- **Stripe** — deposit collection, refunds, webhook verification
- **@stripe/stripe-js** — client-side Stripe.js
- **@stripe/react-stripe-js** — Elements wrapper for card input

### Email
- **Resend** — transactional email delivery
- **React Email + @react-email/components** — typed, component-based email templates

### Auth (Owner dashboard only)
- **iron-session** — lightweight encrypted cookie session, no OAuth overhead
- Single owner: email + password, no multi-user needed for Starter tier

### Utilities
- **nanoid** — secure manage-appointment token generation
- **zod-prisma-types** *(optional)* — auto-generate Zod schemas from Prisma schema

### Dev Tools
- **ESLint + Prettier**
- **Husky + lint-staged** — pre-commit hooks
- **dotenv-cli** — environment management
- **Prisma Studio** — local DB browser during dev

---

## Folder Structure

```
lash-by-nadia/
├── app/
│   │
│   ├── (booking)/                        # Public client-facing booking flow
│   │   ├── layout.tsx                    # Studio branding shell, no nav
│   │   ├── page.tsx                      # Service selection landing
│   │   ├── [serviceSlug]/
│   │   │   └── page.tsx                  # Date + time picker
│   │   ├── intake/
│   │   │   └── page.tsx                  # New client form (or returning email lookup)
│   │   ├── policy/
│   │   │   └── page.tsx                  # Policy display + checkbox agreement
│   │   ├── payment/
│   │   │   └── page.tsx                  # Stripe Elements deposit checkout
│   │   └── confirmation/
│   │       └── page.tsx                  # Booking confirmed, summary
│   │
│   ├── (manage)/                         # Client self-service (tokenised links)
│   │   ├── layout.tsx
│   │   └── appointment/
│   │       └── [token]/
│   │           ├── page.tsx              # Appointment details, Reschedule / Cancel
│   │           ├── reschedule/
│   │           │   └── page.tsx          # New date/time picker, deposit transfers
│   │           └── cancel/
│   │               └── page.tsx          # Policy shown, confirm cancellation
│   │
│   ├── (owner)/                          # Nadia's private dashboard
│   │   ├── layout.tsx                    # Sidebar nav, auth guard
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Today view + week at a glance + revenue snapshot
│   │   ├── appointments/
│   │   │   └── page.tsx                  # Full appointment list, filters
│   │   ├── clients/
│   │   │   └── page.tsx                  # Client list, search, flag indicator
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── availability/
│   │       │   └── page.tsx              # Weekly hours + blocked dates
│   │       └── services/
│   │           └── page.tsx              # Service price/deposit edits
│   │
│   └── api/
│       ├── booking/
│       │   └── route.ts                  # POST: create booking intent + session
│       ├── availability/
│       │   └── route.ts                  # GET: available slots by service + date
│       ├── clients/
│       │   └── lookup/
│       │       └── route.ts              # POST: returning client email lookup
│       ├── appointments/
│       │   ├── route.ts                  # GET: list (owner, filtered)
│       │   └── [id]/
│       │       ├── route.ts              # GET / PATCH (owner)
│       │       ├── no-show/
│       │       │   └── route.ts          # POST: mark no-show (owner)
│       │       ├── reschedule/
│       │       │   └── route.ts          # POST: reschedule via token (client)
│       │       └── cancel/
│       │           └── route.ts          # POST: cancel via token (client)
│       ├── stripe/
│       │   ├── checkout/
│       │   │   └── route.ts              # POST: create PaymentIntent for deposit
│       │   └── webhook/
│       │       └── route.ts              # POST: handle payment_intent.succeeded, etc.
│       └── auth/
│           ├── login/
│           │   └── route.ts
│           └── logout/
│               └── route.ts
│
├── components/
│   ├── ui/                               # shadcn/ui generated — do not edit manually
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── badge.tsx
│   │   └── toast.tsx
│   │
│   ├── booking/                          # Client booking flow components
│   │   ├── service-card.tsx              # Individual service display
│   │   ├── service-grid.tsx              # Service selection grid
│   │   ├── date-picker.tsx               # Calendar with blocked dates greyed out
│   │   ├── time-slot-grid.tsx            # Available time slots grid
│   │   ├── new-client-form.tsx           # Intake form
│   │   ├── returning-client-lookup.tsx   # Email lookup for returning clients
│   │   ├── policy-panel.tsx              # Policy display + agreement checkbox
│   │   ├── deposit-summary.tsx           # What you're paying, why
│   │   ├── stripe-payment-form.tsx       # Stripe Elements wrapper
│   │   ├── booking-confirmation.tsx      # Confirmed state display
│   │   └── booking-progress.tsx          # Step indicator (1 of 4, etc.)
│   │
│   ├── manage/                           # Client self-service components
│   │   ├── appointment-summary.tsx
│   │   ├── cancellation-policy-notice.tsx
│   │   ├── reschedule-picker.tsx
│   │   └── manage-locked-notice.tsx      # Shown when inside 48hr window
│   │
│   ├── dashboard/                        # Owner dashboard components
│   │   ├── today-appointments.tsx        # Today's list with status controls
│   │   ├── week-overview.tsx             # Compact 7-day view
│   │   ├── revenue-snapshot.tsx          # Month stats cards
│   │   ├── client-table.tsx              # Sortable client list
│   │   ├── appointment-row.tsx           # Single appointment row with actions
│   │   ├── no-show-button.tsx            # Confirm no-show action
│   │   ├── flagged-badge.tsx             # Warning indicator for flagged clients
│   │   ├── availability-editor.tsx       # Weekly hours form
│   │   └── blocked-dates-manager.tsx     # Add/remove blocked dates
│   │
│   └── shared/
│       ├── studio-logo.tsx
│       ├── page-shell.tsx
│       └── error-state.tsx
│
├── hooks/
│   ├── use-booking-state.ts              # Zustand store — wizard step, selected service/slot
│   ├── use-availability.ts               # TanStack Query: fetch slots for service + date
│   ├── use-appointment.ts                # TanStack Query: fetch single appointment by token
│   ├── use-dashboard-data.ts             # TanStack Query: today's view + revenue
│   ├── use-clients.ts                    # TanStack Query: client list + search
│   └── use-no-show.ts                    # Mutation: mark appointment as no-show
│
├── lib/
│   ├── db.ts                             # Prisma client singleton (globalThis pattern)
│   ├── stripe.ts                         # Stripe server client
│   ├── stripe-client.ts                  # Stripe browser client (loadStripe)
│   ├── resend.ts                         # Resend client
│   ├── session.ts                        # iron-session config + getSession helper
│   ├── availability.ts                   # Slot generation logic (core business logic)
│   ├── policy.ts                         # Cancellation window calculation (48h/24h/under)
│   ├── tokens.ts                         # nanoid manage-token generation + lookup
│   └── utils.ts                          # shadcn cn(), formatCurrency (GBP), formatDate
│
├── schemas/
│   ├── booking.schema.ts                 # Zod: booking flow payloads
│   ├── client.schema.ts                  # Zod: new client intake, returning lookup
│   ├── appointment.schema.ts             # Zod: appointment update, cancellation, no-show
│   ├── availability.schema.ts            # Zod: availability query params
│   ├── auth.schema.ts                    # Zod: login form
│   └── settings.schema.ts               # Zod: service edit, blocked dates, weekly hours
│
├── types/
│   ├── booking.ts                        # BookingStep enum, BookingState, SlotOption
│   ├── appointment.ts                    # Appointment, AppointmentStatus, DepositStatus
│   ├── client.ts                         # Client, ClientSummary
│   ├── dashboard.ts                      # DashboardData, RevenueSnapshot
│   └── service.ts                        # Service
│
├── emails/
│   ├── confirmation.tsx                  # React Email: booking confirmed
│   ├── reminder-24h.tsx                  # React Email: 24hr reminder
│   ├── reminder-2h.tsx                   # React Email: 2hr reminder
│   ├── cancellation-refund.tsx           # React Email: cancelled, deposit refunded
│   ├── cancellation-credit.tsx           # React Email: cancelled, deposit as credit
│   ├── cancellation-forfeited.tsx        # React Email: cancelled, deposit forfeited
│   └── reschedule-confirmation.tsx       # React Email: rescheduled, new details
│
└── prisma/
    ├── schema.prisma
    └── seed.ts                           # Seed: Nadia's services + availability settings
```

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Service {
  id           String        @id @default(cuid())
  slug         String        @unique      // "classic-lash-set"
  name         String                     // "Classic Lash Set"
  duration     Int                        // minutes: 90
  price        Int                        // pence: 6500 = £65.00
  deposit      Int                        // pence: 2000 = £20.00
  isActive     Boolean       @default(true)
  displayOrder Int           @default(0)
  appointments Appointment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Client {
  id             String        @id @default(cuid())
  email          String        @unique
  name           String
  phone          String
  allergies      String?
  referralSource String?
  noShowCount    Int           @default(0)
  isFlagged      Boolean       @default(false)
  appointments   Appointment[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Appointment {
  id                    String            @id @default(cuid())
  client                Client            @relation(fields: [clientId], references: [id])
  clientId              String
  service               Service           @relation(fields: [serviceId], references: [id])
  serviceId             String
  startsAt              DateTime
  endsAt                DateTime
  status                AppointmentStatus @default(CONFIRMED)
  depositAmount         Int               // pence
  depositStatus         DepositStatus     @default(HELD)
  stripePaymentIntentId String?           @unique
  manageToken           String            @unique  // nanoid, used in self-service URLs
  policyAgreedAt        DateTime?
  cancellationReason    String?
  cancelledAt           DateTime?
  noShowMarkedAt        DateTime?
  ownerNotes            String?
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
}

enum AppointmentStatus {
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum DepositStatus {
  HELD        // paid, appointment active
  REFUNDED    // cancelled 48hrs+, returned to card
  CREDITED    // cancelled 24-48hrs, held as credit
  FORFEITED   // cancelled under 24hrs or no-show
}

model BlockedDate {
  id        String   @id @default(cuid())
  date      DateTime @db.Date
  reason    String?
  createdAt DateTime @default(now())
}

// One row per working day. Nadia sets this once.
model WeeklyAvailability {
  id         String   @id @default(cuid())
  dayOfWeek  Int      // 0=Sun, 1=Mon ... 6=Sat
  startTime  String   // "10:00"
  endTime    String   // "18:00"
  isActive   Boolean  @default(true)
}

model OwnerSession {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
}
```

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="Lash by Nadia <noreply@lashbynadia.co.uk>"

# Owner auth
OWNER_PASSWORD_HASH="..."        # bcrypt hash
SESSION_SECRET="..."             # 32+ char random string

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Build Checklist

### Phase 0 — Project Setup

- [ ] Initialise Next.js 15 app with TypeScript and App Router
  ```bash
  npx create-next-app@latest lash-by-nadia --typescript --tailwind --app --src-dir=false
  ```
- [ ] Install core dependencies
  ```bash
  pnpm add prisma @prisma/client zod @tanstack/react-query zustand
  pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js
  pnpm add resend @react-email/components react-email
  pnpm add iron-session nanoid date-fns lucide-react
  pnpm add -D @types/node
  ```
- [ ] Initialise shadcn/ui
  ```bash
  npx shadcn@latest init
  ```
- [ ] Add shadcn components
  ```bash
  npx shadcn@latest add button card input label select form dialog badge separator toast calendar
  ```
- [ ] Initialise Prisma
  ```bash
  pnpm prisma init
  ```
- [ ] Create folder structure: `components/booking`, `components/dashboard`, `components/manage`, `components/shared`, `hooks`, `lib`, `schemas`, `types`, `emails`
- [ ] Create `.env.local` from the variables above
- [ ] Set up Prettier + ESLint config
- [ ] Set up Husky + lint-staged

---

### Phase 1 — Database

- [ ] Write `prisma/schema.prisma` (full schema above)
- [ ] Run first migration
  ```bash
  pnpm prisma migrate dev --name init
  ```
- [ ] Write `prisma/seed.ts`
  - [ ] Seed 5 services with correct prices, deposits and durations
  - [ ] Seed weekly availability: Tue–Sat, 10:00–18:00
  - [ ] Seed 1 blocked date (demonstrating the feature)
- [ ] Run seed
  ```bash
  pnpm prisma db seed
  ```
- [ ] Create `lib/db.ts` — Prisma client singleton using `globalThis` pattern to prevent dev hot-reload connection exhaustion

---

### Phase 2 — Core Library Functions

These are the business logic functions. Build and unit-test these before any UI.

- [ ] `lib/availability.ts`
  - [ ] `getAvailableSlots(serviceId, date)` — fetch weekly availability + blocked dates + existing appointments, return open time slots as `SlotOption[]`
  - [ ] `isDateAvailable(date)` — check if a given date is a working day and not blocked
  - [ ] Buffer logic: 15 min buffer between appointments

- [ ] `lib/policy.ts`
  - [ ] `getCancellationOutcome(appointment)` — returns `'refund' | 'credit' | 'forfeit'` based on hours until appointment
  - [ ] `isRescheduleAllowed(appointment)` — returns `boolean`, true if 48hrs+ away
  - [ ] `canMarkNoShow(appointment)` — returns `boolean`, true if past start time and same calendar day

- [ ] `lib/tokens.ts`
  - [ ] `generateManageToken()` — nanoid(21) URL-safe token
  - [ ] `getAppointmentByToken(token)` — Prisma lookup with client + service joined

- [ ] `lib/session.ts`
  - [ ] iron-session config with cookie name, password, TTL
  - [ ] `getSession(req)` helper
  - [ ] `requireOwner(req)` — throws 401 if no valid session (used in Route Handlers)

- [ ] `lib/utils.ts`
  - [ ] `formatCurrency(pence: number)` → `"£65.00"`
  - [ ] `formatDate(date: Date)` → `"Tuesday 14 January 2025"`
  - [ ] `formatTime(date: Date)` → `"10:30"`
  - [ ] `cn(...classes)` — shadcn Tailwind class merge

---

### Phase 3 — Zod Schemas

- [ ] `schemas/booking.schema.ts`
  - [ ] `SelectServiceSchema` — serviceSlug: string
  - [ ] `SelectSlotSchema` — date: string (ISO), time: string ("10:30")
  - [ ] `NewClientSchema` — name, email, phone, allergies (optional), referralSource (optional)
  - [ ] `ReturningClientLookupSchema` — email
  - [ ] `PolicyAgreementSchema` — agreed: literal(true)
  - [ ] `CreateBookingSchema` — full payload before Stripe

- [ ] `schemas/appointment.schema.ts`
  - [ ] `RescheduleSchema` — token, date, time
  - [ ] `CancelSchema` — token
  - [ ] `NoShowSchema` — appointmentId (owner only)

- [ ] `schemas/settings.schema.ts`
  - [ ] `UpdateServiceSchema` — price, deposit (both in pence)
  - [ ] `BlockDateSchema` — date, reason (optional)
  - [ ] `WeeklyAvailabilitySchema` — array of day configs

- [ ] `schemas/auth.schema.ts`
  - [ ] `LoginSchema` — email, password

---

### Phase 4 — API Route Handlers

- [ ] `api/availability/route.ts` — GET
  - [ ] Parse query: `serviceSlug`, `date`
  - [ ] Validate with `availability.schema.ts`
  - [ ] Call `getAvailableSlots()`
  - [ ] Return `SlotOption[]`

- [ ] `api/clients/lookup/route.ts` — POST
  - [ ] Validate email with `ReturningClientLookupSchema`
  - [ ] Query Prisma for client by email
  - [ ] Return `{ found: true, name, phone, allergies }` or `{ found: false }`
  - [ ] Never return sensitive fields

- [ ] `api/stripe/checkout/route.ts` — POST
  - [ ] Validate full `CreateBookingSchema`
  - [ ] Re-validate slot is still available (prevent race conditions)
  - [ ] Create Stripe PaymentIntent for deposit amount
  - [ ] Return `clientSecret` to browser

- [ ] `api/stripe/webhook/route.ts` — POST
  - [ ] Verify Stripe webhook signature
  - [ ] On `payment_intent.succeeded`:
    - [ ] Create `Client` record (or find existing by email)
    - [ ] Create `Appointment` record with `CONFIRMED` status
    - [ ] Set `depositStatus: HELD`
    - [ ] Generate `manageToken` via `generateManageToken()`
    - [ ] Send confirmation email via Resend
    - [ ] Schedule 24hr + 2hr reminders (use Vercel Cron or a queued approach)
  - [ ] On `payment_intent.payment_failed`: log failure, no appointment created

- [ ] `api/appointments/[id]/reschedule/route.ts` — POST
  - [ ] Validate `RescheduleSchema`
  - [ ] Look up appointment by `manageToken` (not ID — IDs are not exposed to clients)
  - [ ] Call `isRescheduleAllowed()` — return 403 with message if inside window
  - [ ] Check new slot availability
  - [ ] Update appointment `startsAt`, `endsAt`
  - [ ] Send reschedule confirmation email
  - [ ] Return updated appointment summary

- [ ] `api/appointments/[id]/cancel/route.ts` — POST
  - [ ] Validate `CancelSchema`
  - [ ] Look up appointment by `manageToken`
  - [ ] Call `getCancellationOutcome()` — determine refund / credit / forfeit
  - [ ] Execute Stripe action:
    - [ ] `refund`: `stripe.refunds.create({ payment_intent: ... })`
    - [ ] `credit`: update `depositStatus: CREDITED`, no Stripe action
    - [ ] `forfeit`: update `depositStatus: FORFEITED`, no Stripe action
  - [ ] Update appointment `status: CANCELLED`, `cancelledAt`, `depositStatus`
  - [ ] Send correct cancellation email based on outcome
  - [ ] Return outcome summary

- [ ] `api/appointments/[id]/no-show/route.ts` — POST (owner only)
  - [ ] Call `requireOwner(req)` — 401 if not authenticated
  - [ ] Validate `NoShowSchema`
  - [ ] Call `canMarkNoShow()` — return 400 if too early or too late
  - [ ] Update appointment `status: NO_SHOW`, `depositStatus: FORFEITED`, `noShowMarkedAt`
  - [ ] Increment `client.noShowCount`
  - [ ] If `client.noShowCount >= 2`, set `client.isFlagged: true`
  - [ ] Return updated appointment

- [ ] `api/auth/login/route.ts` — POST
  - [ ] Validate `LoginSchema`
  - [ ] Compare password with `OWNER_PASSWORD_HASH` using bcrypt
  - [ ] Set iron-session cookie on success
  - [ ] Return 401 on failure

- [ ] `api/auth/logout/route.ts` — POST
  - [ ] Destroy iron-session
  - [ ] Redirect to login

---

### Phase 5 — Email Templates (React Email)

Each template receives typed props. All emails are plain, text-forward, branded with
Lash by Nadia's colour and name. No heavy design — matches the calm studio aesthetic.

- [ ] `emails/confirmation.tsx`
  - [ ] Props: `clientName`, `service`, `date`, `time`, `depositPaid`, `manageToken`, `studioAddress`
  - [ ] Content: appointment summary, deposit confirmation, what to bring, manage link, address

- [ ] `emails/reminder-24h.tsx`
  - [ ] Props: `clientName`, `service`, `date`, `time`, `manageToken`
  - [ ] Content: reminder of tomorrow's appointment, last chance to reschedule at no cost (if 48hrs+ window still applies), manage link, address

- [ ] `emails/reminder-2h.tsx`
  - [ ] Props: `clientName`, `service`, `time`, `studioAddress`
  - [ ] Content: appointment is today, address, what to bring (no manage link — inside 24hr window)

- [ ] `emails/cancellation-refund.tsx`
  - [ ] Props: `clientName`, `service`, `date`, `depositAmount`
  - [ ] Content: cancelled, full deposit refunded, timeline (3–5 working days), rebook link

- [ ] `emails/cancellation-credit.tsx`
  - [ ] Props: `clientName`, `service`, `date`, `depositAmount`
  - [ ] Content: cancelled, deposit held as credit toward next visit, rebook link

- [ ] `emails/cancellation-forfeited.tsx`
  - [ ] Props: `clientName`, `service`, `date`, `depositAmount`
  - [ ] Content: cancelled, deposit forfeited per agreed policy (link shown at booking), rebook link

- [ ] `emails/reschedule-confirmation.tsx`
  - [ ] Props: `clientName`, `service`, `newDate`, `newTime`, `manageToken`
  - [ ] Content: new appointment details, deposit confirmed as transferred, manage link

---

### Phase 6 — Booking Flow (Client Side)

The booking flow is a multi-step wizard. State lives in Zustand (`use-booking-state.ts`).
URL advances per step so the browser back button works naturally.

#### Step 1 — Service Selection `(booking)/page.tsx`
- [ ] Fetch all active services (server component, direct Prisma call)
- [ ] Render `<ServiceGrid />` with `<ServiceCard />` per service
- [ ] Each card shows: name, duration, price, deposit amount
- [ ] Selecting a service navigates to `/(booking)/[serviceSlug]`
- [ ] Set selected service in Zustand store

#### Step 2 — Date + Time `(booking)/[serviceSlug]/page.tsx`
- [ ] Fetch service by slug (server component)
- [ ] Render `<DatePicker />` — uses shadcn Calendar, unavailable days greyed out
  - [ ] Query `isDateAvailable()` for each rendered day
  - [ ] Block past dates
  - [ ] Block dates in blocked dates table
  - [ ] Block days not in weekly availability
- [ ] On date select: client component fires TanStack Query to `api/availability?serviceSlug=&date=`
- [ ] Render `<TimeSlotGrid />` with returned slots
  - [ ] Each slot shows time and remaining duration indicator
  - [ ] Selecting a slot sets date + time in Zustand, advances to intake
- [ ] Render `<BookingProgress step={2} />` at top

#### Step 3 — Client Intake `(booking)/intake/page.tsx`
- [ ] Check Zustand — redirect to step 1 if service or slot is not set
- [ ] Show email field first with "Check if you've booked before" CTA
  - [ ] On submit: POST to `api/clients/lookup`
  - [ ] If found: show `<ReturningClientLookup />` — name pre-filled, confirm and continue
  - [ ] If not found: reveal full `<NewClientForm />`
- [ ] New client form fields: Full Name, Email, Phone, Allergies / Sensitivities, How did you hear about us
- [ ] Validate with `NewClientSchema` (Zod + react-hook-form)
- [ ] On submit: save client data to Zustand, advance to policy

#### Step 4 — Policy `(booking)/policy/page.tsx`
- [ ] Check Zustand — redirect if previous steps incomplete
- [ ] Render `<PolicyPanel />` — full policy text, clearly formatted
- [ ] Show appointment summary sidebar (service, date, time, deposit to pay)
- [ ] Checkbox: "I have read and agree to the cancellation and no-show policy"
- [ ] Checkbox must be ticked to proceed
- [ ] On confirm: set `policyAgreed: true` in Zustand, advance to payment

#### Step 5 — Payment `(booking)/payment/page.tsx`
- [ ] Check Zustand — redirect if policy not agreed
- [ ] On mount: POST to `api/stripe/checkout` with booking data, receive `clientSecret`
- [ ] Render `<DepositSummary />` — service, what the deposit covers, total today
- [ ] Render `<StripePaymentForm />` — Stripe Elements card input
- [ ] Show policy reminder: "By paying, you confirm you have read and agree to our policy"
- [ ] On payment success: Stripe redirects / callback → advance to confirmation
  - [ ] Do not create appointment here — wait for webhook

#### Step 6 — Confirmation `(booking)/confirmation/page.tsx`
- [ ] Poll or display based on session param after Stripe redirect
- [ ] Show: appointment summary, deposit paid, manage link reminder, studio address
- [ ] Remind client to check email for confirmation
- [ ] No Zustand state needed here — read from URL params or server

---

### Phase 7 — Client Self-Service (Manage Flow)

Accessed only via tokenised link in email. No login required.

#### Appointment View `(manage)/appointment/[token]/page.tsx`
- [ ] Fetch appointment by token (server component)
- [ ] 404 if token invalid or appointment already cancelled
- [ ] Show: service, date, time, deposit status, current status
- [ ] If `CONFIRMED`:
  - [ ] Show Reschedule button (if `isRescheduleAllowed()` = true)
  - [ ] Show Cancel button (always shown, policy previewed on click)
  - [ ] If inside 48hr window: reschedule button replaced with locked notice
- [ ] If `CANCELLED` or `NO_SHOW`: show status message, rebook link only

#### Reschedule `(manage)/appointment/[token]/reschedule/page.tsx`
- [ ] Redirect if `isRescheduleAllowed()` returns false
- [ ] Render same date/time picker as booking step 2 (reuse components)
- [ ] On slot select: POST to `api/appointments/[id]/reschedule`
- [ ] Show success state with new appointment details
- [ ] Confirmation email triggered server-side

#### Cancel `(manage)/appointment/[token]/cancel/page.tsx`
- [ ] Show full policy text + what will happen to deposit based on current timing
- [ ] Call `getCancellationOutcome()` server-side, show outcome before confirming
  - [ ] e.g. "You are cancelling with 52 hours notice. Your £20 deposit will be fully refunded."
- [ ] Confirm cancellation button
- [ ] POST to `api/appointments/[id]/cancel`
- [ ] Show cancellation confirmed state with deposit outcome

---

### Phase 8 — Owner Dashboard

Protected by iron-session. All pages check for valid session via middleware or per-layout check.

#### Login `(owner)/login/page.tsx`
- [ ] Simple email + password form
- [ ] Validate with `LoginSchema`
- [ ] POST to `api/auth/login`
- [ ] Redirect to `/dashboard` on success

#### Dashboard `(owner)/dashboard/page.tsx`
- [ ] Server component — fetch today's appointments direct from Prisma
- [ ] Render `<TodayAppointments />` — sorted by start time
  - [ ] Each row: client name, service, start time, deposit status badge
  - [ ] Status control: Arrived / No-show (only shown after appointment start time)
  - [ ] `<NoShowButton />` opens confirmation dialog before posting
- [ ] Render `<WeekOverview />` — next 7 days, compact list, no actions needed
- [ ] Render `<RevenueSnapshot />` — 3 stat cards
  - [ ] Deposits collected this month
  - [ ] Completed appointments this month
  - [ ] No-shows this month

#### Appointments `(owner)/appointments/page.tsx`
- [ ] TanStack Query: fetch appointments from `api/appointments` with filters
- [ ] Filter controls: status (all / confirmed / completed / cancelled / no-show), date range
- [ ] Sortable table: client, service, date, status, deposit status
- [ ] Row click → appointment detail panel (slide-over or inline expand)

#### Clients `(owner)/clients/page.tsx`
- [ ] TanStack Query: fetch clients from Prisma via server action or Route Handler
- [ ] Searchable by name or email (client-side filter on fetched list)
- [ ] Table columns: name, email, last service, last visit, no-show count
- [ ] `<FlaggedBadge />` shown on flagged clients (red warning icon)
- [ ] Clicking client shows appointment history for that client

#### Availability Settings `(owner)/settings/availability/page.tsx`
- [ ] `<AvailabilityEditor />` — 7 day toggle rows, each with start/end time inputs
- [ ] Save updates `WeeklyAvailability` records
- [ ] `<BlockedDatesManager />` — date picker to add, list of current blocked dates with remove button
- [ ] Validate with `WeeklyAvailabilitySchema` + `BlockDateSchema`

#### Service Settings `(owner)/settings/services/page.tsx`
- [ ] List all services with current price and deposit
- [ ] Inline edit: click price/deposit to edit, enter new value, save
- [ ] Validate with `UpdateServiceSchema`
- [ ] Note: duration and name are read-only in demo scope (would need full edit for production)

---

### Phase 9 — Reminder Scheduling

- [ ] Research Vercel Cron Jobs for reminder scheduling
- [ ] Alternative: on booking creation, calculate reminder times and store `reminderScheduledFor24h` and `reminderScheduledFor2h` timestamps on the appointment
- [ ] Cron job runs every 15 minutes:
  - [ ] Query appointments where `reminderScheduledFor24h <= now` and `24hReminderSent = false` and `status = CONFIRMED`
  - [ ] Send 24hr reminder email, mark as sent
  - [ ] Same pattern for 2hr reminder
- [ ] Add `reminder24hSentAt` and `reminder2hSentAt` fields to `Appointment` schema
- [ ] Add Vercel Cron config to `vercel.json`
  ```json
  {
    "crons": [{ "path": "/api/cron/reminders", "schedule": "*/15 * * * *" }]
  }
  ```
- [ ] Create `api/cron/reminders/route.ts`
  - [ ] Verify `CRON_SECRET` header to prevent external calls
  - [ ] Run both reminder checks
  - [ ] Log sent count

---

### Phase 10 — Polish and Demo Readiness

- [ ] Ensure all Stripe interactions use test mode keys only
- [ ] Add Stripe test card info to a visible "Demo" notice on the payment page (test card: 4242 4242 4242 4242)
- [ ] Mobile-responsive check on all booking flow pages (primary use case is mobile)
- [ ] Confirm all emails render correctly in React Email preview (`pnpm email dev`)
- [ ] Seed realistic demo data: 3 upcoming appointments, 2 past, 1 no-show, 5 clients (1 flagged)
- [ ] Test full booking flow end to end in test mode
- [ ] Test reschedule inside + outside 48hr window
- [ ] Test cancellation at each of the 3 timing windows
- [ ] Test owner no-show marking after appointment start time
- [ ] Verify flagging logic triggers at 2nd no-show
- [ ] Write `README.md` for the project (tech stack, setup, env vars, seed instructions)

---

### Phase 11 — Portfolio Writeup (Case Study)

- [ ] Write case study for Demola Studio portfolio page
  - [ ] The before: Nadia's messy flow (DMs, bank transfer, manual reminders)
  - [ ] The diagnosis: where time and money were leaking
  - [ ] The decision: what to keep (Instagram as discovery), what to replace (the entire backend flow)
  - [ ] The build: what was built and what each part solves
  - [ ] The result: what Nadia's day looks like now (framed as the expected outcome, not a testimonial)
- [ ] Record video walkthrough
  - [ ] Part 1 (2 min): client flow — new client booking, deposit, confirmation email
  - [ ] Part 2 (1 min): client self-service — manage link, reschedule, cancel
  - [ ] Part 3 (2 min): owner dashboard — today view, mark no-show, client list, revenue snapshot

---

## Key Implementation Notes

**Slot generation logic (`lib/availability.ts`)**
Slots are generated dynamically on each availability request, never stored. The algorithm:
1. Fetch `WeeklyAvailability` for the requested day of week
2. Fetch all `CONFIRMED` appointments for that date
3. Fetch `BlockedDate` for that date
4. Starting from `startTime`, generate slots every `service.duration + 15 min buffer`
5. Skip any slot where the window overlaps with an existing appointment
6. Return only future slots (no slots in the past for today's date)

**Manage tokens (`lib/tokens.ts`)**
Tokens are URL-safe nanoid strings. They are:
- Never the appointment's database ID (never expose internal IDs in client URLs)
- Generated at appointment creation (inside the Stripe webhook handler)
- Stored on the Appointment record
- Used as the only way clients access their appointment

**Deposit amounts in pence**
All monetary values in the database are stored in pence (integers). The `formatCurrency()` utility converts to `£` display. This matches Stripe's native unit format and avoids floating point bugs.

**Race condition prevention on slot booking**
Before creating the Stripe PaymentIntent, the API re-checks slot availability. If the slot has been taken since the client selected it, return a 409 and prompt them to pick again. The appointment is only created inside the webhook — if payment fails, no appointment is created.

**Cancellation outcome is time-sensitive**
`getCancellationOutcome()` calculates based on `Date.now()` vs `appointment.startsAt`. This must be called at the moment of cancellation execution (in the Route Handler), not cached from an earlier check.
