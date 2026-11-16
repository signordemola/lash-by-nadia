# CLAUDE.md — Beauty/Wellness Booking Demo · AI Context File

This file is for any AI coding assistant working on this project or a project derived from it.
Read it fully before writing any code. These are hard-won lessons, not suggestions.

---

## Stack

- **Next.js** (App Router, Turbopack) — server components + API routes
- **Prisma + Neon** (PostgreSQL, serverless) — expect cold-start latency (~2–5s)
- **Stripe** — PaymentIntents, webhooks (`payment_intent.succeeded` only)
- **Resend** — transactional email
- **Zustand** — client-side booking wizard state (`persist` middleware)
- **TanStack Query** — server state / mutations
- **date-fns + date-fns-tz** — all date logic
- **pnpm** — package manager, always commit `pnpm-lock.yaml`

---

## Middleware

The middleware entry point is **`proxy.ts`**, not `middleware.ts`.
This is wired via `next.config`. Do not rename it.

---

## Authentication

Owner login uses **SHA-256** via Node's built-in `crypto` module.
**Do not use argon2** — it has native bindings that fail on Vercel/serverless.
`bcryptjs` (pure JS) is an acceptable alternative.

Env vars required:
- `OWNER_EMAIL`
- `OWNER_PASSWORD_HASH` — 64-char hex SHA-256 hash of the password

To generate the hash:
```bash
node -e "require('crypto').createHash('sha256').update('yourpassword').digest('hex') |> console.log"
# or
echo -n "yourpassword" | sha256sum
```

Auth cookie is `owner-token`. It holds a random session token. The SHA-256 hash of the token is a row in `OwnerSession` and is valid for 24 hours.
`proxy.ts` only checks that the cookie exists (redirect for convenience). The security check is `requireOwnerPage()` in every dashboard page and `hasOwnerSession()` in every owner API route (`lib/require-owner.ts`). Add one of them to every new owner page or route.

---

## Currency — Critical

**All currency in the database is stored in pence (smallest unit).**

| Source | Unit | Example |
|--------|------|---------|
| DB `Service.price` / `Service.deposit` | pence | `2000` = £20 |
| DB `Appointment.depositAmount` | pence | `1500` = £15 |
| `studio-data.ts` (static display only) | pounds | `20` = £20 |
| Stripe `amount:` | pence (direct from DB) | `2000` |

`formatCurrency(pence: number)` divides by 100. Always pass pence to it.

**Do NOT use `formatCurrency` on values from `studio-data.ts`** — those are already in pounds.
Display them as `£{service.price}` directly.

**Do NOT multiply DB deposit by 100 before passing to Stripe** — it's already in pence.

---

## Timezones — Critical

**All time logic is in `Europe/London` (BST/GMT).** Use `date-fns-tz`.

### Rules

1. **Never use `new Date()` + `setHours()`** in seeds or scripts — `setHours` uses the machine's local timezone, which will be wrong on any server not in London time.

2. **Never use `startOfDay(londonMidnight)`** — `startOfDay` strips timezone context and reverts to UTC midnight, shifting the date by 1 hour in BST.

3. **Never use `getDay(londonMidnight)`** — same problem; returns the UTC day, which is one day behind during BST.

### Correct patterns

```ts
import { londonDate, londonDateOnly } from "@/lib/time"
import { formatInTimeZone } from "date-fns-tz"

const TZ = "Europe/London"

// Midnight London time for a date string
const midnight = londonDateOnly("2026-06-05")  // → 2026-06-04T23:00:00Z in BST

// Specific London time
const appt = londonDate("2026-06-05", "10:00")  // → 2026-06-05T09:00:00Z in BST

// Day-of-week from a date string (timezone-safe)
const [y, mo, d] = "2026-06-05".split("-").map(Number)
const dayOfWeek = new Date(y, mo - 1, d).getDay()  // local calendar date, no TZ shift

// Day range query (London day boundary)
const date = londonDateOnly(dateStr)
const dayEnd = new Date(date.getTime() + 86400000)
// Use: { gte: date, lt: dayEnd } in Prisma queries — NOT startOfDay()

// Seed: always construct timestamps via londonDate()
function d(offsetDays: number, hours: number, minutes = 0): Date {
  const base = new Date(now.getTime() + offsetDays * 86400000)
  const dateStr = formatInTimeZone(base, TZ, "yyyy-MM-dd")
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  return londonDate(dateStr, timeStr)
}
```

---

## Stripe Integration

### Flow
1. Client selects slot → POST `/api/slots/hold` → returns `holdToken` + `expiresAt`
2. Client fills intake + agrees policy
3. POST `/api/stripe/checkout` → creates PaymentIntent with `holdToken` in metadata
4. Stripe Elements collects card → `stripe.confirmPayment()` → redirects to `/${serviceSlug}?payment_intent=...`
5. `payment_intent.succeeded` webhook → creates appointment in DB + sends confirmation email

### Key rules
- **Stripe `amount` = pence directly from DB** (`service.deposit`, already pence)
- **All booking state goes in Stripe `metadata`** — client-side Zustand state is cleared on redirect
- **Webhook must verify signature** via `STRIPE_WEBHOOK_SECRET`
- **Only listen to `payment_intent.succeeded`** — no other events needed
- **Idempotency key** on PaymentIntent creation: `booking_${holdToken}` — prevents duplicate appointments on webhook retry

### Env vars required
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook setup (Vercel)
- Endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
- Event: `payment_intent.succeeded` only
- Scope: "Your account" (not Connected accounts)
- Copy `whsec_...` signing secret to Vercel env vars (Runtime AND Build)

---

## Email (Resend)

### Critical: module-level instantiation fails Vercel builds

```ts
// ❌ WRONG — throws at build time if RESEND_API_KEY not in build env
export const resend = new Resend(process.env.RESEND_API_KEY!)
```

**Fix:** Either ensure `RESEND_API_KEY` is set in Vercel's **Build** environment variables
(Settings → Environment Variables → check "Build"), OR use lazy initialization.

### Env vars required
```
RESEND_API_KEY=re_...
EMAIL_FROM=Studio Name <noreply@yourdomain.com>
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

---

## Database (Neon / Prisma)

- Neon is serverless — expect **cold starts** (ETIMEDOUT, P1001 errors)
- Add a **dashboard error boundary** (`app/(owner)/dashboard/error.tsx`) to catch DB errors gracefully
- Add `export const dynamic = "force-dynamic"` to any server page that reads from the DB
- Run `prisma generate` before `next build` (already in `prebuild` script)

---

## Seeding

Always seed from the **deployed environment** or use timezone-safe timestamps (see above).
Never seed locally and expect the timestamps to match London time on a remote server.

Seed script clears data in this order (respect FK constraints):
```
slotHold → appointment → client → service → weeklyAvailability → blockedDate
```

Run seed:
```bash
pnpm prisma:seed
```

---

## Slot Availability Logic

- **Buffer:** 15 minutes before and after every appointment
- **Minimum booking notice:** 120 minutes from now
- Slot grid: 15-minute increments within weekly availability hours
- A slot is blocked if any appointment or active hold overlaps (including buffer)
- `areIntervalsOverlapping` from date-fns is used — intervals sharing only an endpoint do NOT overlap

---

## Vercel Deployment Checklist

- [ ] `OWNER_EMAIL` + `OWNER_PASSWORD_HASH` set (Runtime)
- [ ] `DATABASE_URL` set (Runtime + Build — Prisma generate needs it)
- [ ] `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set (from Stripe dashboard after creating endpoint)
- [ ] `RESEND_API_KEY` set (**Runtime AND Build**)
- [ ] `EMAIL_FROM` set
- [ ] `NEXT_PUBLIC_BASE_URL` set (no trailing slash)
- [ ] Stripe webhook endpoint created pointing to `/api/stripe/webhook`
- [ ] `pnpm prisma:seed` run against production DB after first deploy

---

## What Changes Per Demo (This Niche)

The engine (slots, holds, Stripe, webhook, manage page, dashboard) is identical.
Only these change:

| File | What to update |
|------|---------------|
| `lib/studio-data.ts` | Services, prices (pounds), deposits (pounds), durations, descriptions |
| `prisma/seed.ts` | Service prices/deposits (pence), appointment data, blocked dates |
| `prisma/schema.prisma` | Usually unchanged |
| Intake form fields | Swap allergy/referral fields for niche-specific questions |
| Email templates | Update copy, prep instructions, studio address |
| Policy wording | Cancellation windows, deposit rules |
| Availability hours | Days of week + open/close times |
| Landing/marketing page | Entirely niche-specific |

---

## Common Mistakes (Do Not Repeat)

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `setHours()` in seed | Wrong UTC timestamps, slots not blocked | Use `londonDate()` |
| `startOfDay(londonMidnight)` in queries | Queries wrong UTC day, misses appointments | Use `date` directly |
| `getDay(londonMidnight)` | Returns previous day's weekday in BST | Parse from dateStr |
| `formatCurrency` on studio-data values | Shows £0.20 instead of £20 | Use `£{value}` directly |
| `amount: service.deposit * 100` in Stripe | 100× overcharge (pence × 100) | Use `service.deposit` (already pence) |
| `new Resend()` at module level | Build fails on Vercel | Add key to Build env vars |
| Using argon2 | Native binding fail on serverless | Use `crypto` SHA-256 |
| Seeding locally, deploying remotely | Timezone mismatch in timestamps | Always seed on server |
| Missing `RESEND_API_KEY` in Build env | Build fails at page data collection | Add to Build scope in Vercel |

---
---

# Industry-Standard Booking Platform Knowledge (2025–2026)

> Sources: Cal.diy (Cal.com open-source fork), Fresha, Booksy, GlossGenius, Square Appointments,
> Mangomint, Acuity Scheduling, and current system design best practices.

This section is **reference knowledge** for any AI building a booking platform in the
beauty/wellness niche. It goes beyond this specific project and applies to all 5 demos.

---

## 1. Slot Reservation — Preventing Double Bookings

### The Two-Phase Hold Pattern (Industry Standard)

Every production booking system separates "intent" from "confirmation":

1. **Soft Hold** — temporary lock on the slot (DB row or Redis key) with a TTL (2–10 minutes).
   Expires automatically if the user abandons. Prevents two users from paying for the same slot.
2. **Hard Booking** — created only after payment succeeds (via webhook, not client-side).
   This is the permanent `Appointment` record.

**This project uses this pattern correctly:**
- `SlotHold` table with `expiresAt` (soft hold)
- `Appointment` created only in the Stripe webhook (hard booking)
- `holdToken` in Stripe metadata links the two phases

### Database-Level Safety

Never rely on application-level "check then write". Always use atomic operations:

```sql
-- ❌ WRONG: Race condition between SELECT and INSERT
SELECT * FROM appointments WHERE starts_at = '10:00' AND date = '2026-06-05';
-- (another request sneaks in here)
INSERT INTO appointments ...;

-- ✅ CORRECT: Atomic — fails if slot already taken
INSERT INTO appointments (starts_at, date, ...)
SELECT '10:00', '2026-06-05', ...
WHERE NOT EXISTS (
  SELECT 1 FROM appointments WHERE starts_at = '10:00' AND date = '2026-06-05'
);
```

Or use a **unique constraint** on `(startsAt, serviceId)` as a final safety net.
Prisma supports `@@unique([startsAt, serviceId])` in schema.prisma.

### Locking Strategies

| Strategy | When to use | Trade-off |
|----------|-------------|-----------|
| **Optimistic** (version column) | Low contention (most beauty studios) | Needs retry logic |
| **Pessimistic** (`SELECT FOR UPDATE`) | High contention (concert tickets, flash sales) | Can deadlock |
| **TTL-based hold** (what we use) | Medium contention, payment involved | Simple, no deadlocks |

For a solo-provider beauty studio, **TTL-based holds are ideal** — contention is low,
and the hold expiry handles abandoned bookings automatically.

---

## 2. Payment Flows

### Deposit vs Full Payment

| Model | When to use | No-show reduction |
|-------|-------------|-------------------|
| **No payment** | Free consultations, removal services | 0% (highest no-show) |
| **Deposit (20–50% of service)** | Standard for beauty/wellness | 65–75% reduction |
| **Full prepayment** | High-demand slots, new clients | 85–90% reduction |
| **Card-on-file (pre-auth)** | Recurring clients, memberships | 70% reduction |

**Industry standard for beauty/wellness:** 20–40% deposit at booking. Full payment collected at the chair.

### Stripe-Specific Patterns

- **PaymentIntents** (what we use) — best for one-off deposits
- **SetupIntents + later charge** — best for card-on-file / no-show fees
- **Checkout Sessions** — simpler but less control over the UX
- **Always use idempotency keys** — webhook retries must not create duplicate bookings
- **Store Stripe PaymentIntent ID** on the appointment for refund/dispute reference

### Refund Policies (Industry Norms)

| Window | Standard action |
|--------|----------------|
| 48+ hours before | Full deposit refund |
| 24–48 hours | 50% refund or credit |
| < 24 hours | No refund (deposit forfeited) |
| No-show | Deposit forfeited, client flagged |

---

## 3. Cancellation & Rescheduling

### Self-Service Manage Links (Industry Standard)

Clients should **never need to log in** to manage their booking. The standard pattern:

- Confirmation email includes a unique manage URL: `/appointment/{manageToken}`
- Token is a cryptographically random string (nanoid, UUID v4)
- Manage page allows: view details, reschedule, cancel
- Cancellation enforces the tiered policy (see refunds above)

**This project implements this correctly** with `manageToken` on each appointment.

### Rescheduling Flow

1. Client clicks "Reschedule" on manage page
2. Existing appointment status → `RESCHEDULING` (holds the old slot temporarily)
3. Client picks new date/time → new hold created
4. On confirmation → old appointment cancelled, new one created
5. If abandoned → old appointment remains, new hold expires

**Key insight:** Rescheduling is "cancel + rebook" atomically, not an in-place update.
Cal.diy and all major platforms treat it this way.

---

## 4. Availability Engine Design

### Slot Generation Algorithm

```
For each day in the requested range:
  1. Check weekly availability (day-of-week → open hours)
  2. Check blocked dates (holidays, personal days)
  3. Generate candidate slots at interval (e.g., every 15 minutes)
  4. For each candidate:
     a. Is it in the past? → skip
     b. Is it within minimum booking notice (e.g., 2 hours)? → skip
     c. Does it overlap with any existing appointment + buffer? → skip
     d. Does it overlap with any active hold? → skip
     e. Does the service duration fit before closing time? → skip
  5. Remaining candidates are available slots
```

### Buffer Time (Industry Standard)

| Business type | Buffer before | Buffer after |
|---------------|--------------|--------------|
| Lash extensions | 10–15 min | 10–15 min |
| Hair salon | 5–10 min | 5–10 min |
| Massage/spa | 15–30 min | 15–30 min |
| Nails | 5–10 min | 5–10 min |
| Brows/waxing | 5 min | 5 min |

Buffer accounts for: cleanup, sanitization, client changeover, brief consultation.

### Multi-Provider Support (Future)

If expanding beyond solo-provider:

```prisma
model Provider {
  id            String        @id @default(cuid())
  name          String
  services      Service[]     @relation("ProviderServices")
  appointments  Appointment[]
  availability  WeeklyAvailability[]
}
```

Each slot query filters by provider. Calendar views show per-provider columns.
Cal.diy uses this "event type per user" pattern at scale.

---

## 5. Notifications & Reminders

### Email Sequence (Industry Standard)

| Trigger | When | Content |
|---------|------|---------|
| **Confirmation** | Immediately after booking | Service, date, time, manage link, prep instructions, ICS attachment |
| **Reminder 1** | 24 hours before | "Your appointment is tomorrow" + reschedule/cancel link |
| **Reminder 2** | 2 hours before | "See you soon" + address/directions |
| **Follow-up** | 24 hours after | Thank you + rebooking CTA + review request |
| **Win-back** | 60 days inactive | "We miss you" + special offer |

### ICS Calendar Attachments

Always include `.ics` files in confirmation emails. This is the single most effective
way to reduce no-shows (30–40% reduction alone). Include:

- `DTSTART` / `DTEND` in UTC
- `SUMMARY`: Service name
- `LOCATION`: Studio address
- `DESCRIPTION`: Prep instructions + manage link
- `ORGANIZER`: Studio email
- `ATTENDEE`: Client email

**This project generates ICS correctly** via `lib/ics.ts`.

### SMS (Optional But Effective)

For beauty/wellness, SMS reminders have 98% open rate vs 20% for email.
Consider Twilio or MessageBird for the 2-hour reminder.
SMS adds ~£0.04/message cost — worth it for high-value services.

---

## 6. No-Show Handling

### Flagging System

```
First no-show:  Warning email, record on client profile
Second no-show: Flag client, require full prepayment for future bookings
Third no-show:  Block client from online booking (must call to book)
```

### Database Schema Pattern

```prisma
model Client {
  noShowCount   Int       @default(0)
  isFlagged     Boolean   @default(false)
  // When isFlagged: require full prepayment or block online booking
}
```

**This project has `noShowCount` and `isFlagged`** on the Client model.

### Deposit Forfeiture

On no-show:
1. Mark appointment status → `NO_SHOW`
2. Mark `depositStatus` → `FORFEITED`
3. Increment `client.noShowCount`
4. If threshold reached → set `client.isFlagged = true`
5. Send email: "You missed your appointment. Your deposit has been forfeited per our policy."

---

## 7. Waitlists (Enhancement)

When all slots on a day are taken:

```prisma
model WaitlistEntry {
  id          String   @id @default(cuid())
  clientEmail String
  clientName  String
  serviceId   String
  date        DateTime // The day they want
  createdAt   DateTime @default(now())
  notifiedAt  DateTime? // When we emailed them about an opening
  status      String   @default("WAITING") // WAITING | NOTIFIED | BOOKED | EXPIRED
}
```

When a cancellation opens a slot:
1. Check waitlist for that date + service
2. Send "A slot has opened up" email with a direct booking link
3. Give them 30 minutes to book before notifying the next person

---

## 8. Timezone Handling (Multi-Region)

### For UK-Only Businesses (Current)

- Store all timestamps in UTC in the database
- Use `Europe/London` for all display and availability calculations
- BST (UTC+1) active March–October, GMT (UTC+0) November–February
- **Critical:** London midnight in BST = `23:00 UTC` (previous day)

### For International Clients (Future)

If clients book from different timezones:

1. **Detect client timezone** via `Intl.DateTimeFormat().resolvedOptions().timeZone`
2. **Display slots in client's timezone** but calculate availability in provider's timezone
3. **Store in UTC** — always
4. **Confirmation email** shows both timezones: "10:00 AM BST (2:00 AM PST)"

Cal.diy handles this by storing the organizer's timezone on the event type
and converting for display. This is the correct pattern.

---

## 9. SEO for Booking Pages

### JSON-LD Structured Data

Every service page should include structured data for Google rich results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Classic Lash Set",
  "description": "Full set of classic eyelash extensions",
  "provider": {
    "@type": "BeautySalon",
    "name": "Lash by Nadia",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cambridge Heath Road",
      "addressLocality": "Bethnal Green",
      "addressRegion": "London"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "65.00",
    "priceCurrency": "GBP"
  }
}
</script>
```

### Meta Tags Per Service Page

```html
<title>Classic Lash Set — Book Online | Lash by Nadia</title>
<meta name="description" content="Book a classic eyelash extension set (90 min, from £65). 
Online booking with instant confirmation. Bethnal Green, London.">
```

### Open Graph for Social Sharing

When clients share their booking confirmation or the studio link on Instagram/WhatsApp:

```html
<meta property="og:title" content="Lash by Nadia — Book Online">
<meta property="og:description" content="Premium lash extensions in East London. Book your appointment online.">
<meta property="og:image" content="/og-image.jpg">
<meta property="og:type" content="website">
```

---

## 10. Mobile-First Booking UX

### Critical Design Rules

1. **Thumb-friendly tap targets** — minimum 44×44px for all buttons and time slots
2. **Single-column layout** on mobile — no side-by-side calendar + slots
3. **Sticky CTA** — "Continue" button fixed to bottom of viewport
4. **Progress indicator** — "Step 2 of 4" reduces abandonment by 20%
5. **Autofill-friendly forms** — use correct `autocomplete` attributes:
   - `autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`
6. **Minimal form fields** — name, email, phone only. Everything else optional.
7. **Calendar: native feel** — swipe for months, tap for dates, no dropdowns
8. **Loading states** — skeleton screens for slot loading, not spinners

### Conversion Benchmarks (Beauty/Wellness)

| Metric | Target |
|--------|--------|
| Booking page → service selection | 70%+ |
| Service → date/time selection | 60%+ |
| Date/time → form completion | 50%+ |
| Form → payment/confirmation | 80%+ |
| Overall conversion (visit → booked) | 15–25% |

---

## 11. Architecture Patterns from Cal.diy

Cal.diy (the open-source Cal.com fork) uses:

- **Next.js App Router** + **tRPC** for type-safe API calls
- **Prisma** for database access (PostgreSQL)
- **Tailwind CSS** for styling
- **NextAuth.js** for multi-user authentication
- **Monorepo** (Turborepo) — `packages/` for shared code, `apps/` for deployments

### What to Adopt from Cal.diy

| Pattern | Description | Adopt? |
|---------|-------------|--------|
| Event types per user | Each provider has their own services + availability | Yes (for multi-provider) |
| Booking confirmation via webhook | Never trust client-side "booking complete" | Already using ✅ |
| Timezone on the event type | Provider's TZ stored with the service | Yes |
| Availability as "schedules" | Named schedules (e.g., "Summer hours") switchable | Nice-to-have |
| Booking questions | Custom intake fields per service | Yes — replaces hardcoded allergies field |

### What NOT to Adopt

| Pattern | Why skip |
|---------|----------|
| tRPC | Overkill for a single-provider demo; plain API routes are simpler |
| Monorepo (Turborepo) | Single-app demos don't benefit from workspace splitting |
| NextAuth.js | Single-owner login is simpler with a cookie + env var hash |
| Daily.co video integration | Not relevant for in-person beauty services |

---

## 12. Data Model Reference (Industry Standard)

### Minimum Viable Schema

```
Service          → slug, name, duration, price, deposit, displayOrder
Client           → email, name, phone, noShowCount, isFlagged
Appointment      → clientId, serviceId, startsAt, endsAt, status, depositAmount, depositStatus, manageToken
SlotHold         → startsAt, endsAt, expiresAt, holdToken
WeeklyAvailability → dayOfWeek, startTime, endTime, isActive
BlockedDate      → date, reason
```

### Extended Schema (For Growth)

```
Provider         → name, email, bio, avatar (multi-provider support)
WaitlistEntry    → clientEmail, serviceId, date, status
Review           → clientId, appointmentId, rating, comment
Coupon           → code, discountType, discountValue, expiresAt, usageLimit
AuditLog         → action, entityType, entityId, performedBy, timestamp
```

---

## 13. Security Considerations

### Booking Flow

- **Rate limit** slot hold endpoint (prevent slot exhaustion attacks)
- **Rate limit** checkout endpoint (prevent payment spam)
- **Validate holdToken** exists and isn't expired before creating PaymentIntent
- **Verify webhook signature** — never trust unverified Stripe events
- **Sanitize all client input** — name, email, phone, allergies (XSS prevention)
- **ManageToken must be unguessable** — use `nanoid(21)` minimum, not sequential IDs

### Owner Dashboard

- **HttpOnly, Secure, SameSite=Strict** cookies for auth
- **CSRF protection** on all mutating actions
- **No client-side secrets** — Stripe secret key, DB URL, etc. must never appear in client bundles
- **Audit log** owner actions (mark no-show, cancel appointment) for dispute resolution

---

## 14. Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | < 2.5s | Google Core Web Vitals |
| INP (Interaction to Next Paint) | < 200ms | Slot selection must feel instant |
| CLS (Cumulative Layout Shift) | < 0.1 | Calendar/slots must not jump |
| Slot API response | < 500ms | Users abandon after 3s |
| Hold creation | < 300ms | Must feel instant on click |
| Webhook processing | < 5s | Stripe retries after 15s |

### Neon-Specific Performance

- First query after cold start: 2–5s (unavoidable on free tier)
- Subsequent queries: 10–50ms
- Mitigation: use `@neondatabase/serverless` with WebSocket pooling
- Dashboard error boundary catches `P1001` (connection refused) gracefully

@AGENTS.md
