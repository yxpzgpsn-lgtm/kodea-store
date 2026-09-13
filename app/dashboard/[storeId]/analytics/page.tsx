import { BarChart3 } from "lucide-react";
import { PhasePlaceholder } from "@/components/dashboard/phase-placeholder";

export default function AnalyticsPage() {
  return (
    <PhasePlaceholder
      icon={BarChart3}
      title="Deeper analytics are coming"
      description="Revenue/order trend charts, cohort LTV and product performance breakdowns build on the overview data already live on your dashboard home."
      phase="Phase 7"
    />
  );
}
