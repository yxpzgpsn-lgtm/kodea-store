import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { listCategories } from "@/services/category-service";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction } from "./actions";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const categories = await listCategories(storeId);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href={`/dashboard/${storeId}/products`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Organize your catalog into categories.</p>
      </div>

      <CategoryForm storeId={storeId} categories={categories} />

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {category._count.products} product{category._count.products === 1 ? "" : "s"}
                </span>
                <form action={deleteCategoryAction.bind(null, storeId, category.id)}>
                  <Button type="submit" variant="ghost" size="icon-sm" title="Delete category">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
