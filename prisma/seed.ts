import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: "Premium Sneakers", priceCents: 12900, category: "Footwear" },
  { name: "Minimal Watch", priceCents: 18900, category: "Accessories" },
  { name: "Urban Jacket", priceCents: 15900, category: "Outerwear" },
  { name: "Leather Backpack", priceCents: 21900, category: "Bags" },
  { name: "Classic Hoodie", priceCents: 7900, category: "Apparel" },
];

const CUSTOMER_NAMES = [
  ["Amelia", "Carter"],
  ["Noah", "Bennett"],
  ["Sofia", "Martins"],
  ["Liam", "Novak"],
  ["Yasmine", "Haddad"],
  ["Ethan", "Cole"],
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const ownerEmail = "owner@nova.demo";
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: "Nova Owner",
      passwordHash: await argon2.hash("password123", { type: argon2.argon2id }),
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: "nova" },
    update: {},
    create: {
      name: "NOVA",
      slug: "nova",
      category: "Fashion & Apparel",
      businessType: "Registered company",
      country: "United States",
      defaultCurrency: "USD",
      supportedCurrencies: ["USD"],
      isPublished: true,
      ownerId: owner.id,
      members: { create: { userId: owner.id, role: "OWNER" } },
      subscription: { create: { plan: "PRO", status: "ACTIVE" } },
    },
  });

  const location = await prisma.inventoryLocation.upsert({
    where: { id: `${store.id}-main` },
    update: {},
    create: { id: `${store.id}-main`, storeId: store.id, name: "Main warehouse", isDefault: true },
  });

  const variants = [];
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: slugify(p.name) } },
      update: {},
      create: {
        storeId: store.id,
        name: p.name,
        slug: slugify(p.name),
        description: `${p.name} — a NOVA best-seller.`,
        status: "ACTIVE",
        tags: [p.category],
      },
    });

    const variant = await prisma.productVariant.upsert({
      where: { productId_sku: { productId: product.id, sku: slugify(p.name) } },
      update: {},
      create: {
        productId: product.id,
        name: "Default",
        sku: slugify(p.name),
        priceCents: p.priceCents,
        attributes: {},
      },
    });

    await prisma.inventoryItem.upsert({
      where: { variantId_locationId: { variantId: variant.id, locationId: location.id } },
      update: {},
      create: { variantId: variant.id, locationId: location.id, quantity: 42 },
    });

    variants.push({ product, variant });
  }

  const customers = [];
  for (const [first, last] of CUSTOMER_NAMES) {
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
    const customer = await prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email } },
      update: {},
      create: { storeId: store.id, email, firstName: first, lastName: last },
    });
    customers.push(customer);
  }

  const existingOrders = await prisma.order.count({ where: { storeId: store.id } });
  if (existingOrders === 0) {
    for (let i = 0; i < 12; i++) {
      const customer = customers[i % customers.length];
      const { product, variant } = variants[i % variants.length];
      const quantity = 1 + (i % 3);
      const subtotal = variant.priceCents * quantity;

      await prisma.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          status: (["DELIVERED", "SHIPPED", "PROCESSING", "PENDING"] as const)[i % 4],
          paymentStatus: "PAID",
          shippingStatus: "FULFILLED",
          subtotalCents: subtotal,
          totalCents: subtotal,
          currency: "USD",
          createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
          items: {
            create: {
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              variantName: "Default",
              quantity,
              unitPriceCents: variant.priceCents,
              totalCents: subtotal,
            },
          },
        },
      });
    }
  }

  console.log(`Seeded NOVA demo store (slug: ${store.slug}).`);
  console.log(`Sign in as ${ownerEmail} / password123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
