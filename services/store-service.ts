import { prisma } from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "store";
  let slug = base;
  let suffix = 1;

  while (await prisma.store.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
}

export interface CreateStoreInput {
  ownerId: string;
  name: string;
  category: string;
  businessType: string;
  country: string;
  currency: string;
  locale: string;
  stylePreference: string;
}

const THEME_PRESETS: Record<string, { colors: Record<string, string>; typography: { fontFamily: string }; radius: string }> = {
  minimal: {
    colors: { primary: "#111111", background: "#ffffff", foreground: "#111111" },
    typography: { fontFamily: "Geist Sans" },
    radius: "0.5rem",
  },
  bold: {
    colors: { primary: "#dc2626", background: "#0a0a0a", foreground: "#fafafa" },
    typography: { fontFamily: "Geist Sans" },
    radius: "0.25rem",
  },
  playful: {
    colors: { primary: "#7c3aed", background: "#faf5ff", foreground: "#1e1b2e" },
    typography: { fontFamily: "Geist Sans" },
    radius: "1.25rem",
  },
  classic: {
    colors: { primary: "#065f46", background: "#fffdf7", foreground: "#1c1917" },
    typography: { fontFamily: "Geist Sans" },
    radius: "0.375rem",
  },
};

function resolveThemeTokens(stylePreference: string) {
  return THEME_PRESETS[stylePreference] ?? THEME_PRESETS.minimal;
}

export async function createStore(input: CreateStoreInput) {
  const slug = await generateUniqueSlug(input.name);

  return prisma.$transaction(async (tx) => {
    const store = await tx.store.create({
      data: {
        name: input.name,
        slug,
        category: input.category,
        businessType: input.businessType,
        country: input.country,
        defaultCurrency: input.currency,
        supportedCurrencies: [input.currency],
        defaultLocale: input.locale,
        supportedLocales: [input.locale],
        ownerId: input.ownerId,
      },
    });

    await tx.storeMember.create({
      data: { storeId: store.id, userId: input.ownerId, role: "OWNER" },
    });

    await tx.inventoryLocation.create({
      data: { storeId: store.id, name: "Main warehouse", isDefault: true },
    });

    await tx.theme.create({
      data: {
        storeId: store.id,
        name: "Default",
        tokens: resolveThemeTokens(input.stylePreference),
        isActive: true,
      },
    });

    await tx.subscription.create({
      data: { storeId: store.id, plan: "FREE", status: "ACTIVE" },
    });

    return store;
  });
}

export async function updateStoreSettings(
  storeId: string,
  input: { name: string; defaultCurrency: string; country: string },
) {
  return prisma.store.update({
    where: { id: storeId },
    data: input,
  });
}

export async function getStoreMembers(storeId: string) {
  return prisma.storeMember.findMany({
    where: { storeId },
    include: { user: { select: { name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStoresForUser(userId: string) {
  return prisma.store.findMany({
    where: { members: { some: { userId } }, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
}
