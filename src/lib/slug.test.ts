import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getNextDisplayOrder,
  getUniqueSlug,
  slugify
} from "@/lib/slug";

test("slugify normalizes catalog labels", () => {
  assert.equal(slugify("Peliculas Premium 3D!"), "peliculas-premium-3d");
  assert.equal(slugify("  Cabo USB-C  "), "cabo-usb-c");
});

test("getUniqueSlug adds a suffix only when the generated slug is occupied", () => {
  assert.equal(getUniqueSlug("Cabo USB-C", new Set(), "produto"), "cabo-usb-c");
  assert.equal(
    getUniqueSlug("Cabo USB-C", new Set(["cabo-usb-c"]), "produto"),
    "cabo-usb-c-2"
  );
});

test("getNextDisplayOrder appends after the current highest order", () => {
  assert.equal(getNextDisplayOrder(null), 0);
  assert.equal(getNextDisplayOrder(4), 5);
});
