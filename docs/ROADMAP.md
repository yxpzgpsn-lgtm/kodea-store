# Roadmap

Tracks the phases from the product brief against what's implemented. Update
the status column as phases land — this file is the source of truth for
"what phase are we in," not the commit history.

| Phase | Scope                                          | Status        |
|-------|-------------------------------------------------|---------------|
| 1     | Architecture, DB schema, auth, RBAC scaffold     | ✅ Done       |
| 2     | Store creation + onboarding wizard               | ✅ Done       |
| 3     | Product + category + inventory system            | ✅ Done       |
| 4     | Storefront + shopping cart                       | ⬜ Not started |
| 5     | Checkout + payments                              | 🟡 Payment abstraction + Stripe provider only |
| 6     | Orders + customers                               | 🟡 Schema + dashboard overview only |
| 7     | Dashboard + analytics                            | 🟡 Overview cards only; trend charts pending |
| 8     | Store builder                                    | ⬜ Not started |
| 9     | Marketing automation                             | ⬜ Not started |
| 10    | AI assistant                                     | ⬜ Not started (client stub in `lib/ai`) |
| 11    | SaaS billing                                     | 🟡 Schema + FREE/PRO/BUSINESS plan model only |
| 12    | Security + performance + testing                 | ⬜ Not started |

## What "done" means for Phase 1–2

- `prisma/schema.prisma` models every entity from the brief's section 28.
- Auth.js v5 wired with Credentials + Google, argon2 password hashing, JWT sessions.
- RBAC via `StoreMember.role` + `lib/auth/permissions.ts`, enforced through
  `lib/auth/require-store-access.ts` in every tenant-scoped route.
- Onboarding wizard creates a real `Store`, `StoreMember`, default
  `InventoryLocation`, `Theme`, and `Subscription` in one transaction.
- Dashboard shell (sidebar, store switcher, topbar) with a real (not
  hardcoded) overview page reading live `Order`/`Customer` aggregates.
- Every other dashboard section (`products`, `orders`, `inventory`, …) is an
  honest empty state naming the phase that implements it — not a fake button.

## What "done" means for Phase 3

- Product CRUD (`services/product-service.ts`): create/update/delete (soft)/duplicate,
  multi-variant support, category assignment, image URLs, SEO fields.
- Category management (`services/category-service.ts`): flat + one-level parent nesting.
- CSV import/export (`services/product-csv-service.ts`): one row per variant on
  export; import creates one product + one default variant per row (no
  multi-variant grouping yet — see gap below).
- Inventory (`services/inventory-service.ts`): multi-location stock, manual
  adjustments with `InventoryHistory` audit trail, location-to-location
  transfers, and the overview cards (total value, in-stock/low-stock/out-of-stock
  counts) from section 10 of the brief, on `/dashboard/[storeId]/inventory`.
- Dashboard pages: `/products` (search/filter/sort), `/products/new`,
  `/products/[productId]` (edit + variants + stock adjust), `/products/categories`,
  `/products/import`, `/inventory`.

## Known gaps to close next

1. CSV import doesn't group multiple rows into one multi-variant product
   (needs a shared "handle" column convention).
2. No image upload — images are added by pasting a URL; `lib/storage` (S3)
   is wired but not used by the product form yet.
3. No bulk editing (select many products, change status/price together).
4. Category editing is create/delete only — no rename/re-parent UI yet.
