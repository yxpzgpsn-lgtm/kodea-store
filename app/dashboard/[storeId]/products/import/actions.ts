"use server";

import { revalidatePath } from "next/cache";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import { importProductsCsv, type CsvImportResult } from "@/services/product-csv-service";

export async function importProductsAction(
  storeId: string,
  _prevState: (CsvImportResult & { error?: string }) | undefined,
  formData: FormData,
): Promise<CsvImportResult & { error?: string }> {
  try {
    await requireStoreAccess(storeId, "products:write");
  } catch (error) {
    if (error instanceof StoreAccessError) {
      return { created: 0, errors: [], error: "You don't have permission to do that." };
    }
    throw error;
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, errors: [], error: "Choose a CSV file to upload." };
  }

  const text = await file.text();
  const result = await importProductsCsv(storeId, text);

  if (result.created > 0) revalidatePath(`/dashboard/${storeId}/products`);
  return result;
}
