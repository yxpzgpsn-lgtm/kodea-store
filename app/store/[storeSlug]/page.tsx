import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  // `storeSlug` is either a subdomain slug ("nova") or, when the visitor
  // arrived via a merchant's own domain, the full hostname — proxy.ts
  // can't tell those apart without a database lookup, so this route checks
  // both.
  const store = await prisma.store.findFirst({
    where: { OR: [{ slug: storeSlug }, { customDomain: storeSlug }] },
  });

  if (!store || (!store.isPublished && store.deletedAt)) notFound();

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{store.name}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {store.isPublished
          ? "This store's catalog is coming soon."
          : "This store hasn't been published yet."}
      </p>
    </div>
  );
}
