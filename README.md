# Lash by Nadia

A solo beauty operator's booking platform with deposit enforcement, policy automation, automated emails, no-show handling, and a calm owner dashboard.

**Studio:** Lash by Nadia — Bethnal Green, East London  
**Operator:** Nadia — solo lash artist

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Route Handlers)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod
- **State/Fetching:** TanStack Query v5, Zustand
- **UI:** shadcn/ui, Tailwind CSS v4
- **Payments:** Stripe (deposit collection, refunds, webhooks)
- **Email:** Resend + React Email
- **Auth:** iron-session (owner dashboard only)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (local via Docker, or cloud via Railway/Neon)

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in DATABASE_URL, Stripe keys, Resend key, and session secret

# Initialize the database
pnpm prisma migrate dev --name init
pnpm prisma db seed

# Start development server
pnpm dev
```

### Environment Variables

See `.env.local` for the full list. Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `SESSION_SECRET` | iron-session encryption password (32+ chars) |
| `OWNER_PASSWORD_HASH` | bcrypt hash of owner password |

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm prisma:migrate` | Run database migrations |

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (booking)/        # Client-facing booking flow
│   ├── (manage)/         # Client self-service (tokenised)
│   ├── (owner)/          # Owner dashboard (auth-protected)
│   └── api/              # API Route Handlers
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── booking/          # Booking flow components
│   ├── dashboard/        # Owner dashboard components
│   ├── manage/           # Client self-service components
│   └── shared/           # Shared components
├── hooks/                # React hooks (TanStack Query, Zustand)
├── lib/                  # Core utilities (db, stripe, session, etc.)
├── schemas/              # Zod validation schemas
├── types/                # TypeScript type definitions
├── emails/               # React Email templates
└── prisma/               # Database schema + migrations + seed
```
