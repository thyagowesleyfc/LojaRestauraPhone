export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function getOversizedImage(files: readonly File[]) {
  return files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES) ?? null;
}
