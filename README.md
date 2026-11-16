# Lash by Nadia

A booking site for a solo lash artist. Clients book a slot and pay a deposit online, and the owner manages the day from a dashboard.

<!-- Screenshot: add an image of the booking flow here -->
<!-- ![Lash by Nadia](docs/screenshot.png) -->

**Live site:** https://lash-by-nadia.vercel.app

## The problem

A solo lash artist loses income when a client does not arrive, and loses time when bookings happen by message.
This site lets clients book by themselves and pay a deposit to hold the slot.
It applies the cancellation policy automatically, so the owner does not have to argue about refunds.

## Features

**For clients**

- Pick a treatment, a date and a time. Slots come from the weekly opening hours, blocked dates and existing bookings.
- A chosen slot is held for 7 minutes while the client pays, so two people cannot pay for the same time.
- 15 minutes of buffer around each appointment, and a minimum notice of 2 hours.
- Deposit payment with Stripe Elements. The appointment is created only after Stripe confirms the payment by webhook.
- Confirmation email with a calendar (`.ics`) file and a private link to manage the booking.
- Reschedule or cancel from that link, with no account. Reschedule is open until 48 hours before the appointment.
- Cancellation policy applied by the server: refund at 48 hours or more, credit at 24 to 48 hours, no refund under 24 hours.
- A portal page that emails the manage link to the address used at booking.

**For the owner**

- Sign-in page and a dashboard with today's appointments. Each sign-in creates a session that is stored hashed in the database, lasts 24 hours and ends at sign-out.
- Appointment list, with actions to mark an appointment complete or no-show.
- Client list with no-show counts. A client is flagged after repeat no-shows.
- View of weekly availability and blocked dates.

**Under the hood**

- All times are calculated in `Europe/London`. All money is stored in pence.
- Rate limits on slot hold, checkout, owner sign-in, the portal and the returning-client check.
- Stripe webhook signature check, and an idempotency key on each payment.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- PostgreSQL with Prisma 7
- Stripe (PaymentIntents, Elements, webhooks)
- Resend and React Email
- Upstash Redis for rate limits
- TanStack Query and Zustand
- Tailwind CSS 4 and shadcn/ui
- Vitest and Playwright
- pnpm

## Run locally

You need:

- Node.js 20.19+, 22.12+ or 24+ (the versions Prisma 7 supports)
- pnpm 12
- A PostgreSQL database
- Stripe test keys, a Resend API key and an Upstash Redis database

```bash
pnpm install
cp .env.example .env
pnpm exec prisma migrate deploy
pnpm prisma:seed
pnpm dev
```

Open `http://localhost:3000`. The owner sign-in page is at `/login`.

To receive Stripe webhooks on your machine:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

In Stripe test mode, pay with card `4242 4242 4242 4242`, any future expiry date and any CVC.

### Environment variables

Set these in `.env`. The values in `.env.example` are fake.

| Variable                             | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| `DATABASE_URL`                       | PostgreSQL connection URL                          |
| `STRIPE_SECRET_KEY`                  | Stripe secret key                                  |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key                             |
| `RESEND_API_KEY`                     | Resend API key                                     |
| `EMAIL_FROM`                         | Sender name and address                            |
| `OWNER_EMAIL`                        | Owner sign-in email                                |
| `OWNER_PASSWORD_HASH`                | SHA-256 hex of the owner password                  |
| `NEXT_PUBLIC_BASE_URL`               | Site URL, used for links in emails                 |
| `UPSTASH_REDIS_REST_URL`             | Upstash Redis URL                                  |
| `UPSTASH_REDIS_REST_TOKEN`           | Upstash Redis token                                |

Create the password hash with:

```bash
printf 'your-password' | shasum -a 256
```

### Other commands

```bash
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
pnpm test           # Vitest tests. Set TEST_DATABASE_URL to a disposable database to include the session tests
pnpm test:e2e       # Playwright test (needs a built app and a database)
pnpm build          # lint, type check and production build
pnpm prisma:studio  # database browser
```

## Status and what's next

The full booking flow works: book, pay a deposit, get the email, reschedule, cancel, and manage from the dashboard.
The live site runs Stripe in test mode. Owner sign-in details for the live site are in `login.txt`.

Not built yet:

- Reminder emails before an appointment. Only confirmation and cancellation emails are sent.
- Editing availability from the dashboard. The page is read-only.
- More than one owner account.
- More tests. There are tests for slot overlap, owner sessions, the public lookups and the rate limiter, and one Playwright test.

---

Built by [Adedamola](https://github.com/signordemola) · [Demola Studio](https://www.demolastudio.com)

See also: [booking-engine](https://github.com/signordemola/booking-engine)
