import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth/actions";
import { prisma } from "@/lib/db";
import { StoreAccessError, requireStoreAccess } from "@/lib/auth/require-store-access";
import { getStoresForUser } from "@/services/store-service";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StoreSwitcher } from "@/components/dashboard/store-switcher";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  try {
    await requireStoreAccess(storeId);
  } catch (error) {
    if (error instanceof StoreAccessError && error.status === 401) redirect("/login");
    redirect("/onboarding");
  }

  const session = await auth();
  const [store, stores] = await Promise.all([
    prisma.store.findUnique({ where: { id: storeId } }),
    getStoresForUser(session!.user.id),
  ]);
  if (!store) redirect("/onboarding");

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-60 shrink-0 flex-col border-e border-border p-4 md:flex">
        <StoreSwitcher stores={stores} activeStoreId={storeId} />
        <div className="mt-6">
          <SidebarNav storeId={storeId} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{session?.user.email}</span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="icon" title="Sign out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
