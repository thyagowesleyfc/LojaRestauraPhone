CREATE TYPE "MarketingIntegrationProvider" AS ENUM ('GOOGLE_TAG_MANAGER', 'META_PIXEL', 'TIKTOK_PIXEL');

CREATE TABLE "MarketingIntegration" (
    "id" TEXT NOT NULL,
    "provider" "MarketingIntegrationProvider" NOT NULL,
    "identifier" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingIntegration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingIntegration_provider_key" ON "MarketingIntegration"("provider");

CREATE INDEX "MarketingIntegration_active_idx" ON "MarketingIntegration"("active");