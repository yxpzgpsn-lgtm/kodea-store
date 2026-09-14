"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { transferInventoryAction } from "./actions";

export function TransferForm({
  storeId,
  variantId,
  fromLocationId,
  otherLocations,
}: {
  storeId: string;
  variantId: string;
  fromLocationId: string;
  otherLocations: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [error, formAction, isPending] = useActionState(
    transferInventoryAction.bind(null, storeId),
    undefined,
  );

  if (otherLocations.length === 0) return null;

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="xs" onClick={() => setOpen(true)}>
        Transfer
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="fromLocationId" value={fromLocationId} />
      <select name="toLocationId" className="h-7 rounded-md border border-border bg-background px-1.5 text-xs">
        {otherLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="quantity"
        min={1}
        placeholder="qty"
        className="h-7 w-16 rounded-md border border-border bg-background px-2 text-xs"
        required
      />
      <Button type="submit" size="xs" disabled={isPending}>
        {isPending ? "…" : "Go"}
      </Button>
      <Button type="button" variant="ghost" size="xs" onClick={() => setOpen(false)}>
        ×
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </form>
  );
}
