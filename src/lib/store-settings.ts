import "server-only";

import { prisma } from "@/lib/prisma";

export const fallbackStoreSettings = {
  id: 1,
  tradeName: "RestauraPhone",
  cnpj: "",
  phone: "",
  email: "admin@example.com",
  address: "",
  mapEmbedUrl: "",
  aboutText: "",
  whatsappNumber: "",
  whatsappInitialMessage: "Ola, tenho interesse em um pedido.",
  bannerTransitionSeconds: 5,
  logoUrl: null,
  logoPublicId: null,
  darkLogoUrl: null,
  darkLogoPublicId: null,
  lightPrimaryColor: "#16a34a",
  lightBackgroundColor: "#ffffff",
  lightTextColor: "#171717",
  darkPrimaryColor: "#22c55e",
  darkBackgroundColor: "#171717",
  darkTextColor: "#fafafa",
  updatedAt: new Date(0)
};

export async function getStoreSettings() {
  return (
    (await prisma.storeSettings.findUnique({
      where: { id: 1 }
    })) ?? fallbackStoreSettings
  );
}