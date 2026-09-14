"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductAction } from "./actions";

export function CreateProductForm({
  storeId,
  categories,
}: {
  storeId: string;
  categories: { id: string; name: string }[];
}) {
  const [error, formAction, isPending] = useActionState(createProductAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="storeId" value={storeId} />

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Product details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue="DRAFT"
              className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" placeholder="summer, best-seller" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightGrams">Weight (grams)</Label>
          <Input id="weightGrams" name="weightGrams" type="number" min={0} />
        </div>

        {categories.length > 0 && (
          <div className="space-y-1.5">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="categoryIds" value={category.id} />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Pricing &amp; inventory</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="0.01" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAtPrice">Compare-at price</Label>
            <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min={0} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost">Cost</Label>
            <Input id="cost" name="cost" type="number" step="0.01" min={0} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" name="barcode" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Starting stock</Label>
            <Input id="quantity" name="quantity" type="number" min={0} defaultValue={0} />
          </div>
        </div>
        <input type="hidden" name="variantName" value="Default" />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Images</h2>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
          <Textarea id="imageUrls" name="imageUrls" rows={3} placeholder="https://…" />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">SEO</h2>
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} />
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create product"}
      </Button>
    </form>
  );
}
