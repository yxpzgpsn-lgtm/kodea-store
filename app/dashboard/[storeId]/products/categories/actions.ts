"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import { createCategory, deleteCategory } from "@/services/category-service";

const createSchema = z.object({
  storeId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export async function createCategoryAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = createSchema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  try {
    await requireStoreAccess(parsed.data.storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  await createCategory(parsed.data.storeId, parsed.data);
  revalidatePath(`/dashboard/${parsed.data.storeId}/products/categories`);
}

export async function deleteCategoryAction(storeId: string, categoryId: string): Promise<void> {
  await requireStoreAccess(storeId, "products:write");
  await deleteCategory(storeId, categoryId);
  revalidatePath(`/dashboard/${storeId}/products/categories`);
}
