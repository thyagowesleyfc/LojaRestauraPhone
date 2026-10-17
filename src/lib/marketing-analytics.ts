import { normalizeAnalyticsPagePath } from "@/lib/analytics-path";

export const MARKETING_ENTRY_PATHS = new Set(["/", "/links"]);

export type MarketingPageView = {
  createdAt: Date | string;
  id?: string;
  pagePath: string;
  sessionId: string;
};

export type MarketingSessionGroup = {
  sessionId: string | null;
};

export type MarketingSessionCountGroup = MarketingSessionGroup & {
  count: number;
};

export type MarketingEntitySessionGroup = {
  entityId: string | null;
  sessionId: string | null;
};

export type MarketingEntitySessionCountGroup = MarketingEntitySessionGroup & {
  count: number;
};

export type MarketingOrderItem = {
  converted: boolean;
  orderId: string;
  quantity: number;
  sessionId: string | null;
  sourceProductId: string | null;
  sourcePromotionId: string | null;
};

export type MarketingOrderRanking = {
  entityId: string;
  orders: number;
  units: number;
};

function getTimestamp(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function getEntrySessionIds(pageViews: MarketingPageView[]) {
  const firstPageBySession = new Map<string, MarketingPageView>();

  for (const pageView of [...pageViews].sort((left, right) => {
    const timestampDifference =
      getTimestamp(left.createdAt) - getTimestamp(right.createdAt);

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    return (left.id ?? "").localeCompare(right.id ?? "");
  })) {
    if (!firstPageBySession.has(pageView.sessionId)) {
      firstPageBySession.set(pageView.sessionId, pageView);
    }
  }

  return new Set(
    Array.from(firstPageBySession.values())
      .filter((pageView) =>
        MARKETING_ENTRY_PATHS.has(normalizeAnalyticsPagePath(pageView.pagePath))
      )
      .map((pageView) => pageView.sessionId)
  );
}

export function getSessionSet(groups: MarketingSessionGroup[]) {
  return new Set(
    groups
      .map((group) => group.sessionId)
      .filter((sessionId): sessionId is string => Boolean(sessionId))
  );
}

export function restrictToSessions(
  sessionIds: Set<string>,
  allowedSessionIds: Set<string>
) {
  return new Set(
    Array.from(sessionIds).filter((sessionId) => allowedSessionIds.has(sessionId))
  );
}

export function countSessionEvents(
  groups: MarketingSessionCountGroup[],
  allowedSessionIds: Set<string>
) {
  return groups.reduce(
    (total, group) =>
      group.sessionId && allowedSessionIds.has(group.sessionId)
        ? total + group.count
        : total,
    0
  );
}

export function getUniqueEntityViewCounts(
  groups: MarketingEntitySessionGroup[],
  allowedSessionIds: Set<string>
) {
  const seen = new Set<string>();
  const counts = new Map<string, number>();

  for (const group of groups) {
    if (!group.entityId || !group.sessionId || !allowedSessionIds.has(group.sessionId)) {
      continue;
    }

    const key = `${group.entityId}:${group.sessionId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    counts.set(group.entityId, (counts.get(group.entityId) ?? 0) + 1);
  }

  return counts;
}

export function getEntityEventCounts(
  groups: MarketingEntitySessionCountGroup[],
  allowedSessionIds: Set<string>
) {
  const counts = new Map<string, number>();

  for (const group of groups) {
    if (!group.entityId || !group.sessionId || !allowedSessionIds.has(group.sessionId)) {
      continue;
    }

    counts.set(group.entityId, (counts.get(group.entityId) ?? 0) + group.count);
  }

  return counts;
}

export function getOrderRanking(
  items: MarketingOrderItem[],
  field: "product" | "promotion",
  allowedSessionIds: Set<string>,
  convertedOnly = false
) {
  const orderKeysByEntity = new Map<string, Set<string>>();
  const unitsByEntity = new Map<string, number>();

  for (const item of items) {
    if (
      !item.sessionId ||
      !allowedSessionIds.has(item.sessionId) ||
      (convertedOnly && !item.converted)
    ) {
      continue;
    }

    const entityId =
      field === "product" ? item.sourceProductId : item.sourcePromotionId;

    if (!entityId) {
      continue;
    }

    const orderKeys = orderKeysByEntity.get(entityId) ?? new Set<string>();
    orderKeys.add(item.orderId);
    orderKeysByEntity.set(entityId, orderKeys);
    unitsByEntity.set(
      entityId,
      (unitsByEntity.get(entityId) ?? 0) + item.quantity
    );
  }

  return Array.from(orderKeysByEntity, ([entityId, orderKeys]) => ({
    entityId,
    orders: orderKeys.size,
    units: unitsByEntity.get(entityId) ?? 0
  } satisfies MarketingOrderRanking));
}

export function getCategoryOrderRanking(
  items: MarketingOrderItem[],
  productCategoryIds: ReadonlyMap<string, string>,
  promotionCategoryIds: ReadonlyMap<string, string>,
  allowedSessionIds: Set<string>,
  convertedOnly = false
) {
  const orderKeysByCategory = new Map<string, Set<string>>();
  const unitsByCategory = new Map<string, number>();

  for (const item of items) {
    if (
      !item.sessionId ||
      !allowedSessionIds.has(item.sessionId) ||
      (convertedOnly && !item.converted)
    ) {
      continue;
    }

    const categoryId = item.sourceProductId
      ? productCategoryIds.get(item.sourceProductId)
      : item.sourcePromotionId
        ? promotionCategoryIds.get(item.sourcePromotionId)
        : undefined;

    if (!categoryId) {
      continue;
    }

    const orderKeys = orderKeysByCategory.get(categoryId) ?? new Set<string>();
    orderKeys.add(item.orderId);
    orderKeysByCategory.set(categoryId, orderKeys);
    unitsByCategory.set(
      categoryId,
      (unitsByCategory.get(categoryId) ?? 0) + item.quantity
    );
  }

  return Array.from(orderKeysByCategory, ([entityId, orderKeys]) => ({
    entityId,
    orders: orderKeys.size,
    units: unitsByCategory.get(entityId) ?? 0
  } satisfies MarketingOrderRanking));
}
