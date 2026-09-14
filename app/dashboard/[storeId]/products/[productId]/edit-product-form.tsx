"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProductAction } from "./actions";

interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  tags: string[];
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  weightGrams: number | null;
  categories: { categoryId: string }[];
}

export function EditProductForm({
  storeId,
  product,
  categories,
}: {
  storeId: string;
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const [result, formAction, isPending] = useActionState(updateProductAction, undefined);
  const selectedCategoryIds = new Set(product.categories.map((c) => c.categoryId));

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="productId" value={product.id} />

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Product details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={product.description ?? ""} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" defaultValue={product.brand ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
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
          <Input id="tags" name="tags" defaultValue={product.tags.join(", ")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightGrams">Weight (grams)</Label>
          <Input
            id="weightGrams"
            name="weightGrams"
            type="number"
            min={0}
            defaultValue={product.weightGrams ?? ""}
          />
        </div>

        {categories.length > 0 && (
          <div className="space-y-1.5">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.has(category.id)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">SEO</h2>
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={product.seoTitle ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={product.seoDescription ?? ""} />
        </div>
      </section>

      {result && result !== "saved" && <p className="text-sm text-destructive">{result}</p>}
      {result === "saved" && <p className="text-sm text-emerald-600">Saved.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
