# Roadmap

Tracks the phases from the product brief against what's implemented. Update
the status column as phases land — this file is the source of truth for
"what phase are we in," not the commit history.

| Phase | Scope                                          | Status        |
|-------|-------------------------------------------------|---------------|
| 1     | Architecture, DB schema, auth, RBAC scaffold     | ✅ Done       |
| 2     | Store creation + onboarding wizard               | ✅ Done       |
| 3     | Product + category + inventory system            | ⬜ Not started |
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

## Known gaps to close next (Phase 3 candidate order)

1. Product CRUD + variants + bulk CSV import/export.
2. Category tree management.
3. Inventory adjustments UI on top of the existing `InventoryItem`/`InventoryHistory` models.
