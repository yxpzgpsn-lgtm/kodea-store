"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLocationAction } from "./actions";

export function AddLocationForm({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false);
  const [result, formAction, isPending] = useActionState(
    createLocationAction.bind(null, storeId),
    undefined,
  );

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add location
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="space-y-1">
        <label htmlFor="location-name" className="text-xs text-muted-foreground">
          Location name
        </label>
        <Input id="location-name" name="name" className="h-8 w-48" required />
      </div>
      <div className="space-y-1">
        <label htmlFor="location-address" className="text-xs text-muted-foreground">
          Address (optional)
        </label>
        <Input id="location-address" name="address" className="h-8 w-56" />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Adding…" : "Save"}
      </Button>
      {result && result !== "saved" && <span className="text-xs text-destructive">{result}</span>}
    </form>
  );
}
