"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategoryAction } from "./actions";

export function CategoryForm({
  storeId,
  categories,
}: {
  storeId: string;
  categories: { id: string; name: string }[];
}) {
  const [error, formAction, isPending] = useActionState(createCategoryAction, undefined);

  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-4">
      <input type="hidden" name="storeId" value={storeId} />
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-description">Description</Label>
        <Input id="cat-description" name="description" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-parent">Parent category</Label>
        <select
          id="cat-parent"
          name="parentId"
          className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Adding…" : "Add category"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-4">{error}</p>}
    </form>
  );
}
