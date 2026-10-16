import assert from "node:assert/strict";
import { test } from "node:test";

import sharp from "sharp";

import { convertImageToWebp } from "./image-processor";

test("converte imagens raster para WebP", async () => {
  const input = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: { r: 20, g: 40, b: 60 }
    }
  })
    .png()
    .toBuffer();
  const file = new File([input], "imagem.png", { type: "image/png" });

  const output = await convertImageToWebp(file);

  assert.equal(output.toString("ascii", 0, 4), "RIFF");
  assert.equal(output.toString("ascii", 8, 12), "WEBP");
});
