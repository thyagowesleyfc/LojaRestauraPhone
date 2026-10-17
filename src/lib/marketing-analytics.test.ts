import assert from "node:assert/strict";
import { test } from "node:test";

import {
  countSessionEvents,
  getEntrySessionIds,
  getOrderRanking,
  getUniqueEntityViewCounts,
  restrictToSessions
} from "./marketing-analytics";

test("usa apenas sessões que entraram pela Home ou pela página de links", () => {
  const entrySessions = getEntrySessionIds([
    {
      createdAt: "2026-01-01T10:02:00.000Z",
      pagePath: "/produtos/cabo",
      sessionId: "session-product-first"
    },
    {
      createdAt: "2026-01-01T10:00:00.000Z",
      pagePath: "/",
      sessionId: "session-home"
    },
    {
      createdAt: "2026-01-01T10:01:00.000Z",
      pagePath: "/links?utm_source=instagram",
      sessionId: "session-links"
    },
    {
      createdAt: "2026-01-01T10:03:00.000Z",
      pagePath: "/",
      sessionId: "session-product-first"
    }
  ]);

  assert.deepEqual([...entrySessions].sort(), ["session-home", "session-links"]);
});

test("restringe cada etapa do funil às sessões de entrada", () => {
  const entrySessions = new Set(["session-home", "session-links"]);
  const productSessions = new Set(["session-home", "session-direct-product"]);

  assert.deepEqual(
    [...restrictToSessions(productSessions, entrySessions)].sort(),
    ["session-home"]
  );
});

test("conta uma visualização por entidade e sessão", () => {
  const counts = getUniqueEntityViewCounts(
    [
      { entityId: "product-1", sessionId: "session-1" },
      { entityId: "product-1", sessionId: "session-1" },
      { entityId: "product-1", sessionId: "session-2" },
      { entityId: "product-2", sessionId: "session-1" },
      { entityId: null, sessionId: "session-1" }
    ],
    new Set(["session-1", "session-2"])
  );

  assert.deepEqual([...counts.entries()].sort(), [
    ["product-1", 2],
    ["product-2", 1]
  ]);
});

test("soma eventos de interação apenas das sessões de entrada", () => {
  const total = countSessionEvents(
    [
      { count: 2, sessionId: "session-home" },
      { count: 3, sessionId: "session-direct-product" },
      { count: 1, sessionId: null }
    ],
    new Set(["session-home"])
  );

  assert.equal(total, 2);
});

test("classifica pedidos de produtos e promoções por pedidos e unidades", () => {
  const items = [
    {
      orderId: "order-1",
      quantity: 2,
      sessionId: "session-home",
      sourceProductId: "product-1",
      sourcePromotionId: null
    },
    {
      orderId: "order-1",
      quantity: 1,
      sessionId: "session-home",
      sourceProductId: "product-1",
      sourcePromotionId: null
    },
    {
      orderId: "order-2",
      quantity: 1,
      sessionId: "session-links",
      sourceProductId: null,
      sourcePromotionId: "promotion-1"
    },
    {
      orderId: "order-3",
      quantity: 4,
      sessionId: "session-direct-product",
      sourceProductId: "product-1",
      sourcePromotionId: null
    }
  ];

  assert.deepEqual(
    getOrderRanking(items, "product", new Set(["session-home", "session-links"])),
    [{ entityId: "product-1", orders: 1, units: 3 }]
  );
  assert.deepEqual(
    getOrderRanking(items, "promotion", new Set(["session-home", "session-links"])),
    [{ entityId: "promotion-1", orders: 1, units: 1 }]
  );
});
