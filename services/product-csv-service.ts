import Papa from "papaparse";
import { prisma } from "@/lib/db";
import { createProduct } from "@/services/product-service";

const CSV_COLUMNS = [
  "name",
  "description",
  "brand",
  "tags",
  "status",
  "sku",
  "barcode",
  "price",
  "compare_at_price",
  "cost",
  "quantity",
  "weight_grams",
] as const;

/**
 * Exports one row per variant. A multi-variant product therefore spans
 * multiple rows sharing the same `name` — matching the common "flat CSV"
 * convention used by most storefront platforms.
 */
export async function exportProductsCsv(storeId: string): Promise<string> {
  const products = await prisma.product.findMany({
    where: { storeId, deletedAt: null },
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  const rows = products.flatMap((product) =>
    product.variants.map((variant) => ({
      name: product.name,
      description: product.description ?? "",
      brand: product.brand ?? "",
      tags: product.tags.join(";"),
      status: product.status,
      sku: variant.sku ?? "",
      barcode: variant.barcode ?? "",
      price: (variant.priceCents / 100).toFixed(2),
      compare_at_price: variant.compareAtCents ? (variant.compareAtCents / 100).toFixed(2) : "",
      cost: variant.costCents ? (variant.costCents / 100).toFixed(2) : "",
      quantity: "", // current stock is looked up separately per location; not exported here
      weight_grams: product.weightGrams ?? "",
    })),
  );

  return Papa.unparse({ fields: [...CSV_COLUMNS], data: rows });
}

export interface CsvImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

function toCents(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : undefined;
}

/**
 * Each row becomes one product with a single default variant. Importing
 * multiple variants per product from CSV isn't supported yet — that needs a
 * grouping key (e.g. a shared "handle" column) this MVP doesn't ask for.
 */
export async function importProductsCsv(storeId: string, csvText: string): Promise<CsvImportResult> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const result: CsvImportResult = { created: 0, errors: [] };

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const rowNumber = i + 2; // account for header row, 1-indexed

    const name = row.name?.trim();
    const priceCents = toCents(row.price);

    if (!name) {
      result.errors.push({ row: rowNumber, message: "Missing product name." });
      continue;
    }
    if (priceCents === undefined) {
      result.errors.push({ row: rowNumber, message: "Missing or invalid price." });
      continue;
    }

    try {
      await createProduct(storeId, {
        name,
        description: row.description || undefined,
        brand: row.brand || undefined,
        tags: row.tags ? row.tags.split(";").map((t) => t.trim()).filter(Boolean) : [],
        status: row.status === "ACTIVE" || row.status === "ARCHIVED" ? row.status : "DRAFT",
        categoryIds: [],
        imageUrls: [],
        weightGrams: row.weight_grams ? Number.parseInt(row.weight_grams, 10) : undefined,
        variant: {
          name: "Default",
          sku: row.sku || undefined,
          barcode: row.barcode || undefined,
          priceCents,
          compareAtCents: toCents(row.compare_at_price),
          costCents: toCents(row.cost),
          quantity: row.quantity ? Number.parseInt(row.quantity, 10) : 0,
        },
      });
      result.created += 1;
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  return result;
}
