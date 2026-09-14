import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { getProduct } from "@/services/product-service";
import { listCategories } from "@/services/category-service";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { EditProductForm } from "./edit-product-form";
import { AddVariantForm } from "./add-variant-form";
import { deleteProductAction, duplicateProductAction, deleteVariantAction, adjustVariantStockAction } from "./actions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
  const { storeId, productId } = await params;

  const [product, categories, store] = await Promise.all([
    getProduct(storeId, productId),
    listCategories(storeId),
    prisma.store.findUniqueOrThrow({ where: { id: storeId } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/${storeId}/products`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to products
        </Link>
        <div className="flex items-center gap-2">
          <form action={duplicateProductAction.bind(null, storeId, productId)}>
            <Button type="submit" variant="outline" size="sm">
              <Copy className="size-4" /> Duplicate
            </Button>
          </form>
          <form action={deleteProductAction.bind(null, storeId, productId)}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="size-4" /> Archive & remove
            </Button>
          </form>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>

      <EditProductForm storeId={storeId} product={product} categories={categories} />

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Variants &amp; inventory</h2>

        <div className="space-y-3">
          {product.variants.map((variant) => (
            <div key={variant.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {variant.sku ?? "—"} · {formatMoney(variant.priceCents, store.defaultCurrency)}
                    {variant.compareAtCents
                      ? ` (was ${formatMoney(variant.compareAtCents, store.defaultCurrency)})`
                      : ""}
                  </p>
                </div>
                {product.variants.length > 1 && (
                  <form action={deleteVariantAction.bind(null, storeId, productId, variant.id)}>
                    <Button type="submit" variant="ghost" size="icon-sm" title="Delete variant">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {variant.inventoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.location.name}: <strong className="text-foreground">{item.quantity}</strong> in stock
                    </span>
                    <form
                      action={adjustVariantStockAction.bind(null, storeId, productId, item.id)}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="number"
                        name="delta"
                        placeholder="±qty"
                        className="h-7 w-20 rounded-md border border-border bg-background px-2 text-xs"
                      />
                      <Button type="submit" size="xs" variant="outline">
                        Apply
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <AddVariantForm storeId={storeId} productId={productId} />
      </section>
    </div>
  );
}
