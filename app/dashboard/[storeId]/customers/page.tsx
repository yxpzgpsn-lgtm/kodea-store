import { Users } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function CustomersPage() {
  return (
    <PhasePlaceholder
      icon={Users}
      title="No customers yet"
      description="Customer profiles, segments and lifetime value populate as orders come in."
      phase="Phase 6"
    />
  );
}
