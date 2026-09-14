# Architecture — Kodéa Store

## 1. What this is

A multi-tenant e-commerce SaaS: one deployment serves many independent stores
("tenants"), each with its own storefront, catalog, orders, and customers,
sharing one codebase and one database via row-level tenancy (`storeId` on
every tenant-scoped table) rather than database-per-tenant. This is the same
model Shopify itself uses at this stage of scale, and it's the only one that
keeps schema migrations and cross-store analytics tractable.

## 2. Repository shape

Single Next.js app (App Router), not a monorepo — a monorepo buys nothing
until there's a second deployable (e.g. a separate worker service), and
adding one prematurely just adds path-resolution and build-config overhead.

```
app/
  (marketing)/              # public SaaS landing site — /, /pricing
  (auth)/                   # /login /register /forgot-password /reset-password
  onboarding/               # store-creation wizard
  admin/                    # super admin panel (platform-level)
  dashboard/                # store owner/manager/staff app, tenant-scoped
    [storeId]/
      products/ orders/ customers/ inventory/ marketing/
      analytics/ discounts/ store-builder/ settings/
  store/[storeSlug]/        # public storefront (SSR), OR resolved via
                             # middleware from a custom domain / subdomain
  api/
    v1/                     # versioned public REST API (API keys, webhooks)
    webhooks/               # inbound webhooks (stripe, etc.)
    trpc|internal/          # internal route handlers used by the dashboard
components/
  ui/                       # shadcn primitives
  storefront/ dashboard/ marketing/
lib/
  auth/                     # Auth.js config, session helpers, RBAC guards
  db/                       # Prisma client singleton
  payments/                 # payment-provider abstraction (see §7)
  storage/                  # S3-compatible client
  email/                    # Resend-compatible client + templates
  ai/                       # OpenAI-compatible client + prompt templates
  currency/                 # currency conversion abstraction
services/                   # domain logic, one file per aggregate
  product-service.ts order-service.ts inventory-service.ts
  customer-service.ts discount-service.ts analytics-service.ts ...
hooks/                      # client-side React hooks
types/                      # shared TypeScript types / zod schemas
prisma/
  schema.prisma
  seed.ts                   # demo data (Kodéa Store demo)
```

**Rule enforced throughout:** route handlers and Server Components stay
thin — they parse input, call a `services/*` function, and return a
response. All business logic and every Prisma query lives in `services/`, so
it's testable without spinning up Next.js and reusable between the REST API,
the dashboard, and background jobs.

## 3. Tenancy & data access

- Every tenant-owned table carries `storeId`.
- All service functions take `storeId` explicitly — never inferred from a
  global. This makes cross-tenant leaks a type error, not a runtime bug.
- The dashboard resolves `storeId` from the URL segment (`/dashboard/[storeId]/...`)
  and verifies via `StoreMember` that the session user has access before any
  query runs (`lib/auth/requireStoreAccess.ts`).
- The storefront resolves the store from the hostname (custom domain or
  `{slug}.platform.com`) in `proxy.ts` (Next.js 16 renamed Middleware to
  Proxy), which rewrites to `/store/[storeSlug]/...`; the storefront layout
  then loads the `Store` by slug or custom domain.

## 4. Roles & permissions (RBAC)

| Role          | Scope         | Notes                                   |
|---------------|---------------|------------------------------------------|
| Super Admin   | platform-wide | manages stores, subscriptions, system    |
| Store Owner   | one store     | full control incl. billing, delete store |
| Store Manager | one store     | operations, no billing/user management   |
| Staff         | one store     | scoped to assigned areas (orders, etc.)  |
| Customer      | storefront    | own account/orders only                  |

Implemented as `StoreMember.role` (owner/manager/staff) plus `User.isSuperAdmin`.
Permission checks are centralized in `lib/auth/permissions.ts` as pure
functions (`can(user, action, resource)`), unit-testable in isolation, called
from both route handlers and Server Components — never duplicated as ad hoc
`if (role === ...)` checks scattered through the UI.

## 5. Authentication

Auth.js (NextAuth) v5, credentials provider (email+password, hashed with
argon2) plus Google OAuth. Sessions are JWT-based, carrying `userId` and
`isSuperAdmin` only — everything else (store roles) is looked up fresh per
request from `StoreMember`, so a permission change takes effect immediately
instead of waiting for token refresh.

## 6. API architecture

- **Internal API** (`app/api/internal/**`) — used only by the dashboard/storefront
  via same-origin fetch; session-cookie authenticated.
- **Public API** (`app/api/v1/**`) — REST, versioned, authenticated via
  `Authorization: Bearer <api_key>`; keys are scoped to one store and a set
  of permissions, hashed at rest (`ApiKey.hashedKey`).
- **Webhooks out** — `Webhook` model stores subscriber URLs + event list per
  store; `services/webhook-service.ts` fires signed (`X-Kodea-Signature`,
  HMAC-SHA256) POSTs on domain events (`order.created`, `product.updated`, …)
  via a queued dispatcher (see §9) so a slow subscriber never blocks the
  request that triggered it.
- **Webhooks in** — `app/api/webhooks/stripe` etc., verify provider
  signatures before touching the database.
- GraphQL is deferred: the schema and service layer are designed so a
  GraphQL resolver layer can be added over the same `services/*` functions
  without touching REST, but it is not built in Phase 1–7.

## 7. Payment abstraction

```ts
interface PaymentProvider {
  createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentResult>
  capture(intentId: string): Promise<PaymentResult>
  refund(paymentId: string, amount?: Money): Promise<RefundResult>
  verifyWebhook(req: Request): Promise<PaymentEvent>
}
```
`lib/payments/stripe-provider.ts` implements this first; `lib/payments/index.ts`
resolves the active provider per store from `Store.paymentSettings`. Nothing
outside `lib/payments/` imports `stripe` directly — checkout and order
services depend only on the `PaymentProvider` interface, so adding PayPal or
COD later is additive, not a refactor.

## 8. Multi-currency / multi-language

- `Store.defaultCurrency` + `Store.supportedCurrencies[]`; prices stored as
  integer minor units (cents) in the store's default currency; display
  conversion goes through `lib/currency/convert.ts`, an abstraction over a
  pluggable rate source (static table now, live FX API later).
- i18n via `next-intl`; storefront locale resolved from `Store.supportedLocales`
  and the request; `dir="rtl"` is set automatically when the active locale is
  Arabic.

## 9. Background work

Redis-backed queue (BullMQ) for anything that shouldn't block a request:
abandoned-cart email timers, webhook dispatch, bulk CSV import/export,
analytics rollups. Defined in `lib/queue/` behind a `Queue` interface so the
dev environment can run an in-process fallback without Redis.

## 10. Security baseline

Argon2 password hashing · CSRF via Auth.js double-submit cookies · rate
limiting on auth/checkout routes (`lib/rate-limit.ts`, Redis token bucket) ·
zod validation on every route handler input · Prisma parameterized queries
(no raw SQL string interpolation) · React's default output escaping + a
strict CSP for the storefront · webhook signature verification · `AuditLog`
model recording who-did-what on sensitive admin actions · secrets only ever
read server-side from `process.env`, never sent to the client bundle.

## 11. Build phases (tracking)

Phase 1 (this pass): architecture, schema, folder structure, auth, RBAC scaffold.
Phases 2–12: store creation → catalog/inventory → storefront/cart → checkout/payments →
orders/customers → dashboard/analytics → store builder → marketing automation →
AI assistant → SaaS billing → security/perf/testing. See `docs/ROADMAP.md`.
