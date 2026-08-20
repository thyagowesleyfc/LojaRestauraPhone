import assert from "node:assert/strict";
import test from "node:test";

import { buildOptionSignature, normalizeSku, suggestSku } from "./sku";

test("buildOptionSignature creates a stable sorted signature", () => {
  assert.equal(
    buildOptionSignature([
      { characteristicId: "b", characteristicOptionId: "2" },
      { characteristicId: "a", characteristicOptionId: "1" }
    ]),
    "a:1|b:2"
  );
});

test("normalizeSku trims, uppercases and replaces spaces", () => {
  assert.equal(normalizeSku(" capinha iphone 15 preta "), "CAPINHA-IPHONE-15-PRETA");
});

test("suggestSku derives a readable identifier", () => {
  assert.equal(
    suggestSku("Capinha Premium", ["iPhone 15", "Preto"]),
    "CAPINHA-PREMIUM-IPHONE-15-PRETO"
  );
});