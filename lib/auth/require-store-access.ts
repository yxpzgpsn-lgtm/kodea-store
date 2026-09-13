import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Action } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/permissions";

export class StoreAccessError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? "Not authenticated" : "Not authorized");
  }
}

/**
 * Resolves and authorizes the current session against a store, in one place,
 * so every route handler / server component checks tenancy the same way.
 */
export async function requireStoreAccess(storeId: string, action?: Action) {
  const session = await auth();
  if (!session?.user) throw new StoreAccessError(401);

  if (session.user.isSuperAdmin) {
    return { userId: session.user.id, role: "OWNER" as const, isSuperAdmin: true };
  }

  const membership = await prisma.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } },
  });
  if (!membership) throw new StoreAccessError(403);
  if (action && !can(membership.role, action)) throw new StoreAccessError(403);

  return { userId: session.user.id, role: membership.role, isSuperAdmin: false };
}
