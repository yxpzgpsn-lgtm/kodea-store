import { Megaphone } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function MarketingPage() {
  return (
    <PhasePlaceholder
      icon={Megaphone}
      title="No campaigns yet"
      description="Abandoned-cart flows, segmented email and the visual automation builder ship with marketing automation."
      phase="Phase 9"
    />
  );
}
