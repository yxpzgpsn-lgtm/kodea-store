import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStoresForUser } from "@/services/store-service";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stores = await getStoresForUser(session.user.id);
  if (stores.length > 0) redirect(`/dashboard/${stores[0].id}`);

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/30 px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s set up your store</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This takes about two minutes.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
