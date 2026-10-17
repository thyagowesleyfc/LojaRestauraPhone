import assert from "node:assert/strict";
import { test } from "node:test";

import { getClientAnalyticsDedupeKey } from "./analytics-dedupe";
import {
  getAnalyticsEventDedupeKey,
  normalizeAnalyticsSearchTerm
} from "./analytics-events";

test("deduplica visualizações de promoção e categoria por sessão", () => {
  const clientCategoryKey = getClientAnalyticsDedupeKey({
    categoryId: "category-1",
    pagePath: "/categorias/cabos",
    sessionId: "session-1",
    type: "CATEGORY_VIEW"
  });
  const clientCategoryReloadKey = getClientAnalyticsDedupeKey({
    categoryId: "category-1",
    pagePath: "/categorias/cabos?utm_source=instagram",
    sessionId: "session-1",
    type: "CATEGORY_VIEW"
  });
  const serverPromotionKey = getAnalyticsEventDedupeKey({
    pagePath: "/promocoes/combo",
    promotionId: "promotion-1",
    sessionId: "session-1",
    type: "PROMOTION_VIEW"
  });

  assert.equal(clientCategoryKey, clientCategoryReloadKey);
  assert.notEqual(serverPromotionKey, null);
});

test("normaliza termos para os rankings de busca", () => {
  assert.equal(normalizeAnalyticsSearchTerm("  Cabo Tipo C  "), "cabo tipo c");
  assert.equal(normalizeAnalyticsSearchTerm("Película"), "pelicula");
  assert.equal(normalizeAnalyticsSearchTerm("   "), null);
});
