import { prisma } from "@/lib/db";
import type { Prisma, ProductStatus } from "@prisma/client";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueProductSlug(
  storeId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || "product";
  let slug = base;
  let suffix = 1;

  while (
    await prisma.product.findFirst({
      where: { storeId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

async function getDefaultLocationId(storeId: string): Promise<string> {
  const location =
    (await prisma.inventoryLocation.findFirst({ where: { storeId, isDefault: true } })) ??
    (await prisma.inventoryLocation.findFirst({ where: { storeId } }));
  if (!location) throw new Error("Store has no inventory location configured.");
  return location.id;
}

export interface ProductListFilters {
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  sort?: "newest" | "oldest" | "name" | "price";
  page?: number;
  pageSize?: number;
}

export async function listProducts(storeId: string, filters: ProductListFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const where: Prisma.ProductWhereInput = {
    storeId,
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categories: { some: { categoryId: filters.categoryId } } } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { variants: { some: { sku: { contains: filters.search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "oldest"
      ? { createdAt: "asc" }
      : filters.sort === "name"
        ? { name: "asc" }
        : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        variants: { include: { inventoryItems: true } },
        categories: { include: { category: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, pageSize };
}

export async function getProduct(storeId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, storeId, deletedAt: null },
    include: {
      variants: { include: { inventoryItems: { include: { location: true } } }, orderBy: { createdAt: "asc" } },
      categories: { include: { category: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export interface VariantInput {
  name: string;
  sku?: string;
  barcode?: string;
  priceCents: number;
  compareAtCents?: number;
  costCents?: number;
  quantity?: number;
  attributes?: Record<string, string>;
}

export interface ProductInput {
  name: string;
  description?: string;
  brand?: string;
  tags: string[];
  status: ProductStatus;
  categoryIds: string[];
  seoTitle?: string;
  seoDescription?: string;
  weightGrams?: number;
  imageUrls: string[];
  variant: VariantInput;
}

export async function createProduct(storeId: string, input: ProductInput) {
  const slug = await generateUniqueProductSlug(storeId, input.name);
  const locationId = await getDefaultLocationId(storeId);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        storeId,
        name: input.name,
        slug,
        description: input.description,
        brand: input.brand,
        tags: input.tags,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        weightGrams: input.weightGrams,
        categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
        images: { create: input.imageUrls.map((url, position) => ({ storeId, url, position })) },
      },
    });

    const variant = await tx.productVariant.create({
      data: {
        productId: product.id,
        name: input.variant.name,
        sku: input.variant.sku || null,
        barcode: input.variant.barcode || null,
        priceCents: input.variant.priceCents,
        compareAtCents: input.variant.compareAtCents,
        costCents: input.variant.costCents,
        attributes: input.variant.attributes ?? {},
      },
    });

    await tx.inventoryItem.create({
      data: { variantId: variant.id, locationId, quantity: input.variant.quantity ?? 0 },
    });

    return product;
  });
}

export async function updateProduct(
  storeId: string,
  productId: string,
  input: Omit<ProductInput, "variant">,
) {
  const slug = await generateUniqueProductSlug(storeId, input.name, productId);

  return prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany({ where: { productId } });

    return tx.product.update({
      where: { id: productId, storeId },
      data: {
        name: input.name,
        slug,
        description: input.description,
        brand: input.brand,
        tags: input.tags,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        weightGrams: input.weightGrams,
        categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
      },
    });
  });
}

export async function deleteProduct(storeId: string, productId: string) {
  await prisma.product.update({
    where: { id: productId, storeId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });
}

export async function duplicateProduct(storeId: string, productId: string) {
  const source = await getProduct(storeId, productId);
  if (!source) throw new Error("Product not found.");

  const locationId = await getDefaultLocationId(storeId);
  const slug = await generateUniqueProductSlug(storeId, `${source.name} copy`);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        storeId,
        name: `${source.name} (copy)`,
        slug,
        description: source.description,
        brand: source.brand,
        tags: source.tags,
        status: "DRAFT",
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        weightGrams: source.weightGrams,
        categories: { create: source.categories.map((c) => ({ categoryId: c.categoryId })) },
        images: { create: source.images.map((img) => ({ storeId, url: img.url, altText: img.altText, position: img.position })) },
      },
    });

    for (const variant of source.variants) {
      const newVariant = await tx.productVariant.create({
        data: {
          productId: product.id,
          name: variant.name,
          sku: variant.sku ? `${variant.sku}-copy` : null,
          barcode: null,
          priceCents: variant.priceCents,
          compareAtCents: variant.compareAtCents,
          costCents: variant.costCents,
          attributes: variant.attributes as Prisma.InputJsonValue,
        },
      });
      await tx.inventoryItem.create({ data: { variantId: newVariant.id, locationId, quantity: 0 } });
    }

    return product;
  });
}

export async function addVariant(storeId: string, productId: string, input: VariantInput) {
  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new Error("Product not found.");

  const locationId = await getDefaultLocationId(storeId);

  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: {
        productId,
        name: input.name,
        sku: input.sku || null,
        barcode: input.barcode || null,
        priceCents: input.priceCents,
        compareAtCents: input.compareAtCents,
        costCents: input.costCents,
        attributes: input.attributes ?? {},
      },
    });
    await tx.inventoryItem.create({
      data: { variantId: variant.id, locationId, quantity: input.quantity ?? 0 },
    });
    return variant;
  });
}

export async function updateVariant(
  storeId: string,
  variantId: string,
  input: Omit<VariantInput, "quantity">,
) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
  });
  if (!variant) throw new Error("Variant not found.");

  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name: input.name,
      sku: input.sku || null,
      barcode: input.barcode || null,
      priceCents: input.priceCents,
      compareAtCents: input.compareAtCents,
      costCents: input.costCents,
      attributes: input.attributes ?? {},
    },
  });
}

export async function deleteVariant(storeId: string, variantId: string) {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
  });
  if (!variant) throw new Error("Variant not found.");

  const siblingCount = await prisma.productVariant.count({ where: { productId: variant.productId } });
  if (siblingCount <= 1) {
    throw new Error("A product must have at least one variant.");
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
}
