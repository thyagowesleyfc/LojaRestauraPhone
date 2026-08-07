import assert from "node:assert/strict";
import { test } from "node:test";

import { slugify } from "@/lib/slug";

test("slugify normalizes catalog labels", () => {
  assert.equal(slugify("Peliculas Premium 3D!"), "peliculas-premium-3d");
  assert.equal(slugify("  Cabo USB-C  "), "cabo-usb-c");
});
