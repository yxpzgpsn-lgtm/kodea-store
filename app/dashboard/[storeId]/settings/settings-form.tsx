"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStoreSettingsAction } from "./actions";

const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "SAR", "AED"];

export function SettingsForm({
  storeId,
  name,
  defaultCurrency,
  country,
}: {
  storeId: string;
  name: string;
  defaultCurrency: string;
  country: string | null;
}) {
  const [result, formAction, isPending] = useActionState(updateStoreSettingsAction, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6">
      <input type="hidden" name="storeId" value={storeId} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Store name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" defaultValue={country ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="defaultCurrency">Default currency</Label>
        <select
          id="defaultCurrency"
          name="defaultCurrency"
          defaultValue={defaultCurrency}
          className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {result && result !== "saved" && <p className="text-sm text-destructive">{result}</p>}
      {result === "saved" && <p className="text-sm text-emerald-600">Settings saved.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
