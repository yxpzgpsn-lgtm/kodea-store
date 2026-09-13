import { Palette } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function StoreBuilderPage() {
  return (
    <PhasePlaceholder
      icon={Palette}
      title="Your storefront isn't published yet"
      description="The drag-and-drop section builder, theme editor and AI store assistant ship together in the store-builder phase."
      phase="Phase 8"
    />
  );
}
