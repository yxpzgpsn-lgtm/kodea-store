"use server";

import { z } from "zod";
import { requestPasswordReset } from "@/services/password-reset-service";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export async function forgotPasswordAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input.";

  await requestPasswordReset(parsed.data.email);
  return "sent";
}
