import { ShoppingCart } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function OrdersPage() {
  return (
    <PhasePlaceholder
      icon={ShoppingCart}
      title="No orders yet"
      description="Full order management — statuses, refunds, timeline, invoices — lands with checkout and payments."
      phase="Phase 5–6"
    />
  );
}
