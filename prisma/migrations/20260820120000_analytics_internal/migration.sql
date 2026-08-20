-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'PRODUCT_VIEW', 'SEARCH', 'SEARCH_NO_RESULTS', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'WHATSAPP_CLICK', 'ORDER_SENT_TO_WHATSAPP', 'PROMOTION_VIEW', 'CATEGORY_VIEW');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT,
    "productVariantId" TEXT,
    "promotionId" TEXT,
    "categoryId" TEXT,
    "searchTerm" TEXT,
    "searchTermNormalized" TEXT,
    "resultsCount" INTEGER,
    "pagePath" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_createdAt_idx" ON "AnalyticsEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_createdAt_idx" ON "AnalyticsEvent"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productVariantId_createdAt_idx" ON "AnalyticsEvent"("productVariantId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_promotionId_createdAt_idx" ON "AnalyticsEvent"("promotionId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_categoryId_createdAt_idx" ON "AnalyticsEvent"("categoryId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_searchTermNormalized_createdAt_idx" ON "AnalyticsEvent"("searchTermNormalized", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_utmSource_utmMedium_utmCampaign_idx" ON "AnalyticsEvent"("utmSource", "utmMedium", "utmCampaign");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");