import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addCartItem,
  buildWhatsAppOrderMessage,
  calculateCartTotal,
  normalizeCartItems,
  removeCartItem,
  updateCartItemQuantity
} from "./cart";

describe("cart helpers", () => {
  it("merges duplicated items and limits quantities", () => {
    const items = normalizeCartItems([
      { type: "product", id: "phone-case", quantity: 2 },
      { type: "product", id: "phone-case", quantity: 150 },
      { type: "combo", id: "kit", quantity: 1 }
    ]);

    assert.deepEqual(items, [
      { type: "product", id: "phone-case", quantity: 99 },
      { type: "combo", id: "kit", quantity: 1 }
    ]);
  });

  it("adds, updates and removes items without duplicating lines", () => {
    const added = addCartItem(
      [{ type: "product", id: "charger", quantity: 1 }],
      { type: "product", id: "charger", quantity: 1 }
    );
    const updated = updateCartItemQuantity(
      added,
      { type: "product", id: "charger" },
      3
    );
    const removed = removeCartItem(updated, {
      type: "product",
      id: "charger"
    });

    assert.deepEqual(updated, [
      { type: "product", id: "charger", quantity: 3 }
    ]);
    assert.deepEqual(removed, []);
  });

  it("calculates totals and builds the WhatsApp message", () => {
    const items = [
      {
        type: "combo" as const,
        id: "kit",
        quantity: 2,
        description: "Kit carregador",
        unitPriceInCents: 4990,
        subtotalInCents: 9980
      }
    ];
    const totalInCents = calculateCartTotal(items);
    const message = buildWhatsAppOrderMessage({
      initialMessage: "Ola, quero comprar.",
      items,
      totalInCents
    });

    assert.equal(totalInCents, 9980);
    assert.match(message, /2x Kit carregador/);
    assert.match(message, /Total: R\$\s?99,80/);
  });
});
