export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getUniqueSlug(
  value: string,
  usedSlugs: ReadonlySet<string>,
  fallback: string
) {
  const baseSlug = slugify(value) || fallback;
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function getNextDisplayOrder(maxDisplayOrder: number | null | undefined) {
  return (maxDisplayOrder ?? -1) + 1;
}
