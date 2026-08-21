import "server-only";

import { MarketingIntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const marketingIntegrationProviders = [
  {
    provider: MarketingIntegrationProvider.GOOGLE_TAG_MANAGER,
    title: "Google Tag Manager",
    description: "Container GTM para tags e conversoes.",
    fieldName: "googleTagManagerId",
    activeFieldName: "googleTagManagerActive",
    placeholder: "GTM-XXXXXXX"
  },
  {
    provider: MarketingIntegrationProvider.META_PIXEL,
    title: "Meta Pixel",
    description: "Pixel/dataset ID para eventos da Meta.",
    fieldName: "metaPixelId",
    activeFieldName: "metaPixelActive",
    placeholder: "123456789012345"
  },
  {
    provider: MarketingIntegrationProvider.TIKTOK_PIXEL,
    title: "TikTok Pixel",
    description: "Pixel ID do TikTok Ads Manager.",
    fieldName: "tiktokPixelId",
    activeFieldName: "tiktokPixelActive",
    placeholder: "CXXXXXXXXXXXXXXXXXXX"
  }
] as const;

export type MarketingIntegrationProviderConfig =
  (typeof marketingIntegrationProviders)[number];

export async function getMarketingIntegrations() {
  const integrations = await prisma.marketingIntegration.findMany();
  const integrationByProvider = new Map(
    integrations.map((integration) => [integration.provider, integration])
  );

  return marketingIntegrationProviders.map((config) => ({
    ...config,
    integration: integrationByProvider.get(config.provider) ?? null
  }));
}

export async function getActiveMarketingIntegrations() {
  return prisma.marketingIntegration.findMany({
    where: { active: true },
    orderBy: { provider: "asc" },
    select: {
      identifier: true,
      provider: true
    }
  });
}