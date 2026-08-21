import { createHash } from "node:crypto";

import type { AnalyticsEventInput } from "@/schemas/analytics";

function normalizePath(pagePath: string) {
  try {
    return new URL(pagePath, "http://localhost").pathname;
  } catch {
    return pagePath.split("?")[0] || pagePath;
  }
}

function createDedupeKey(parts: string[]) {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex");
}

export function getAnalyticsEventDedupeKey(event: AnalyticsEventInput) {
  if (event.type === "PAGE_VIEW") {
    return `PAGE_VIEW:${createDedupeKey([
      event.sessionId,
      normalizePath(event.pagePath)
    ])}`;
  }

  if (event.type === "PRODUCT_VIEW" && event.productId) {
    return `PRODUCT_VIEW:${createDedupeKey([
      event.sessionId,
      event.productId
    ])}`;
  }

  return null;
}