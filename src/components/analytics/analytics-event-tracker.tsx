"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { AnalyticsEventType } from "@/schemas/analytics";

type AnalyticsEventTrackerProps = {
  type: AnalyticsEventType;
  productId?: string;
  productVariantId?: string;
  promotionId?: string;
  categoryId?: string;
};

export function AnalyticsEventTracker({
  categoryId,
  productId,
  productVariantId,
  promotionId,
  type
}: AnalyticsEventTrackerProps) {
  useEffect(() => {
    trackAnalyticsEvent({
      type,
      categoryId,
      productId,
      productVariantId,
      promotionId
    });
  }, [categoryId, productId, productVariantId, promotionId, type]);

  return null;
}