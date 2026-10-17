import type { AnalyticsEventInput } from "@/schemas/analytics";
import { normalizeAnalyticsPagePath } from "@/lib/analytics-path";

type DedupeCandidate = Pick<
  AnalyticsEventInput,
  "categoryId" | "pagePath" | "productId" | "promotionId" | "sessionId" | "type"
>;

export function getClientAnalyticsDedupeKey(
  event: DedupeCandidate
) {
  if (event.type === "PAGE_VIEW") {
    return `PAGE_VIEW:${event.sessionId}:${normalizeAnalyticsPagePath(event.pagePath)}`;
  }

  if (event.type === "PRODUCT_VIEW" && event.productId) {
    return `PRODUCT_VIEW:${event.sessionId}:${event.productId}`;
  }

  if (event.type === "PROMOTION_VIEW" && event.promotionId) {
    return `PROMOTION_VIEW:${event.sessionId}:${event.promotionId}`;
  }

  if (event.type === "CATEGORY_VIEW" && event.categoryId) {
    return `CATEGORY_VIEW:${event.sessionId}:${event.categoryId}`;
  }

  return null;
}
