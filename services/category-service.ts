import { prisma } from "@/lib/db";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(storeId: string, name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "category";
  let slug = base;
  let suffix = 1;

  while (
    await prisma.category.findFirst({
      where: { storeId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export async function listCategories(storeId: string) {
  return prisma.category.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export interface CategoryInput {
  name: string;
  description?: string;
  parentId?: string | null;
}

export async function createCategory(storeId: string, input: CategoryInput) {
  const slug = await generateUniqueSlug(storeId, input.name);
  return prisma.category.create({
    data: {
      storeId,
      name: input.name,
      slug,
      description: input.description,
      parentId: input.parentId || null,
    },
  });
}

export async function updateCategory(storeId: string, categoryId: string, input: CategoryInput) {
  const slug = await generateUniqueSlug(storeId, input.name, categoryId);
  return prisma.category.update({
    where: { id: categoryId, storeId },
    data: {
      name: input.name,
      slug,
      description: input.description,
      parentId: input.parentId || null,
    },
  });
}

export async function deleteCategory(storeId: string, categoryId: string) {
  await prisma.category.delete({ where: { id: categoryId, storeId } });
}
