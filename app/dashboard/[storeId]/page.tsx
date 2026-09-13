import { formatMoney } from "@/lib/currency";
import { getDashboardOverview } from "@/services/analytics-service";
import { prisma } from "@/lib/db";

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const overview = await getDashboardOverview(storeId);

  const cards = [
    { label: "Revenue (30d)", value: formatMoney(overview.revenueCents, store.defaultCurrency) },
    { label: "Orders (30d)", value: overview.orderCount.toString() },
    { label: "Customers", value: overview.customerCount.toString() },
    {
      label: "Avg. order value",
      value: formatMoney(overview.averageOrderValueCents, store.defaultCurrency),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s how your store is doing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1.5 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-medium">Recent orders</h2>
        </div>
        {overview.recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders will appear here as soon as a customer checks out.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="px-5 py-2.5 text-start font-normal">Order</th>
                <th className="px-5 py-2.5 text-start font-normal">Customer</th>
                <th className="px-5 py-2.5 text-start font-normal">Status</th>
                <th className="px-5 py-2.5 text-end font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {overview.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">#{order.orderNumber}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {order.customerEmail ?? "Guest"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-end">
                    {formatMoney(order.totalCents, store.defaultCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
