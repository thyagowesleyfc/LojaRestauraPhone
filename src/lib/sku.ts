import { slugify } from "./slug";

export type VariantOptionSelection = {
  characteristicId: string;
  characteristicOptionId: string;
};

export function normalizeSku(value: string) {
  return value.trim().replace(/\s+/g, "-").toUpperCase();
}

export function buildOptionSignature(selections: VariantOptionSelection[]) {
  return selections
    .map((selection) => ({
      characteristicId: selection.characteristicId.trim(),
      characteristicOptionId: selection.characteristicOptionId.trim()
    }))
    .filter(
      (selection) =>
        selection.characteristicId.length > 0 &&
        selection.characteristicOptionId.length > 0
    )
    .sort((a, b) => a.characteristicId.localeCompare(b.characteristicId))
    .map(
      (selection) =>
        `${selection.characteristicId}:${selection.characteristicOptionId}`
    )
    .join("|");
}

export function suggestSku(productDescription: string, optionNames: string[]) {
  const productPart = slugify(productDescription).slice(0, 24) || "produto";
  const optionPart = optionNames
    .map((name) => slugify(name).slice(0, 12))
    .filter(Boolean)
    .join("-");

  return normalizeSku(optionPart ? `${productPart}-${optionPart}` : productPart);
}