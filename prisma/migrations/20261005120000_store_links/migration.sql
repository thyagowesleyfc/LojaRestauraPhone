ALTER TYPE "AnalyticsEventType" ADD VALUE 'LINK_CLICK';

CREATE TABLE "StoreLink" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "redirectUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StoreLink_active_displayOrder_idx" ON "StoreLink"("active", "displayOrder");

ALTER TABLE "AnalyticsEvent" ADD COLUMN "linkId" TEXT;

CREATE INDEX "AnalyticsEvent_linkId_createdAt_idx" ON "AnalyticsEvent"("linkId", "createdAt");