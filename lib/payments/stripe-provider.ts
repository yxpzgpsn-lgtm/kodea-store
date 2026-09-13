import Stripe from "stripe";
import type {
  CreatePaymentInput,
  Money,
  PaymentEvent,
  PaymentIntentResult,
  PaymentProvider,
  PaymentResult,
  RefundResult,
} from "@/lib/payments/types";

function getClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Configure it in .env before accepting Stripe payments.",
    );
  }
  return new Stripe(key);
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentResult> {
    const stripe = getClient();
    const intent = await stripe.paymentIntents.create({
      amount: input.amount.amountCents,
      currency: input.amount.currency.toLowerCase(),
      receipt_email: input.customerEmail,
      metadata: { orderId: input.orderId, ...input.metadata },
      automatic_payment_methods: { enabled: true },
    });

    return {
      providerRef: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status:
        intent.status === "succeeded"
          ? "succeeded"
          : intent.status === "processing"
            ? "processing"
            : intent.status === "requires_payment_method" || intent.status === "requires_action"
              ? "requires_payment"
              : "failed",
    };
  },

  async capture(providerRef: string): Promise<PaymentResult> {
    const stripe = getClient();
    const intent = await stripe.paymentIntents.capture(providerRef);
    return {
      providerRef: intent.id,
      status: intent.status === "succeeded" ? "succeeded" : "failed",
    };
  },

  async refund(providerRef: string, amount?: Money): Promise<RefundResult> {
    const stripe = getClient();
    const refund = await stripe.refunds.create({
      payment_intent: providerRef,
      amount: amount?.amountCents,
    });
    return {
      providerRef: refund.id,
      refundedAmountCents: refund.amount,
    };
  },

  async verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<PaymentEvent> {
    const stripe = getClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signatureHeader || !webhookSecret) {
      throw new Error("Missing Stripe signature header or STRIPE_WEBHOOK_SECRET");
    }

    const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        return { type: "payment_succeeded", providerRef: intent.id, amountCents: intent.amount };
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        return { type: "payment_failed", providerRef: intent.id };
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        return {
          type: "refund_succeeded",
          providerRef: charge.payment_intent as string,
          amountCents: charge.amount_refunded,
        };
      }
      default:
        throw new Error(`Unhandled Stripe event type: ${event.type}`);
    }
  },
};
