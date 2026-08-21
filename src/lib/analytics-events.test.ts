import assert from "node:assert/strict";
import { test } from "node:test";

import { getAnalyticsEventDedupeKey } from "@/lib/analytics-events";

test("deduplicates page views by session and normalized path", () => {
  const firstKey = getAnalyticsEventDedupeKey({
    pagePath: "/?utm_source=instagram",
    sessionId: "session-1",
    type: "PAGE_VIEW"
  });
  const reloadKey = getAnalyticsEventDedupeKey({
    pagePath: "/",
    sessionId: "session-1",
    type: "PAGE_VIEW"
  });
  const otherSessionKey = getAnalyticsEventDedupeKey({
    pagePath: "/",
    sessionId: "session-2",
    type: "PAGE_VIEW"
  });

  assert.equal(firstKey, reloadKey);
  assert.notEqual(firstKey, otherSessionKey);
});

test("deduplicates product views by session and product", () => {
  const firstKey = getAnalyticsEventDedupeKey({
    pagePath: "/produtos/cabo",
    productId: "product-1",
    sessionId: "session-1",
    type: "PRODUCT_VIEW"
  });
  const reloadKey = getAnalyticsEventDedupeKey({
    pagePath: "/produtos/cabo?utm_source=instagram",
    productId: "product-1",
    sessionId: "session-1",
    type: "PRODUCT_VIEW"
  });
  const otherProductKey = getAnalyticsEventDedupeKey({
    pagePath: "/produtos/pelicula",
    productId: "product-2",
    sessionId: "session-1",
    type: "PRODUCT_VIEW"
  });

  assert.equal(firstKey, reloadKey);
  assert.notEqual(firstKey, otherProductKey);
});

test("does not deduplicate interaction events", () => {
  assert.equal(
    getAnalyticsEventDedupeKey({
      pagePath: "/carrinho",
      sessionId: "session-1",
      type: "ADD_TO_CART"
    }),
    null
  );
});