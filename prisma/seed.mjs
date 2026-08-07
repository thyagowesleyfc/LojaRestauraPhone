import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const bcryptCost = 12;

const categories = [
  { name: "Capas", slug: "capas" },
  { name: "Peliculas", slug: "peliculas" },
  { name: "Carregadores", slug: "carregadores" },
  { name: "Cabos", slug: "cabos" },
  { name: "Fones", slug: "fones" },
  { name: "Suportes", slug: "suportes" }
];

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to run prisma seed.`);
  }

  return value;
}

async function main() {
  const adminEmail = getRequiredEnv("ADMIN_EMAIL").trim().toLowerCase();
  const adminPassword = getRequiredEnv("ADMIN_PASSWORD");

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  await prisma.$transaction(async (tx) => {
    for (const [index, category] of categories.entries()) {
      await tx.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          displayOrder: index,
          active: true
        },
        create: {
          ...category,
          displayOrder: index,
          active: true
        }
      });
    }

    const existingAdmin = await tx.adminUser.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      await tx.adminUser.create({
        data: {
          email: adminEmail,
          passwordHash: await hash(adminPassword, bcryptCost),
          active: true
        }
      });
    }

    await tx.storeSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        tradeName: "RestauraPhone",
        cnpj: "",
        phone: "",
        email: adminEmail,
        address: "",
        mapEmbedUrl: "",
        aboutText: "",
        whatsappNumber: "",
        whatsappInitialMessage: "Ola, tenho interesse em um pedido.",
        lightPrimaryColor: "#16a34a",
        lightBackgroundColor: "#ffffff",
        lightTextColor: "#171717",
        darkPrimaryColor: "#22c55e",
        darkBackgroundColor: "#171717",
        darkTextColor: "#fafafa"
      }
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
