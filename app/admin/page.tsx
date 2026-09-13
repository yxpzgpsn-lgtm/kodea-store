import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isSuperAdmin) redirect("/dashboard");

  const [storeCount, userCount, activeSubscriptions] = await Promise.all([
    prisma.store.count({ where: { deletedAt: null } }),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const cards = [
    { label: "Total stores", value: storeCount },
    { label: "Total users", value: userCount },
    { label: "Active subscriptions", value: activeSubscriptions },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
        <p className="text-sm text-muted-foreground">Super admin — visible only to platform staff.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1.5 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        MRR/ARR, churn, feature flags and support tickets ship with SaaS billing (Phase 11).
      </p>
    </div>
  );
}
