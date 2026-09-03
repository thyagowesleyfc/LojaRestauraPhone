import "server-only";

import { Prisma } from "@prisma/client";

import { DEFAULT_PRIVACY_PAGE_CONTENT } from "@/lib/privacy-content";
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
  privacyPageContent: DEFAULT_PRIVACY_PAGE_CONTENT,
  whatsappNumber: "",
  whatsappInitialMessage: "Ola, tenho interesse em um pedido.",
  bannerTransitionSeconds: 5,
  offerCountdownHeadline: "",
  offerCountdownLink: "",
  offerCountdownDurationSeconds: 0,
  offerCountdownBackgroundColor: "#16a34a",
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

function isMissingSchemaError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export async function getStoreSettings() {
  try {
    return (
      (await prisma.storeSettings.findUnique({
        where: { id: 1 }
      })) ?? fallbackStoreSettings
    );
  } catch (error) {
    if (isMissingSchemaError(error)) {
      return fallbackStoreSettings;
    }

    throw error;
  }
}