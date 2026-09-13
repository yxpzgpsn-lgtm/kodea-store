"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStoreAccess, StoreAccessError } from "@/lib/auth/require-store-access";
import { updateStoreSettings } from "@/services/store-service";

const schema = z.object({
  storeId: z.string(),
  name: z.string().min(2, "Store name must be at least 2 characters"),
  defaultCurrency: z.string().min(1),
  country: z.string().min(1),
});

export async function updateStoreSettingsAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = schema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    defaultCurrency: formData.get("defaultCurrency"),
    country: formData.get("country"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  try {
    await requireStoreAccess(parsed.data.storeId, "store:edit_settings");
  } catch (error) {
    if (error instanceof StoreAccessError) return "You don't have permission to do that.";
    throw error;
  }

  const { storeId, ...data } = parsed.data;
  await updateStoreSettings(storeId, data);
  revalidatePath(`/dashboard/${storeId}/settings`);
  return "saved";
}
