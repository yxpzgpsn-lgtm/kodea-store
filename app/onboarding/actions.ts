"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createStore } from "@/services/store-service";

const schema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  category: z.string().min(1, "Choose a category"),
  businessType: z.string().min(1, "Choose a business type"),
  country: z.string().min(1, "Choose a country"),
  currency: z.string().min(1, "Choose a currency"),
  locale: z.string().min(1, "Choose a language"),
  stylePreference: z.string().min(1, "Choose a design preference"),
});

export async function createStoreAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user) return "You must be signed in.";

  const parsed = schema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    businessType: formData.get("businessType"),
    country: formData.get("country"),
    currency: formData.get("currency"),
    locale: formData.get("locale"),
    stylePreference: formData.get("stylePreference"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  const store = await createStore({ ownerId: session.user.id, ...parsed.data });

  redirect(`/dashboard/${store.id}`);
}
