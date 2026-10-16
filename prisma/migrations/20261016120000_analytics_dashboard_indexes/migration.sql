-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_sessionId_idx" ON "AnalyticsEvent"("type", "createdAt", "sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_productId_sessionId_idx" ON "AnalyticsEvent"("type", "createdAt", "productId", "sessionId");
