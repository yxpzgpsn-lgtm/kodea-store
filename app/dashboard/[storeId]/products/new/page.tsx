import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/services/category-service";
import { CreateProductForm } from "./create-product-form";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const categories = await listCategories(storeId);

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href={`/dashboard/${storeId}/products`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>

      <CreateProductForm storeId={storeId} categories={categories} />
    </div>
  );
}
