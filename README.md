# NOVA — E-commerce SaaS Platform

A multi-tenant e-commerce platform: create a store, add products, take
payments, and grow — all from one dashboard. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system design and
[docs/ROADMAP.md](docs/ROADMAP.md) for what's built vs. planned.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui
· Prisma · PostgreSQL · Auth.js v5 · Stripe · Redis (planned) · Resend
(planned) · OpenAI-compatible AI (planned)

## Getting started

1. **Start Postgres + Redis** (or point `DATABASE_URL`/`REDIS_URL` in `.env`
   at existing instances):

   ```bash
   docker compose up -d
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Fill in `AUTH_SECRET` (generate with `openssl rand -base64 32`) and any
   provider keys you have (Stripe, Google OAuth, Resend, OpenAI, S3). The app
   runs with all of those unset — only the features that need them will
   throw when actually invoked.

3. **Run migrations and seed demo data**:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   Seeding creates a demo store (`NOVA`) with 5 products, 6 customers, and
   12 orders, owned by `owner@nova.demo` / `password123`.

4. **Run the dev server**:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` for the marketing site, `/register` to
   create an account, or sign in with the seeded demo owner and go straight
   to `/dashboard`.

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#2-repository-shape) for the
full layout and the reasoning behind it (tenancy model, service-layer
boundary, payment abstraction, etc).

## Scripts

| Command             | Purpose                                   |
|----------------------|-------------------------------------------|
| `npm run dev`        | Start the dev server (Turbopack)          |
| `npm run build`      | Production build                          |
| `npm run db:migrate` | Apply Prisma migrations                   |
| `npm run db:seed`    | Seed the NOVA demo store                  |
| `npm run db:studio`  | Open Prisma Studio                        |
