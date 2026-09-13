import { Tag } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function DiscountsPage() {
  return (
    <PhasePlaceholder
      icon={Tag}
      title="No discounts yet"
      description="Percentage, fixed-amount, free-shipping and buy-X-get-Y discounts ship with the storefront and checkout."
      phase="Phase 4"
    />
  );
}
