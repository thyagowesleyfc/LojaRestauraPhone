import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");

export const categoryInputSchema = z.object({
  name: requiredText.max(80, "Use no maximo 80 caracteres."),
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const productInputSchema = z.object({
  description: requiredText.max(140, "Use no maximo 140 caracteres."),
  specification: requiredText.max(4000, "Use no maximo 4000 caracteres."),
  categoryId: requiredText,
  price: z.coerce.number().positive("O preco deve ser maior que zero."),
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
