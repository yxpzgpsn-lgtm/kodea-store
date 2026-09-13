import { prisma } from "@/lib/db";
import { getStoreMembers } from "@/services/store-service";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const [store, members] = await Promise.all([
    prisma.store.findUniqueOrThrow({ where: { id: storeId } }),
    getStoreMembers(storeId),
  ]);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">General store details.</p>
      </div>

      <SettingsForm
        storeId={store.id}
        name={store.name}
        defaultCurrency={store.defaultCurrency}
        country={store.country}
      />

      <div>
        <h2 className="font-medium">Team</h2>
        <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{member.user.name ?? member.user.email}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
