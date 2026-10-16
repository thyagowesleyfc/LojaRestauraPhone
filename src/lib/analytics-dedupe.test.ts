import assert from "node:assert/strict";
import { test } from "node:test";

import { getClientAnalyticsDedupeKey } from "./analytics-dedupe";

test("deduplica visualizações da mesma página na sessão", () => {
  const firstKey = getClientAnalyticsDedupeKey({
    pagePath: "/?utm_source=instagram",
    sessionId: "session-1",
    type: "PAGE_VIEW"
  });
  const reloadKey = getClientAnalyticsDedupeKey({
    pagePath: "/",
    sessionId: "session-1",
    type: "PAGE_VIEW"
  });

  assert.equal(firstKey, reloadKey);
});

test("deduplica visualizações do mesmo produto na sessão", () => {
  const firstKey = getClientAnalyticsDedupeKey({
    pagePath: "/produtos/cabo",
    productId: "product-1",
    sessionId: "session-1",
    type: "PRODUCT_VIEW"
  });
  const otherProductKey = getClientAnalyticsDedupeKey({
    pagePath: "/produtos/pelicula",
    productId: "product-2",
    sessionId: "session-1",
    type: "PRODUCT_VIEW"
  });

  assert.notEqual(firstKey, otherProductKey);
});

test("não deduplica eventos de interação", () => {
  assert.equal(
    getClientAnalyticsDedupeKey({
      pagePath: "/carrinho",
      sessionId: "session-1",
      type: "ADD_TO_CART"
    }),
    null
  );
});
