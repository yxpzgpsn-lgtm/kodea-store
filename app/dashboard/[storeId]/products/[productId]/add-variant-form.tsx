"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addVariantAction } from "./actions";

export function AddVariantForm({ storeId, productId }: { storeId: string; productId: string }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, isPending] = useActionState(addVariantAction, undefined);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add variant
      </Button>
    );
  }

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="productId" value={productId} />

      <div className="space-y-1.5">
        <Label htmlFor="variant-name">Name</Label>
        <Input id="variant-name" name="name" placeholder="Red / Large" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="variant-sku">SKU</Label>
        <Input id="variant-sku" name="sku" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="variant-barcode">Barcode</Label>
        <Input id="variant-barcode" name="barcode" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="variant-price">Price</Label>
        <Input id="variant-price" name="price" type="number" step="0.01" min={0} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="variant-compare">Compare-at</Label>
        <Input id="variant-compare" name="compareAtPrice" type="number" step="0.01" min={0} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="variant-quantity">Starting stock</Label>
        <Input id="variant-quantity" name="quantity" type="number" min={0} defaultValue={0} />
      </div>

      {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}

      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add variant"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
