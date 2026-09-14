"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  tagline: string;
  monthlyCents: number;
  yearlyCents: number;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Try Kodéa Store with no commitment",
    monthlyCents: 0,
    yearlyCents: 0,
    features: [
      "Up to 25 products",
      "1 staff account",
      "Storefront + checkout",
      "Standard analytics",
      "Community support",
    ],
  },
  {
    name: "Pro",
    tagline: "For growing stores",
    monthlyCents: 2900,
    yearlyCents: 29000,
    highlighted: true,
    features: [
      "Unlimited products",
      "5 staff accounts",
      "Marketing automation",
      "Advanced analytics",
      "Abandoned cart recovery",
      "Priority support",
    ],
  },
  {
    name: "Business",
    tagline: "For scaling operations",
    monthlyCents: 9900,
    yearlyCents: 99000,
    features: [
      "Everything in Pro",
      "Unlimited staff accounts",
      "Multiple locations",
      "Custom domain",
      "API + webhooks access",
      "Dedicated support",
    ],
  },
];

function formatPrice(cents: number): string {
  if (cents === 0) return "$0";
  return `$${(cents / 100).toFixed(0)}`;
}

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          Start free. Upgrade when you&apos;re ready to grow.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border p-1">
          <button
            onClick={() => setYearly(false)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !yearly ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              yearly ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            Yearly <span className="opacity-70">(save ~17%)</span>
          </button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl border p-8",
              plan.highlighted
                ? "border-foreground/20 bg-foreground text-background shadow-xl"
                : "border-border bg-card",
            )}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p
              className={cn(
                "mt-1 text-sm",
                plan.highlighted ? "text-background/70" : "text-muted-foreground",
              )}
            >
              {plan.tagline}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                {formatPrice(yearly ? plan.yearlyCents : plan.monthlyCents)}
              </span>
              <span
                className={cn(
                  "text-sm",
                  plan.highlighted ? "text-background/70" : "text-muted-foreground",
                )}
              >
                /{yearly ? "year" : "month"}
              </span>
            </div>

            <ul className="mt-8 flex-1 space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8"
              variant={plan.highlighted ? "secondary" : "default"}
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Start for free
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
