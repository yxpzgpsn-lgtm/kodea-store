import { Resend } from "resend";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set. Configure email in .env.");
  return new Resend(key);
}

/**
 * INTEGRATION POINT: templates (welcome, order confirmation, abandoned-cart,
 * discount) live in `lib/email/templates/*` and are called from
 * `services/*` — never call Resend directly from a route handler.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set. Configure email in .env.");

  await getClient().emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}
