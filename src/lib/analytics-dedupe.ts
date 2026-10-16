import type { AnalyticsEventInput } from "@/schemas/analytics";

type DedupeCandidate = Pick<
  AnalyticsEventInput,
  "pagePath" | "productId" | "sessionId" | "type"
>;

function normalizePagePath(pagePath: string) {
  try {
    return new URL(pagePath, "http://localhost").pathname;
  } catch {
    return pagePath.split("?")[0] || pagePath;
  }
}

export function getClientAnalyticsDedupeKey(
  event: DedupeCandidate
) {
  if (event.type === "PAGE_VIEW") {
    return `PAGE_VIEW:${event.sessionId}:${normalizePagePath(event.pagePath)}`;
  }

  if (event.type === "PRODUCT_VIEW" && event.productId) {
    return `PRODUCT_VIEW:${event.sessionId}:${event.productId}`;
  }

  return null;
}
