"use server";

import { MarketingIntegrationProvider, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { marketingIntegrationsInputSchema } from "@/schemas/marketing";

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

function getCheckboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function getStringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseMarketingIntegrationsFormData(formData: FormData) {
  return marketingIntegrationsInputSchema.safeParse({
    googleTagManagerActive: getCheckboxValue(formData, "googleTagManagerActive"),
    googleTagManagerId: getStringValue(formData, "googleTagManagerId"),
    metaPixelActive: getCheckboxValue(formData, "metaPixelActive"),
    metaPixelId: getStringValue(formData, "metaPixelId"),
    tiktokPixelActive: getCheckboxValue(formData, "tiktokPixelActive"),
    tiktokPixelId: getStringValue(formData, "tiktokPixelId")
  });
}

export async function updateMarketingIntegrationsAction(formData: FormData) {
  const parsed = parseMarketingIntegrationsFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/marketing",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const integrations = [
    {
      active: parsed.data.googleTagManagerActive,
      identifier: parsed.data.googleTagManagerId.toUpperCase(),
      provider: MarketingIntegrationProvider.GOOGLE_TAG_MANAGER
    },
    {
      active: parsed.data.metaPixelActive,
      identifier: parsed.data.metaPixelId,
      provider: MarketingIntegrationProvider.META_PIXEL
    },
    {
      active: parsed.data.tiktokPixelActive,
      identifier: parsed.data.tiktokPixelId,
      provider: MarketingIntegrationProvider.TIKTOK_PIXEL
    }
  ];

  try {
    await prisma.$transaction(async (tx) => {
      for (const integration of integrations) {
        if (!integration.identifier) {
          await tx.marketingIntegration.deleteMany({
            where: { provider: integration.provider }
          });
          continue;
        }

        await tx.marketingIntegration.upsert({
          where: { provider: integration.provider },
          create: integration,
          update: {
            active: integration.active,
            identifier: integration.identifier
          }
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError("/admin/marketing", "Integracao duplicada.");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/marketing");
  redirect("/admin/marketing?sucesso=integracoes");
}