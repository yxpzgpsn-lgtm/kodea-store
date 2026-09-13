import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="pt-16">
      <PricingSection />
    </div>
  );
}
