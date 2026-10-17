import type { CartItemType } from "./cart";

type OrderItemSourceInput = {
  sourceProductId?: string | null;
  sourceProductVariantId?: string | null;
  sourcePromotionId?: string | null;
  type: CartItemType;
};

export function getOrderItemSourceFields({
  sourceProductId,
  sourceProductVariantId,
  sourcePromotionId,
  type
}: OrderItemSourceInput) {
  if (type === "combo") {
    return {
      sourceProductId: null,
      sourceProductVariantId: null,
      sourcePromotionId: sourcePromotionId ?? null
    };
  }

  return {
    sourceProductId: sourceProductId ?? null,
    sourceProductVariantId:
      type === "variant" ? sourceProductVariantId ?? null : null,
    sourcePromotionId: null
  };
}
