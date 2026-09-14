import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImportForm } from "./import-form";

export default async function ImportProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="max-w-lg space-y-6">
      <Link
        href={`/dashboard/${storeId}/products`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV with columns: name, description, brand, tags (semicolon-separated),
          status, sku, barcode, price, compare_at_price, cost, quantity, weight_grams. Each row
          creates one product with a single default variant.
        </p>
      </div>

      <ImportForm storeId={storeId} />
    </div>
  );
}
