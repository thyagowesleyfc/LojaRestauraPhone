import { AnalyticsEventType, type Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { MarketingIntegrationsForm } from "@/components/admin/marketing-integrations-form";
import { Button } from "@/components/ui/button";
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

type NamedCountRanking = {
  count: number;
  href?: string;
  id: string;
  label: string;
};

type NamedOrderRanking = NamedCountRanking & {
  units: number;
};

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0
  }).format(value)}%`;
}

function getStepRate(current: number, previous: number) {
  if (previous <= 0) {
    return "0%";
  }

  return formatPercent((current / previous) * 100);
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

function CountRankingTable({
  emptyMessage,
  rows,
  valueLabel
}: {
  emptyMessage: string;
  rows: NamedCountRanking[];
  valueLabel: string;
}) {
  if (rows.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={row.id}>
              <td className="px-4 py-3">
                {row.href ? (
                  <Link className="font-medium text-primary hover:underline" href={row.href}>
                    {row.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{row.label}</span>
                )}
              </td>
              <td className="px-4 py-3">{formatNumber(row.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRankingTable({
  emptyMessage,
  rows
}: {
  emptyMessage: string;
  rows: NamedOrderRanking[];
}) {
  if (rows.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Pedidos</th>
            <th className="px-4 py-3 font-medium">Unidades</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={row.id}>
              <td className="px-4 py-3">
                {row.href ? (
                  <Link className="font-medium text-primary hover:underline" href={row.href}>
                    {row.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{row.label}</span>
                )}
              </td>
              <td className="px-4 py-3">{formatNumber(row.count)}</td>
              <td className="px-4 py-3">{formatNumber(row.units)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
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
        select: { id: true, redirectUrl: true, title: true }
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
  const productViewSessionIds = restrictToSessions(
    getSessionSet(productViewSessionGroups as SessionGroup[]),
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
  const ordersCreated = orderRowsForEntrySessions.length;
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
  const categoryViewRankingRows: NamedCountRanking[] = topCategoryGroups.map(
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
  const promotionViewRankingRows: NamedCountRanking[] = topPromotionGroups.map(
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
  const productOrderRankingRows: NamedOrderRanking[] = topProductOrderGroups.map(
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
  const promotionOrderRankingRows: NamedOrderRanking[] = topPromotionOrderGroups.map(
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
  const convertedProductOrderRankingRows: NamedOrderRanking[] =
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
  const convertedPromotionOrderRankingRows: NamedOrderRanking[] =
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
  const funnel = [
    {
      description: "Base do período",
      label: "Sessões",
      value: entrySessionIds.size
    },
    {
      description: `${getStepRate(searchSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com buscas",
      value: searchSessionIds.size
    },
    {
      description: `${getStepRate(searchNoResultSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com busca sem resultado",
      value: searchNoResultSessionIds.size
    },
    {
      description: `${getStepRate(productViewSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com produto visto",
      value: productViewSessionIds.size
    },
    {
      description: `${getStepRate(addToCartSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com carrinho",
      value: addToCartSessionIds.size
    },
    {
      description: "Soma de adições no período",
      label: "Total de itens adicionados aos carrinhos",
      value: addToCart
    },
    {
      description: `${getStepRate(whatsappClickSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com clique no WhatsApp",
      value: whatsappClickSessionIds.size
    },
    {
      description: `${getStepRate(orderSentSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com pedido no WhatsApp",
      value: orderSentSessionIds.size
    },
    {
      description: `${getStepRate(orderSessionIds.size, entrySessionIds.size)} das sessões`,
      label: "Sessões com pedido registrado",
      value: orderSessionIds.size
    },
    {
      description: `${getStepRate(convertedOrders, ordersCreated)} dos pedidos registrados`,
      label: "Pedidos convertidos",
      value: convertedOrders
    },
    {
      description: "Cliques em links no período",
      label: "Total de links acessados",
      value: filteredLinkClicks
    }
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center justify-between gap-3 lg:min-w-[220px]">
          <h1 className="min-w-0 text-2xl font-semibold sm:text-3xl">
            Marketing
          </h1>
          <AdminDashboardLink />
        </div>
        <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] lg:min-w-[460px]">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Início</span>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              name="inicio"
              type="date"
              defaultValue={formatDateInput(startDate)}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Fim</span>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              name="fim"
              type="date"
              defaultValue={formatDateInput(endDate)}
            />
          </label>
          <Button className="self-end" type="submit">
            Filtrar
          </Button>
        </form>
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
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Funil</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {funnel.map((step) => (
            <article
              className="rounded-lg border border-border bg-card p-4"
              key={step.label}
            >
              <p className="text-sm text-muted-foreground">{step.label}</p>
              <strong className="mt-2 block text-2xl font-semibold">
                {formatNumber(step.value)}
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Produtos mais vistos</h2>
          {topProductGroups.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">Visualizações</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductGroups.map((group) => {
                    const product = group.productId
                      ? productsById.get(group.productId)
                      : null;

                    return (
                      <tr className="border-t border-border" key={group.productId}>
                        <td className="px-4 py-3">
                          {product ? (
                            <Link
                              className="font-medium text-primary hover:underline"
                              href={`/produtos/${product.slug}`}
                            >
                              {product.description}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              Produto removido
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {formatNumber(group._count._all)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>Nenhuma visualização de produto no período.</EmptyState>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pesquisas mais realizadas</h2>
          {topSearches.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Termo</th>
                    <th className="px-4 py-3 font-medium">Buscas</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearches.map((group) => (
                    <tr
                      className="border-t border-border"
                      key={group.searchTermNormalized}
                    >
                      <td className="px-4 py-3 font-medium">
                        {group.searchTermNormalized}
                      </td>
                      <td className="px-4 py-3">
                        {formatNumber(group._count._all)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>Nenhuma busca registrada no período.</EmptyState>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Categorias mais vistas</h2>
          <CountRankingTable
            emptyMessage="Nenhuma visualização de categoria no período."
            rows={categoryViewRankingRows}
            valueLabel="Sessões"
          />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Promoções mais vistas</h2>
          <CountRankingTable
            emptyMessage="Nenhuma visualização de promoção no período."
            rows={promotionViewRankingRows}
            valueLabel="Sessões"
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Produtos mais pedidos</h2>
          <OrderRankingTable
            emptyMessage="Nenhum pedido de produto no período."
            rows={productOrderRankingRows}
          />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Promoções mais pedidas</h2>
          <OrderRankingTable
            emptyMessage="Nenhum pedido de promoção no período."
            rows={promotionOrderRankingRows}
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Produtos mais convertidos</h2>
          <OrderRankingTable
            emptyMessage="Nenhum produto convertido no período."
            rows={convertedProductOrderRankingRows}
          />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Promoções mais convertidas</h2>
          <OrderRankingTable
            emptyMessage="Nenhuma promoção convertida no período."
            rows={convertedPromotionOrderRankingRows}
          />
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Links mais acessados</h2>
        {topLinkGroups.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Link</th>
                  <th className="px-4 py-3 font-medium">Acessos</th>
                </tr>
              </thead>
              <tbody>
                {topLinkGroups.map((group) => {
                  const storeLink = group.linkId
                    ? storeLinksById.get(group.linkId)
                    : null;

                  return (
                    <tr className="border-t border-border" key={group.linkId}>
                      <td className="px-4 py-3">
                        {storeLink ? (
                          <div className="space-y-1">
                            <a
                              className="font-medium text-primary hover:underline"
                              href={storeLink.redirectUrl}
                            >
                              {storeLink.title}
                            </a>
                            <p className="break-all text-xs text-muted-foreground">
                              {storeLink.redirectUrl}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Link removido
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatNumber(group._count._all)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>Nenhum acesso a link no período.</EmptyState>
        )}
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pesquisas sem resultado</h2>
          {topSearchesWithoutResults.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Termo</th>
                    <th className="px-4 py-3 font-medium">Ocorrências</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearchesWithoutResults.map((group) => (
                    <tr
                      className="border-t border-border"
                      key={group.searchTermNormalized}
                    >
                      <td className="px-4 py-3 font-medium">
                        {group.searchTermNormalized}
                      </td>
                      <td className="px-4 py-3">
                        {formatNumber(group._count._all)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>Nenhuma busca sem resultado no período.</EmptyState>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Campanhas UTM</h2>
          {topCampaigns.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Origem</th>
                    <th className="px-4 py-3 font-medium">Mídia</th>
                    <th className="px-4 py-3 font-medium">Campanha</th>
                    <th className="px-4 py-3 font-medium">Eventos</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((group) => (
                    <tr
                      className="border-t border-border"
                      key={`${group.utmSource}-${group.utmMedium}-${group.utmCampaign}`}
                    >
                      <td className="px-4 py-3">{group.utmSource ?? "-"}</td>
                      <td className="px-4 py-3">{group.utmMedium ?? "-"}</td>
                      <td className="px-4 py-3">{group.utmCampaign ?? "-"}</td>
                      <td className="px-4 py-3">
                        {formatNumber(group._count._all)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>Nenhum evento com UTM no período.</EmptyState>
          )}
        </section>
      </div>
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Integrações</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Configure marcadores externos de marketing. Os eventos continuam
            sendo registrados internamente e também são encaminhados aos
            providers ativos.
          </p>
        </div>
        <MarketingIntegrationsForm integrations={marketingIntegrations} />
      </section>    </section>
  );
}
