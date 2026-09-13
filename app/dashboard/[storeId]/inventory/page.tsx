import { Boxes } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function InventoryPage() {
  return (
    <PhasePlaceholder
      icon={Boxes}
      title="No inventory tracked yet"
      description="Stock levels, low-stock alerts and multi-location transfers appear once products exist."
      phase="Phase 3"
    />
  );
}
