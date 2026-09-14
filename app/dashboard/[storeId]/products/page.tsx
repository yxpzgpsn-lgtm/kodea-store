import Link from "next/link";
import { Package, Plus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { listProducts } from "@/services/product-service";
import { listCategories } from "@/services/category-service";
import { formatMoney } from "@/lib/currency";
import type { ProductStatus } from "@prisma/client";
import { ProductsToolbar } from "./products-toolbar";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ search?: string; status?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { storeId } = await params;
  const query = await searchParams;

  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const [{ products, total }, categories] = await Promise.all([
    listProducts(storeId, {
      search: query.search,
      status: query.status as ProductStatus | undefined,
      categoryId: query.category,
      sort: query.sort as "newest" | "oldest" | "name" | undefined,
      page: query.page ? Number.parseInt(query.page, 10) : 1,
      pageSize: PAGE_SIZE,
    }),
    listCategories(storeId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/dashboard/${storeId}/products/categories`} />}>
            Categories
          </Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/dashboard/${storeId}/products/import`} />}>
            <Upload className="size-4" /> Import
          </Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={`/api/internal/stores/${storeId}/products/export`} />}>
            <Download className="size-4" /> Export
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href={`/dashboard/${storeId}/products/new`} />}>
            <Plus className="size-4" /> Add product
          </Button>
        </div>
      </div>

      <ProductsToolbar categories={categories} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <Package className="size-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No products yet</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Add your first product to start building your catalog.
          </p>
          <Button className="mt-4" nativeButton={false} render={<Link href={`/dashboard/${storeId}/products/new`} />}>
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-2.5 text-start font-normal">Product</th>
                <th className="px-5 py-2.5 text-start font-normal">Status</th>
                <th className="px-5 py-2.5 text-start font-normal">Category</th>
                <th className="px-5 py-2.5 text-end font-normal">Price</th>
                <th className="px-5 py-2.5 text-end font-normal">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const prices = product.variants.map((v) => v.priceCents);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const stock = product.variants.reduce(
                  (sum, v) => sum + v.inventoryItems.reduce((s, i) => s + i.quantity, 0),
                  0,
                );

                return (
                  <tr key={product.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/${storeId}/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{product.status}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {product.categories.map((c) => c.category.name).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-3 text-end">
                      {minPrice === maxPrice
                        ? formatMoney(minPrice, store.defaultCurrency)
                        : `${formatMoney(minPrice, store.defaultCurrency)} – ${formatMoney(maxPrice, store.defaultCurrency)}`}
                    </td>
                    <td className="px-5 py-3 text-end">{stock}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > PAGE_SIZE && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {products.length} of {total}. Pagination controls land with bulk editing.
        </p>
      )}
    </div>
  );
}
