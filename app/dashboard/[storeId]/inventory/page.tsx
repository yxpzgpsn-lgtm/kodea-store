import { Boxes } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { getInventoryOverview, listInventory, listLocations } from "@/services/inventory-service";
import { Button } from "@/components/ui/button";
import { InventoryToolbar } from "./inventory-toolbar";
import { AddLocationForm } from "./add-location-form";
import { TransferForm } from "./transfer-form";
import { adjustInventoryAction } from "./actions";

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ search?: string; location?: string; lowStock?: string }>;
}) {
  const { storeId } = await params;
  const query = await searchParams;

  const [overview, locations, store, rows] = await Promise.all([
    getInventoryOverview(storeId),
    listLocations(storeId),
    prisma.store.findUniqueOrThrow({ where: { id: storeId } }),
    listInventory(storeId, {
      search: query.search,
      locationId: query.location,
      lowStockOnly: query.lowStock === "1",
    }),
  ]);

  const cards = [
    { label: "Total inventory value", value: formatMoney(overview.totalValueCents, store.defaultCurrency) },
    { label: "Products in stock", value: overview.productsInStock.toString() },
    { label: "Low-stock products", value: overview.lowStockCount.toString() },
    { label: "Out-of-stock products", value: overview.outOfStockCount.toString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Stock across all locations.</p>
        </div>
        <AddLocationForm storeId={storeId} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1.5 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <InventoryToolbar locations={locations} />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <Boxes className="size-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-medium">No inventory to show</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Inventory appears here once products have variants with tracked stock.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-2.5 text-start font-normal">Product</th>
                <th className="px-5 py-2.5 text-start font-normal">SKU</th>
                <th className="px-5 py-2.5 text-start font-normal">Location</th>
                <th className="px-5 py-2.5 text-end font-normal">Quantity</th>
                <th className="px-5 py-2.5 text-end font-normal">Adjust</th>
                <th className="px-5 py-2.5 text-end font-normal">Move</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isLow = row.quantity <= row.lowStockThreshold;
                const otherLocations = locations.filter((l) => l.id !== row.locationId);

                return (
                  <tr key={row.inventoryItemId} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      {row.productName}
                      {row.variantName !== "Default" && (
                        <span className="text-muted-foreground"> — {row.variantName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.sku ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.locationName}</td>
                    <td className="px-5 py-3 text-end">
                      <span
                        className={
                          row.quantity === 0
                            ? "font-medium text-destructive"
                            : isLow
                              ? "font-medium text-amber-600"
                              : ""
                        }
                      >
                        {row.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-end">
                      <form
                        action={adjustInventoryAction.bind(null, storeId, row.inventoryItemId)}
                        className="flex items-center justify-end gap-1.5"
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
                    </td>
                    <td className="px-5 py-3 text-end">
                      <TransferForm
                        storeId={storeId}
                        variantId={row.variantId}
                        fromLocationId={row.locationId}
                        otherLocations={otherLocations}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
