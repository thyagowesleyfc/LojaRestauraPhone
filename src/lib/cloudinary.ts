import "server-only";

import { createHash } from "node:crypto";

import { env } from "@/lib/env";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
]);

export type UploadedImage = {
  url: string;
  publicId: string;
};

function assertCloudinaryConfig() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Configure as credenciais do Cloudinary no .env.");
  }

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET
  };
}

function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string
) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export function isUploadableImage(file: File) {
  return (
    file.size > 0 &&
    file.size <= MAX_IMAGE_SIZE_BYTES &&
    ALLOWED_IMAGE_TYPES.has(file.type)
  );
}

export async function uploadCatalogImage(file: File): Promise<UploadedImage> {
  if (!isUploadableImage(file)) {
    throw new Error("Imagem invalida. Use JPG, PNG, WEBP ou AVIF ate 5 MB.");
  }

  const { cloudName, apiKey, apiSecret } = assertCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "restauraphone/catalog";
  const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);
  const body = new FormData();

  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body
    }
  );

  if (!response.ok) {
    throw new Error("Falha ao enviar imagem para o Cloudinary.");
  }

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
  };

  if (!result.secure_url || !result.public_id) {
    throw new Error("Resposta invalida do Cloudinary.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}

export async function deleteCatalogImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = assertCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);
  const body = new FormData();

  body.set("public_id", publicId);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body
  });
}
