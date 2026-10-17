import { createHash } from "node:crypto";

import type { AnalyticsEventInput } from "@/schemas/analytics";
import { normalizeAnalyticsPagePath } from "@/lib/analytics-path";

function createDedupeKey(parts: string[]) {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex");
}

export function normalizeAnalyticsSearchTerm(searchTerm: string | undefined) {
  return searchTerm
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") || null;
}

export function getAnalyticsEventDedupeKey(event: AnalyticsEventInput) {
  if (event.type === "PAGE_VIEW") {
    return `PAGE_VIEW:${createDedupeKey([
      event.sessionId,
      normalizeAnalyticsPagePath(event.pagePath)
    ])}`;
  }

  if (event.type === "PRODUCT_VIEW" && event.productId) {
    return `PRODUCT_VIEW:${createDedupeKey([
      event.sessionId,
      event.productId
    ])}`;
  }

  if (event.type === "PROMOTION_VIEW" && event.promotionId) {
    return `PROMOTION_VIEW:${createDedupeKey([
      event.sessionId,
      event.promotionId
    ])}`;
  }

  if (event.type === "CATEGORY_VIEW" && event.categoryId) {
    return `CATEGORY_VIEW:${createDedupeKey([
      event.sessionId,
      event.categoryId
    ])}`;
  }

  return null;
}
