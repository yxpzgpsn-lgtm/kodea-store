import { prisma } from "@/lib/db";
import type { InventoryChangeReason } from "@prisma/client";

export async function listLocations(storeId: string) {
  return prisma.inventoryLocation.findMany({ where: { storeId }, orderBy: { createdAt: "asc" } });
}

export async function createLocation(storeId: string, name: string, address?: string) {
  return prisma.inventoryLocation.create({ data: { storeId, name, address } });
}

export interface InventoryRow {
  inventoryItemId: string;
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string | null;
  locationId: string;
  locationName: string;
  quantity: number;
  lowStockThreshold: number;
}

export async function listInventory(
  storeId: string,
  filters: { locationId?: string; lowStockOnly?: boolean; search?: string } = {},
): Promise<InventoryRow[]> {
  const items = await prisma.inventoryItem.findMany({
    where: {
      location: { storeId },
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      ...(filters.search
        ? {
            variant: {
              OR: [
                { sku: { contains: filters.search, mode: "insensitive" } },
                { product: { name: { contains: filters.search, mode: "insensitive" } } },
              ],
            },
          }
        : {}),
    },
    include: { variant: { include: { product: true } }, location: true },
    orderBy: { updatedAt: "desc" },
  });

  const rows = items.map((item) => ({
    inventoryItemId: item.id,
    variantId: item.variantId,
    productId: item.variant.productId,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    sku: item.variant.sku,
    locationId: item.locationId,
    locationName: item.location.name,
    quantity: item.quantity,
    lowStockThreshold: item.lowStockThreshold,
  }));

  return filters.lowStockOnly ? rows.filter((r) => r.quantity <= r.lowStockThreshold) : rows;
}

export interface InventoryOverview {
  totalValueCents: number;
  productsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export async function getInventoryOverview(storeId: string): Promise<InventoryOverview> {
  const items = await prisma.inventoryItem.findMany({
    where: { location: { storeId } },
    include: { variant: true },
  });

  let totalValueCents = 0;
  let productsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const item of items) {
    totalValueCents += item.quantity * (item.variant.costCents ?? item.variant.priceCents);
    if (item.quantity > 0) productsInStock += 1;
    if (item.quantity === 0) outOfStockCount += 1;
    else if (item.quantity <= item.lowStockThreshold) lowStockCount += 1;
  }

  return { totalValueCents, productsInStock, lowStockCount, outOfStockCount };
}

export async function adjustInventory(
  storeId: string,
  inventoryItemId: string,
  change: number,
  reason: InventoryChangeReason,
  note?: string,
) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, location: { storeId } },
  });
  if (!item) throw new Error("Inventory item not found.");

  const newQuantity = item.quantity + change;
  if (newQuantity < 0) throw new Error("Adjustment would result in negative stock.");

  return prisma.$transaction([
    prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantity: newQuantity },
    }),
    prisma.inventoryHistory.create({
      data: { inventoryItemId, change, reason, note },
    }),
  ]);
}

export async function transferInventory(
  storeId: string,
  variantId: string,
  fromLocationId: string,
  toLocationId: string,
  quantity: number,
) {
  if (quantity <= 0) throw new Error("Transfer quantity must be positive.");
  if (fromLocationId === toLocationId) throw new Error("Source and destination must differ.");

  const [fromItem, toLocation] = await Promise.all([
    prisma.inventoryItem.findFirst({
      where: { variantId, locationId: fromLocationId, location: { storeId } },
    }),
    prisma.inventoryLocation.findFirst({ where: { id: toLocationId, storeId } }),
  ]);
  if (!fromItem || fromItem.quantity < quantity) throw new Error("Insufficient stock at source location.");
  if (!toLocation) throw new Error("Destination location not found.");

  return prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: fromItem.id },
      data: { quantity: { decrement: quantity } },
    });
    await tx.inventoryHistory.create({
      data: { inventoryItemId: fromItem.id, change: -quantity, reason: "TRANSFER_OUT" },
    });

    const toItem = await tx.inventoryItem.upsert({
      where: { variantId_locationId: { variantId, locationId: toLocationId } },
      update: { quantity: { increment: quantity } },
      create: { variantId, locationId: toLocationId, quantity },
    });
    await tx.inventoryHistory.create({
      data: { inventoryItemId: toItem.id, change: quantity, reason: "TRANSFER_IN" },
    });

    return tx.inventoryTransfer.create({
      data: { fromLocationId, toLocationId, quantity, status: "completed" },
    });
  });
}

export async function getInventoryHistory(storeId: string, inventoryItemId: string) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, location: { storeId } },
  });
  if (!item) throw new Error("Inventory item not found.");

  return prisma.inventoryHistory.findMany({
    where: { inventoryItemId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
