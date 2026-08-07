export type PromotionPeriod = {
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type CategoryPercentagePromotion = PromotionPeriod & {
  id: string;
  description: string;
  percentage: number | null;
};

export function isPromotionCurrentlyActive(
  promotion: PromotionPeriod,
  now = new Date()
) {
  if (!promotion.active) {
    return false;
  }

  if (promotion.startsAt && promotion.startsAt > now) {
    return false;
  }

  if (promotion.endsAt && promotion.endsAt < now) {
    return false;
  }

  return true;
}

export function calculateDiscountedPriceInCents(
  priceInCents: number,
  percentage: number
) {
  return Math.max(1, Math.round(priceInCents * (1 - percentage / 100)));
}

export function getBestCategoryPercentagePromotion(
  promotions: CategoryPercentagePromotion[],
  now = new Date()
) {
  return promotions
    .filter(
      (promotion) =>
        promotion.percentage !== null &&
        isPromotionCurrentlyActive(promotion, now)
    )
    .sort((left, right) => (right.percentage ?? 0) - (left.percentage ?? 0))[0];
}

export function getPromotionalPriceInCents(
  priceInCents: number,
  promotions: CategoryPercentagePromotion[],
  now = new Date()
) {
  const bestPromotion = getBestCategoryPercentagePromotion(promotions, now);

  if (!bestPromotion?.percentage) {
    return {
      originalPriceInCents: priceInCents,
      currentPriceInCents: priceInCents,
      appliedPromotion: null
    };
  }

  return {
    originalPriceInCents: priceInCents,
    currentPriceInCents: calculateDiscountedPriceInCents(
      priceInCents,
      bestPromotion.percentage
    ),
    appliedPromotion: bestPromotion
  };
}
