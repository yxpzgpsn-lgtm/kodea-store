"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import { createProduct } from "@/services/product-service";

const schema = z.object({
  storeId: z.string(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  brand: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  categoryIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  weightGrams: z.coerce.number().int().positive().optional(),
  imageUrls: z.string().optional(),
  variantName: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().optional(),
  cost: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().int().nonnegative().default(0),
});

export async function createProductAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = schema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    brand: formData.get("brand") || undefined,
    tags: formData.get("tags") || undefined,
    status: formData.get("status"),
    categoryIds: formData.getAll("categoryIds"),
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    weightGrams: formData.get("weightGrams") || undefined,
    imageUrls: formData.get("imageUrls") || undefined,
    variantName: formData.get("variantName") || "Default",
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
  const product = await createProduct(data.storeId, {
    name: data.name,
    description: data.description,
    brand: data.brand,
    tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    status: data.status,
    categoryIds: data.categoryIds,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    weightGrams: data.weightGrams,
    imageUrls: data.imageUrls
      ? data.imageUrls.split("\n").map((u) => u.trim()).filter(Boolean)
      : [],
    variant: {
      name: data.variantName,
      sku: data.sku,
      barcode: data.barcode,
      priceCents: Math.round(data.price * 100),
      compareAtCents: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
      costCents: data.cost ? Math.round(data.cost * 100) : undefined,
      quantity: data.quantity,
    },
  });

  redirect(`/dashboard/${data.storeId}/products/${product.id}`);
}
