import { Package } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function ProductsPage() {
  return (
    <PhasePlaceholder
      icon={Package}
      title="Add your first product"
      description="Product creation, variants, bulk editing and CSV import/export land in the catalog phase."
      phase="Phase 3"
    />
  );
}
