import type { StoreRole } from "@prisma/client";

export type Action =
  | "store:manage_billing"
  | "store:manage_users"
  | "store:delete"
  | "store:edit_settings"
  | "products:write"
  | "orders:write"
  | "orders:refund"
  | "discounts:write"
  | "marketing:write"
  | "analytics:read";

const rolePermissions: Record<StoreRole, Action[]> = {
  OWNER: [
    "store:manage_billing",
    "store:manage_users",
    "store:delete",
    "store:edit_settings",
    "products:write",
    "orders:write",
    "orders:refund",
    "discounts:write",
    "marketing:write",
    "analytics:read",
  ],
  MANAGER: [
    "store:edit_settings",
    "products:write",
    "orders:write",
    "orders:refund",
    "discounts:write",
    "marketing:write",
    "analytics:read",
  ],
  STAFF: ["products:write", "orders:write", "analytics:read"],
};

export function can(role: StoreRole, action: Action): boolean {
  return rolePermissions[role].includes(action);
}
