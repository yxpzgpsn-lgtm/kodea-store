import { prisma } from "@/lib/db";

export interface DashboardOverview {
  revenueCents: number;
  orderCount: number;
  customerCount: number;
  averageOrderValueCents: number;
  recentOrders: {
    id: string;
    orderNumber: number;
    totalCents: number;
    status: string;
    customerEmail: string | null;
    createdAt: Date;
  }[];
}

export async function getDashboardOverview(
  storeId: string,
  sinceDays = 30,
): Promise<DashboardOverview> {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  const [orderAgg, customerCount, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId, createdAt: { gte: since }, status: { not: "CANCELLED" } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.customer.count({ where: { storeId, deletedAt: null } }),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: { select: { email: true } } },
    }),
  ]);

  const revenueCents = orderAgg._sum.totalCents ?? 0;
  const orderCount = orderAgg._count;

  return {
    revenueCents,
    orderCount,
    customerCount,
    averageOrderValueCents: orderCount > 0 ? Math.round(revenueCents / orderCount) : 0,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      status: order.status,
      customerEmail: order.customer?.email ?? null,
      createdAt: order.createdAt,
    })),
  };
}
