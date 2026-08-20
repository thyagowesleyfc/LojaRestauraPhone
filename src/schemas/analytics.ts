import { z } from "zod";

export const analyticsEventTypes = [
  "PAGE_VIEW",
  "PRODUCT_VIEW",
  "SEARCH",
  "SEARCH_NO_RESULTS",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "WHATSAPP_CLICK",
  "ORDER_SENT_TO_WHATSAPP",
  "PROMOTION_VIEW",
  "CATEGORY_VIEW"
] as const;

const optionalTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(256)
  .optional();

export const analyticsUtmSchema = z.object({
  source: optionalTextSchema,
  medium: optionalTextSchema,
  campaign: optionalTextSchema,
  term: optionalTextSchema,
  content: optionalTextSchema
});

export const analyticsEventSchema = z.object({
  type: z.enum(analyticsEventTypes),
  sessionId: z.string().trim().min(1).max(128),
  productId: optionalTextSchema,
  productVariantId: optionalTextSchema,
  promotionId: optionalTextSchema,
  categoryId: optionalTextSchema,
  searchTerm: optionalTextSchema,
  resultsCount: z.coerce.number().int().min(0).max(100000).optional(),
  pagePath: z.string().trim().min(1).max(2048),
  utm: analyticsUtmSchema.optional()
});

export type AnalyticsEventType = (typeof analyticsEventTypes)[number];
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;