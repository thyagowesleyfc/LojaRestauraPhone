import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getOversizedImage,
  MAX_IMAGE_SIZE_BYTES
} from "@/lib/image-upload";

function fileWithSize(size: number) {
  return { size } as File;
}

test("aceita imagens de até 5 MB", () => {
  assert.equal(getOversizedImage([fileWithSize(MAX_IMAGE_SIZE_BYTES)]), null);
});

test("identifica imagens acima de 5 MB", () => {
  const oversizedImage = fileWithSize(MAX_IMAGE_SIZE_BYTES + 1);

  assert.equal(getOversizedImage([oversizedImage]), oversizedImage);
});
