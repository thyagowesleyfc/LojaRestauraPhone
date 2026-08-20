import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");
const slugText = requiredText
  .max(90, "Use no maximo 90 caracteres.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minusculas, numeros e hifens.");

export const categoryInputSchema = z.object({
  name: requiredText.max(80, "Use no maximo 80 caracteres."),
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const categoryCharacteristicInputSchema = z.object({
  characteristicId: requiredText,
  displayOrder: z.coerce.number().int().min(0),
  required: z.coerce.boolean()
});

export const productInputSchema = z.object({
  description: requiredText.max(140, "Use no maximo 140 caracteres."),
  specification: requiredText.max(4000, "Use no maximo 4000 caracteres."),
  categoryId: requiredText,
  price: z.coerce.number().positive("O preco deve ser maior que zero."),
  active: z.coerce.boolean()
});

export const characteristicInputSchema = z.object({
  name: requiredText.max(80, "Use no maximo 80 caracteres."),
  slug: slugText,
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const characteristicOptionInputSchema = z.object({
  id: z.string().trim().optional(),
  name: requiredText.max(80, "Use no maximo 80 caracteres."),
  slug: slugText,
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const productVariantInputSchema = z.object({
  productId: requiredText,
  sku: requiredText.max(80, "Use no maximo 80 caracteres."),
  active: z.coerce.boolean()
});

export const productImageAltSchema = z
  .string()
  .trim()
  .max(160, "Use no maximo 160 caracteres.")
  .optional()
  .transform((value) => value || undefined);

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type CharacteristicInput = z.infer<typeof characteristicInputSchema>;
export type CharacteristicOptionInput = z.infer<
  typeof characteristicOptionInputSchema
>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;