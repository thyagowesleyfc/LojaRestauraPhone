import { PromotionType } from "@prisma/client";
import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(`${value}T00:00:00`) : null));

export const promotionInputSchema = z
  .object({
    type: z.enum([
      PromotionType.CATEGORY_PERCENTAGE,
      PromotionType.PRODUCT_COMBO
    ]),
    description: requiredText.max(180, "Use no maximo 180 caracteres."),
    categoryId: z.string().trim().optional(),
    percentage: z.coerce.number().int().optional(),
    comboPrice: z.coerce.number().optional(),
    productIds: z.array(z.string().trim().min(1)),
    active: z.coerce.boolean(),
    startsAt: optionalDate,
    endsAt: optionalDate
  })
  .superRefine((data, context) => {
    if (data.startsAt && data.endsAt && data.startsAt > data.endsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "A data final deve ser posterior ao inicio."
      });
    }

    if (data.type === PromotionType.CATEGORY_PERCENTAGE) {
      if (!data.categoryId) {
        context.addIssue({
          code: "custom",
          path: ["categoryId"],
          message: "Selecione uma categoria."
        });
      }

      if (!data.percentage || data.percentage <= 0 || data.percentage >= 100) {
        context.addIssue({
          code: "custom",
          path: ["percentage"],
          message: "Percentual deve ser maior que 0 e menor que 100."
        });
      }
    }

    if (data.type === PromotionType.PRODUCT_COMBO) {
      if (!data.comboPrice || data.comboPrice <= 0) {
        context.addIssue({
          code: "custom",
          path: ["comboPrice"],
          message: "Preco do combo deve ser maior que zero."
        });
      }

      if (new Set(data.productIds).size < 2) {
        context.addIssue({
          code: "custom",
          path: ["productIds"],
          message: "Selecione pelo menos dois produtos para o combo."
        });
      }
    }
  });

export const promotionImageAltSchema = z
  .string()
  .trim()
  .max(160, "Use no maximo 160 caracteres.")
  .optional()
  .transform((value) => value || undefined);

export type PromotionInput = z.infer<typeof promotionInputSchema>;
