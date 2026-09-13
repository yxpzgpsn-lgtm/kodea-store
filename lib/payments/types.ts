export interface Money {
  amountCents: number;
  currency: string;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: Money;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  providerRef: string;
  clientSecret?: string;
  status: "requires_payment" | "processing" | "succeeded" | "failed";
}

export interface PaymentResult {
  providerRef: string;
  status: "succeeded" | "failed";
}

export interface RefundResult {
  providerRef: string;
  refundedAmountCents: number;
}

export interface PaymentEvent {
  type: "payment_succeeded" | "payment_failed" | "refund_succeeded";
  providerRef: string;
  amountCents?: number;
}

/**
 * Every payment provider (Stripe, PayPal, bank transfer, cash on delivery, …)
 * implements this interface. Checkout and order services depend only on
 * `PaymentProvider` — never on a concrete SDK — so adding a provider is
 * additive: implement this interface and register it in `lib/payments/index.ts`.
 */
export interface PaymentProvider {
  readonly id: string;
  createPaymentIntent(input: CreatePaymentInput): Promise<PaymentIntentResult>;
  capture(providerRef: string): Promise<PaymentResult>;
  refund(providerRef: string, amount?: Money): Promise<RefundResult>;
  verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<PaymentEvent>;
}
