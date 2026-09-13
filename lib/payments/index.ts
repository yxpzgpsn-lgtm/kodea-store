import type { PaymentProvider } from "@/lib/payments/types";
import { stripeProvider } from "@/lib/payments/stripe-provider";

const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  // INTEGRATION POINT: register additional providers here, e.g.
  // paypal: paypalProvider,
  // bank_transfer: bankTransferProvider,
  // cod: cashOnDeliveryProvider,
};

/**
 * Resolves the active payment provider for a store. Currently every store
 * uses Stripe; once `Store` gains a `paymentSettings` field (Phase 5), this
 * reads the store's configured provider id instead of a hardcoded default.
 */
export function getPaymentProvider(providerId: string = "stripe"): PaymentProvider {
  const provider = providers[providerId];
  if (!provider) throw new Error(`Unknown payment provider: ${providerId}`);
  return provider;
}

export type { PaymentProvider } from "@/lib/payments/types";
