import sharp from "sharp";

const WEBP_QUALITY = 82;

export async function convertImageToWebp(file: File) {
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input)
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}
