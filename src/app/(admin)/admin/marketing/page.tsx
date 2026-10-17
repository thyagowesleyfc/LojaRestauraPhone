import { AnalyticsEventType, type Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { MarketingFunnelChart } from "@/components/admin/marketing-funnel-chart";
import { MarketingIntegrationsForm } from "@/components/admin/marketing-integrations-form";
import {
  MarketingRankingsTabs,
  type MarketingCampaignRankingRow,
  type MarketingOrderRankingRow,
  type MarketingRankingRow
} from "@/components/admin/marketing-rankings-tabs";
import { getMarketingIntegrations } from "@/lib/marketing-integrations";
import {
  countSessionEvents,
  getEntityEventCounts,
  getEntrySessionIds,
  getOrderRanking,
  getSessionSet,
  getUniqueEntityViewCounts,
  restrictToSessions,
  type MarketingOrderItem,
  type MarketingSessionGroup
} from "@/lib/marketing-analytics";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type MarketingPageProps = {
  searchParams?: Promise<{
    erro?: string | string[];
    fim?: string | string[];
    inicio?: string | string[];
    sucesso?: string | string[];
  }>;
};

type CountGroup = {
  _count: {
    _all: number;
  };
};

type ProductViewSessionGroup = {
  productId: string | null;
  sessionId: string;
};

type CategoryViewSessionGroup = {
  categoryId: string | null;
  sessionId: string;
};

type PromotionViewSessionGroup = {
  promotionId: string | null;
  sessionId: string;
};

type SearchTermSessionGroup = {
  searchTermNormalized: string | null;
  sessionId: string | null;
  _count: {
    _all: number;
  };
};

type CampaignGroup = CountGroup & {
  utmCampaign: string | null;
  utmMedium: string | null;
  utmSource: string | null;
};

type LinkClickSessionGroup = {
  linkId: string | null;
  sessionId: string | null;
  _count: {
    _all: number;
  };
};

type SessionCountGroup = {
  sessionId: string | null;
  _count: {
    _all: number;
  };
};

type SessionGroup = MarketingSessionGroup;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDateParam(value: string | string[] | undefined, endOfDay = false) {
  const dateValue = getSingleParam(value);

  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const date = new Date(`${dateValue}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeDateRange({
  fim,
  inicio
}: {
  fim?: string | string[];
  inicio?: string | string[];
}) {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(defaultEndDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const startDate = parseDateParam(inicio) ?? defaultStartDate;
  const endDate = parseDateParam(fim, true) ?? defaultEndDate;

  if (startDate > endDate) {
    return {
      endDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1),
      startDate
    };
  }

  return { endDate, startDate };
}

function metricWhere(
  baseWhere: Prisma.AnalyticsEventWhereInput,
  type: AnalyticsEventType
): Prisma.AnalyticsEventWhereInput {
  return {
    ...baseWhere,
    type
  };
}

function sortByCount<T extends CountGroup>(items: T[]) {
  return [...items].sort((a, b) => b._count._all - a._count._all);
}

function toCountGroups(counts: Map<string, number>) {
  return sortByCount(
    Array.from(counts, ([id, count]) => ({
      _count: { _all: count },
      id
    }))
  );
}

function sortByOrders<T extends { orders: number }>(items: T[]) {
  return [...items].sort((left, right) => right.orders - left.orders);
}

export default async function MarketingPage({
  searchParams
}: MarketingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const errorMessage = getSingleParam(resolvedSearchParams.erro);
  const successMessage = getSingleParam(resolvedSearchParams.sucesso);
  const { endDate, startDate } = normalizeDateRange(resolvedSearchParams);
  const baseWhere: Prisma.AnalyticsEventWhereInput = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  const [
    productViewSessionGroups,
    categoryViewSessionGroups,
    promotionViewSessionGroups,
    pageViewEvents,
    addToCartSessionGroups,
    linkClickSessionGroups,
    linkClickGroups,
    searchSessionGroups,
    searchNoResultSessionGroups,
    whatsappClickSessionGroups,
    orderSentSessionGroups,
    orderRows,
    orderItemRows,
    searchGroups,
    searchNoResultGroups,
    campaignGroups
  ] = await unstable_cache(
    () => Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["productId", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.PRODUCT_VIEW),
        productId: { not: null }
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["categoryId", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.CATEGORY_VIEW),
        categoryId: { not: null }
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["promotionId", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.PROMOTION_VIEW),
        promotionId: { not: null }
      }
    }),
    prisma.analyticsEvent.findMany({
      where: metricWhere(baseWhere, AnalyticsEventType.PAGE_VIEW),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { createdAt: true, id: true, pagePath: true, sessionId: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.ADD_TO_CART),
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.LINK_CLICK),
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["linkId", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.LINK_CLICK),
        linkId: { not: null }
      },
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.SEARCH)
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.SEARCH_NO_RESULTS)
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.WHATSAPP_CLICK)
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: metricWhere(baseWhere, AnalyticsEventType.ORDER_SENT_TO_WHATSAPP)
    }),
    prisma.customerOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        sessionId: { not: null }
      },
      select: { converted: true, id: true, sessionId: true }
    }),
    prisma.customerOrderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          sessionId: { not: null }
        },
        OR: [
          { sourceProductId: { not: null } },
          { sourcePromotionId: { not: null } }
        ]
      },
      select: {
        order: { select: { converted: true, id: true, sessionId: true } },
        quantity: true,
        sourceProductId: true,
        sourcePromotionId: true
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["searchTermNormalized", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.SEARCH),
        searchTermNormalized: { not: null }
      },
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["searchTermNormalized", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.SEARCH_NO_RESULTS),
        searchTermNormalized: { not: null }
      },
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["utmSource", "utmMedium", "utmCampaign"],
      where: {
        ...baseWhere,
        OR: [
          { utmSource: { not: null } },
          { utmMedium: { not: null } },
          { utmCampaign: { not: null } }
        ]
      },
      _count: { _all: true }
    })
    ]),
    [
      "admin-marketing-analytics",
      formatDateInput(startDate),
      formatDateInput(endDate)
    ],
    { revalidate: 120 }
  )();

  const entrySessionIds = getEntrySessionIds(pageViewEvents);
  const productViewCounts = getUniqueEntityViewCounts(
    (productViewSessionGroups as ProductViewSessionGroup[]).map((group) => ({
      entityId: group.productId,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const categoryViewCounts = getUniqueEntityViewCounts(
    (categoryViewSessionGroups as CategoryViewSessionGroup[]).map((group) => ({
      entityId: group.categoryId,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const promotionViewCounts = getUniqueEntityViewCounts(
    (promotionViewSessionGroups as PromotionViewSessionGroup[]).map((group) => ({
      entityId: group.promotionId,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const topProductGroups = toCountGroups(productViewCounts)
    .slice(0, 10)
    .map((group) => ({ _count: group._count, productId: group.id }));
  const topCategoryGroups = toCountGroups(categoryViewCounts)
    .slice(0, 10)
    .map((group) => ({ _count: group._count, categoryId: group.id }));
  const topPromotionGroups = toCountGroups(promotionViewCounts)
    .slice(0, 10)
    .map((group) => ({ _count: group._count, promotionId: group.id }));
  const orderItems = (orderItemRows as Array<{
    order: { converted: boolean; id: string; sessionId: string | null };
    quantity: number;
    sourceProductId: string | null;
    sourcePromotionId: string | null;
  }>).map<MarketingOrderItem>((item) => ({
    converted: item.order.converted,
    orderId: item.order.id,
    quantity: item.quantity,
    sessionId: item.order.sessionId,
    sourceProductId: item.sourceProductId,
    sourcePromotionId: item.sourcePromotionId
  }));
  const topProductOrderGroups = sortByOrders(
    getOrderRanking(orderItems, "product", entrySessionIds)
  ).slice(0, 10);
  const topPromotionOrderGroups = sortByOrders(
    getOrderRanking(orderItems, "promotion", entrySessionIds)
  ).slice(0, 10);
  const topConvertedProductOrderGroups = sortByOrders(
    getOrderRanking(orderItems, "product", entrySessionIds, true)
  ).slice(0, 10);
  const topConvertedPromotionOrderGroups = sortByOrders(
    getOrderRanking(orderItems, "promotion", entrySessionIds, true)
  ).slice(0, 10);
  const productIds = Array.from(
    new Set([
      ...topProductGroups.map((group) => group.productId),
      ...topProductOrderGroups.map((group) => group.entityId),
      ...topConvertedProductOrderGroups.map((group) => group.entityId)
    ])
  );
  const categoryIds = topCategoryGroups.map((group) => group.categoryId);
  const promotionIds = Array.from(
    new Set([
      ...topPromotionGroups.map((group) => group.promotionId),
      ...topPromotionOrderGroups.map((group) => group.entityId),
      ...topConvertedPromotionOrderGroups.map((group) => group.entityId)
    ])
  );
  const [products, categories, promotions] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { description: true, id: true, slug: true }
        })
      : Promise.resolve([]),
    categoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true }
        })
      : Promise.resolve([]),
    promotionIds.length
      ? prisma.promotion.findMany({
          where: { id: { in: promotionIds } },
          select: { description: true, id: true, slug: true }
        })
      : Promise.resolve([])
  ]);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const promotionsById = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  const topSearches = toCountGroups(
    getEntityEventCounts(
      (searchGroups as SearchTermSessionGroup[]).map((group) => ({
        count: group._count._all,
        entityId: group.searchTermNormalized,
        sessionId: group.sessionId
      })),
      entrySessionIds
    )
  )
    .slice(0, 10)
    .map((group) => ({ _count: group._count, searchTermNormalized: group.id }));
  const topSearchesWithoutResults = toCountGroups(
    getEntityEventCounts(
      (searchNoResultGroups as SearchTermSessionGroup[]).map((group) => ({
        count: group._count._all,
        entityId: group.searchTermNormalized,
        sessionId: group.sessionId
      })),
      entrySessionIds
    )
  )
    .slice(0, 10)
    .map((group) => ({ _count: group._count, searchTermNormalized: group.id }));
  const topCampaigns = sortByCount(campaignGroups as CampaignGroup[]).slice(0, 10);
  const linkClickCounts = getEntityEventCounts(
    (linkClickGroups as LinkClickSessionGroup[]).map((group) => ({
      count: group._count._all,
      entityId: group.linkId,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const topLinkGroups = toCountGroups(linkClickCounts)
    .slice(0, 10)
    .map((group) => ({ _count: group._count, linkId: group.id }));
  const linkIds = topLinkGroups
    .map((group) => group.linkId)
    .filter((linkId): linkId is string => Boolean(linkId));
  const storeLinks = linkIds.length
    ? await prisma.storeLink.findMany({
        where: { id: { in: linkIds } },
        select: { id: true, title: true }
      })
    : [];
  const storeLinksById = new Map(
    storeLinks.map((storeLink) => [storeLink.id, storeLink])
  );
  const marketingIntegrations = await getMarketingIntegrations();
  const searchSessionIds = restrictToSessions(
    getSessionSet(searchSessionGroups as SessionGroup[]),
    entrySessionIds
  );
  const searchNoResultSessionIds = restrictToSessions(
    getSessionSet(searchNoResultSessionGroups as SessionGroup[]),
    entrySessionIds
  );
  const addToCartSessionIds = restrictToSessions(
    getSessionSet(addToCartSessionGroups as SessionGroup[]),
    entrySessionIds
  );
  const whatsappClickSessionIds = restrictToSessions(
    getSessionSet(whatsappClickSessionGroups as SessionGroup[]),
    entrySessionIds
  );
  const orderSentSessionIds = restrictToSessions(
    getSessionSet(orderSentSessionGroups as SessionGroup[]),
    entrySessionIds
  );
  const orderRowsForEntrySessions = (orderRows as Array<{
    converted: boolean;
    id: string;
    sessionId: string | null;
  }>).filter(
    (order) => order.sessionId !== null && entrySessionIds.has(order.sessionId)
  );
  const orderSessionIds = getSessionSet(
    orderRowsForEntrySessions.map((order) => ({ sessionId: order.sessionId }))
  );
  const convertedOrders = orderRowsForEntrySessions.filter(
    (order) => order.converted
  ).length;
  const addToCart = countSessionEvents(
    (addToCartSessionGroups as SessionCountGroup[]).map((group) => ({
      count: group._count._all,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const filteredLinkClicks = countSessionEvents(
    (linkClickSessionGroups as SessionCountGroup[]).map((group) => ({
      count: group._count._all,
      sessionId: group.sessionId
    })),
    entrySessionIds
  );
  const categoryViewRankingRows: MarketingRankingRow[] = topCategoryGroups.map(
    (group) => {
      const category = categoriesById.get(group.categoryId);

      return {
        count: group._count._all,
        href: category ? `/categorias/${category.slug}` : undefined,
        id: group.categoryId,
        label: category?.name ?? "Categoria removida"
      };
    }
  );
  const promotionViewRankingRows: MarketingRankingRow[] = topPromotionGroups.map(
    (group) => {
      const promotion = promotionsById.get(group.promotionId);

      return {
        count: group._count._all,
        href: promotion ? `/promocoes/${promotion.slug}` : undefined,
        id: group.promotionId,
        label: promotion?.description ?? "Promoção removida"
      };
    }
  );
  const productOrderRankingRows: MarketingOrderRankingRow[] = topProductOrderGroups.map(
    (group) => {
      const product = productsById.get(group.entityId);

      return {
        count: group.orders,
        href: product ? `/produtos/${product.slug}` : undefined,
        id: group.entityId,
        label: product?.description ?? "Produto removido",
        units: group.units
      };
    }
  );
  const promotionOrderRankingRows: MarketingOrderRankingRow[] = topPromotionOrderGroups.map(
    (group) => {
      const promotion = promotionsById.get(group.entityId);

      return {
        count: group.orders,
        href: promotion ? `/promocoes/${promotion.slug}` : undefined,
        id: group.entityId,
        label: promotion?.description ?? "Promoção removida",
        units: group.units
      };
    }
  );
  const convertedProductOrderRankingRows: MarketingOrderRankingRow[] =
    topConvertedProductOrderGroups.map((group) => {
      const product = productsById.get(group.entityId);

      return {
        count: group.orders,
        href: product ? `/produtos/${product.slug}` : undefined,
        id: group.entityId,
        label: product?.description ?? "Produto removido",
        units: group.units
      };
    });
  const convertedPromotionOrderRankingRows: MarketingOrderRankingRow[] =
    topConvertedPromotionOrderGroups.map((group) => {
      const promotion = promotionsById.get(group.entityId);

      return {
        count: group.orders,
        href: promotion ? `/promocoes/${promotion.slug}` : undefined,
        id: group.entityId,
        label: promotion?.description ?? "Promoção removida",
        units: group.units
      };
    });
  const productViewRankingRows: MarketingRankingRow[] = topProductGroups.map(
    (group) => {
      const product = productsById.get(group.productId);

      return {
        count: group._count._all,
        href: product ? `/produtos/${product.slug}` : undefined,
        id: group.productId,
        label: product?.description ?? "Produto removido"
      };
    }
  );
  const linkRankingRows: MarketingRankingRow[] = topLinkGroups.map((group) => {
    const link = storeLinksById.get(group.linkId);

    return {
      count: group._count._all,
      id: group.linkId,
      label: link?.title ?? "Link removido"
    };
  });
  const searchRankingRows: MarketingRankingRow[] = topSearches.map((group) => ({
    count: group._count._all,
    id: group.searchTermNormalized ?? "-",
    label: group.searchTermNormalized ?? "-"
  }));
  const searchNoResultRankingRows: MarketingRankingRow[] =
    topSearchesWithoutResults.map((group) => ({
      count: group._count._all,
      id: group.searchTermNormalized ?? "-",
      label: group.searchTermNormalized ?? "-"
    }));
  const campaignRankingRows: MarketingCampaignRankingRow[] = topCampaigns.map(
    (group) => ({
      campaign: group.utmCampaign ?? "-",
      count: group._count._all,
      id: `${group.utmSource}-${group.utmMedium}-${group.utmCampaign}`,
      medium: group.utmMedium ?? "-",
      source: group.utmSource ?? "-"
    })
  );
  const funnels = [
    {
      description: "Da sessão de entrada ao pedido convertido.",
      metrics: [
        { label: "Sessões", value: entrySessionIds.size },
        { label: "Sessões com carrinho", value: addToCartSessionIds.size },
        { label: "Sessões com pedido registrado", value: orderSessionIds.size },
        { label: "Pedidos convertidos", value: convertedOrders }
      ],
      title: "Funil de Pedidos"
    },
    {
      description: "Da sessão de entrada ao clique que direciona para o atendimento.",
      metrics: [
        { label: "Sessões", value: entrySessionIds.size },
        {
          label: "Sessões com clique no WhatsApp",
          value: whatsappClickSessionIds.size
        }
      ],
      supportingMetric: {
        label: "Sessões com pedido no WhatsApp",
        value: orderSentSessionIds.size
      },
      title: "Funil de Direcionamento para WhatsApp"
    }
  ];

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-semibold sm:text-3xl">Marketing</h1>
        <AdminDashboardLink />
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {successMessage === "integracoes" ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Integrações atualizadas.
        </p>
      ) : null}
      <MarketingFunnelChart
        endDate={formatDateInput(endDate)}
        funnels={funnels}
        startDate={formatDateInput(startDate)}
      />

      <MarketingRankingsTabs
        campaigns={campaignRankingRows}
        cartAdditions={addToCart}
        categories={categoryViewRankingRows}
        integrations={<MarketingIntegrationsForm integrations={marketingIntegrations} />}
        linkClicks={filteredLinkClicks}
        links={linkRankingRows}
        products={{
          converted: convertedProductOrderRankingRows,
          ordered: productOrderRankingRows,
          viewed: productViewRankingRows
        }}
        promotions={{
          converted: convertedPromotionOrderRankingRows,
          ordered: promotionOrderRankingRows,
          viewed: promotionViewRankingRows
        }}
        searches={{
          noResults: searchNoResultRankingRows,
          top: searchRankingRows
        }}
        searchMetrics={{
          noResults: searchNoResultSessionIds.size,
          searched: searchSessionIds.size
        }}
      />
    </section>
  );
}
