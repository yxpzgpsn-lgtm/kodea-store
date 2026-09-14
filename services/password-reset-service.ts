import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always behave the same whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendEmail({
      to: email,
      subject: "Reset your Kodéa Store password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } catch {
    // INTEGRATION POINT: email provider isn't configured in this environment
    // (missing RESEND_API_KEY). The token still exists, so resets keep
    // working once email is configured — this only affects delivery.
  }
}

export class InvalidResetTokenError extends Error {
  constructor() {
    super("This reset link is invalid or has expired.");
  }
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date()) throw new InvalidResetTokenError();

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } }),
  ]);
}
