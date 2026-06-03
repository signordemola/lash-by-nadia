# Lash by Nadia

Solo lash artist booking platform. Client self-service booking flow with Stripe deposit enforcement, automated emails, and owner dashboard.

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma 7 + PostgreSQL (Neon)
- Tailwind CSS v4 + shadcn/ui (Base UI)
- Stripe Elements + webhook
- Resend transactional email
- TanStack Query + Zustand

## Setup

```bash
pnpm install
cp .env.example .env   # configure DATABASE_URL, STRIPE_*, RESEND_API_KEY, OWNER_*
pnpm prisma db push
pnpm prisma db seed
pnpm dev
```

## Environment Variables

```
DATABASE_URL=                          # Neon PostgreSQL connection
STRIPE_SECRET_KEY=                     # Stripe test mode secret
STRIPE_WEBHOOK_SECRET=                 # Stripe webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=    # Stripe publishable key
RESEND_API_KEY=                        # Resend API key
EMAIL_FROM=                            # Sender email address
OWNER_EMAIL=                           # Dashboard login email
OWNER_PASSWORD_HASH=                   # argon2id hash (generate: npx argon2-cli hash)
NEXT_PUBLIC_BASE_URL=                  # http://localhost:3000
UPSTASH_REDIS_REST_URL=                # Upstash Redis URL (rate limiting)
UPSTASH_REDIS_REST_TOKEN=              # Upstash Redis token
```

## Owner Dashboard

`/login` — Sign in with credentials from `OWNER_EMAIL`/`OWNER_PASSWORD_HASH`.

## Stripe Test Mode

Use test card `4242 4242 4242 4242` with any future expiry and any CVC.

For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Commands

```
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check
pnpm test          # Vitest unit tests
pnpm test:e2e      # Playwright E2E tests
pnpm prisma:studio # Database browser
```
