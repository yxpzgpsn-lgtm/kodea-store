/**
 * Static conversion table as a placeholder rate source. Swap the body of
 * `getRate` for a live FX API call (cached in Redis) without touching any
 * caller — every price display goes through `convert()`, never a raw
 * multiplication against a hardcoded rate.
 */
const STATIC_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  DZD: 0.0074,
  SAR: 0.27,
  AED: 0.27,
};

export function getSupportedCurrencies(): string[] {
  return Object.keys(STATIC_RATES_TO_USD);
}

async function getRate(from: string, to: string): Promise<number> {
  const fromRate = STATIC_RATES_TO_USD[from];
  const toRate = STATIC_RATES_TO_USD[to];
  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion: ${from} -> ${to}`);
  }
  return fromRate / toRate;
}

export async function convert(amountCents: number, from: string, to: string): Promise<number> {
  if (from === to) return amountCents;
  const rate = await getRate(from, to);
  return Math.round(amountCents * rate);
}

export function formatMoney(amountCents: number, currency: string, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountCents / 100);
}
