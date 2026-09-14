"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import {
  updateProduct,
  deleteProduct,
  duplicateProduct,
  addVariant,
  deleteVariant,
} from "@/services/product-service";
import { adjustInventory } from "@/services/inventory-service";

const productSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  brand: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  categoryIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  weightGrams: z.coerce.number().int().positive().optional(),
});

export async function updateProductAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = productSchema.safeParse({
    storeId: formData.get("storeId"),
    productId: formData.get("productId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    brand: formData.get("brand") || undefined,
    tags: formData.get("tags") || undefined,
    status: formData.get("status"),
    categoryIds: formData.getAll("categoryIds"),
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    weightGrams: formData.get("weightGrams") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  try {
    await requireStoreAccess(parsed.data.storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  const { storeId, productId, ...data } = parsed.data;
  await updateProduct(storeId, productId, {
    ...data,
    tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    imageUrls: [],
  });
  revalidatePath(`/dashboard/${storeId}/products/${productId}`);
  return "saved";
}

export async function deleteProductAction(storeId: string, productId: string): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  await deleteProduct(storeId, productId);
  redirect(`/dashboard/${storeId}/products`);
}

export async function duplicateProductAction(storeId: string, productId: string): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  const copy = await duplicateProduct(storeId, productId);
  redirect(`/dashboard/${storeId}/products/${copy.id}`);
}

const variantSchema = z.object({
  storeId: z.string(),
  productId: z.string(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().optional(),
  cost: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().int().nonnegative().default(0),
});

export async function addVariantAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = variantSchema.safeParse({
    storeId: formData.get("storeId"),
    productId: formData.get("productId"),
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    barcode: formData.get("barcode") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    cost: formData.get("cost") || undefined,
    quantity: formData.get("quantity") || 0,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  try {
    await requireStoreAccess(parsed.data.storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  const data = parsed.data;
  await addVariant(data.storeId, data.productId, {
    name: data.name,
    sku: data.sku,
    barcode: data.barcode,
    priceCents: Math.round(data.price * 100),
    compareAtCents: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
    costCents: data.cost ? Math.round(data.cost * 100) : undefined,
    quantity: data.quantity,
  });
  revalidatePath(`/dashboard/${data.storeId}/products/${data.productId}`);
  return "saved";
}

export async function deleteVariantAction(
  storeId: string,
  productId: string,
  variantId: string,
): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  await deleteVariant(storeId, variantId);
  revalidatePath(`/dashboard/${storeId}/products/${productId}`);
}

export async function adjustVariantStockAction(
  storeId: string,
  productId: string,
  inventoryItemId: string,
  formData: FormData,
): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  const delta = Number.parseInt(String(formData.get("delta") ?? "0"), 10);
  if (!Number.isFinite(delta) || delta === 0) return;

  await adjustInventory(storeId, inventoryItemId, delta, "ADJUSTMENT", "Manual adjustment from product page");
  revalidatePath(`/dashboard/${storeId}/products/${productId}`);
}
