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
      { type: "variant", id: "sku-black", quantity: 1 },
      { type: "combo", id: "kit", quantity: 1 }
    ]);

    assert.deepEqual(items, [
      { type: "product", id: "phone-case", quantity: 99 },
      { type: "variant", id: "sku-black", quantity: 1 },
      { type: "combo", id: "kit", quantity: 1 }
    ]);
  });

  it("adds, updates and removes items without duplicating lines", () => {
    const added = addCartItem(
      [{ type: "variant", id: "charger-usb-c", quantity: 1 }],
      { type: "variant", id: "charger-usb-c", quantity: 1 }
    );
    const updated = updateCartItemQuantity(
      added,
      { type: "variant", id: "charger-usb-c" },
      3
    );
    const removed = removeCartItem(updated, {
      type: "variant",
      id: "charger-usb-c"
    });

    assert.deepEqual(updated, [
      { type: "variant", id: "charger-usb-c", quantity: 3 }
    ]);
    assert.deepEqual(removed, []);
  });

  it("calculates totals and builds the WhatsApp message", () => {
    const items = [
      {
        type: "variant" as const,
        id: "sku-preto",
        quantity: 2,
        description: "Capinha Premium",
        unitPriceInCents: 4990,
        subtotalInCents: 9980,
        sku: "CAP-PRETO",
        variantDescription: "Cor: Preto / Modelo: iPhone 15"
      }
    ];
    const totalInCents = calculateCartTotal(items);
    const message = buildWhatsAppOrderMessage({
      items,
      totalInCents
    });

    assert.equal(totalInCents, 9980);
    assert.match(message, /2x Capinha Premium/);
    assert.match(message, /Cor: Preto/);
    assert.doesNotMatch(message, /SKU CAP-PRETO/);
    assert.doesNotMatch(message, /mais informacoes/);
    assert.match(message, /Total: R\$\s?99,80/);
  });
});