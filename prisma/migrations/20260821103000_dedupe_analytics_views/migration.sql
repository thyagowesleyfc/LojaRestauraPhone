ALTER TABLE "AnalyticsEvent" ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "AnalyticsEvent_dedupeKey_key" ON "AnalyticsEvent"("dedupeKey");