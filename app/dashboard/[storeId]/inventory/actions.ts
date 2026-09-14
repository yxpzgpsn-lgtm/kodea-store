"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import { adjustInventory, transferInventory, createLocation } from "@/services/inventory-service";

export async function adjustInventoryAction(
  storeId: string,
  inventoryItemId: string,
  formData: FormData,
): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  const delta = Number.parseInt(String(formData.get("delta") ?? "0"), 10);
  if (!Number.isFinite(delta) || delta === 0) return;

  await adjustInventory(storeId, inventoryItemId, delta, "ADJUSTMENT", "Manual adjustment");
  revalidatePath(`/dashboard/${storeId}/inventory`);
}

const transferSchema = z.object({
  variantId: z.string(),
  fromLocationId: z.string(),
  toLocationId: z.string(),
  quantity: z.coerce.number().int().positive(),
});

export async function transferInventoryAction(
  storeId: string,
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await requireStoreAccess(storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  const parsed = transferSchema.safeParse({
    variantId: formData.get("variantId"),
    fromLocationId: formData.get("fromLocationId"),
    toLocationId: formData.get("toLocationId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  try {
    await transferInventory(
      storeId,
      parsed.data.variantId,
      parsed.data.fromLocationId,
      parsed.data.toLocationId,
      parsed.data.quantity,
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Transfer failed.";
  }

  revalidatePath(`/dashboard/${storeId}/inventory`);
}

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
});

export async function createLocationAction(
  storeId: string,
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await requireStoreAccess(storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  await createLocation(storeId, parsed.data.name, parsed.data.address);
  revalidatePath(`/dashboard/${storeId}/inventory`);
  return "saved";
}
