import { AnalyticsEventType, type Prisma } from "@prisma/client";
import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { MarketingIntegrationsForm } from "@/components/admin/marketing-integrations-form";
import { Button } from "@/components/ui/button";
import { getMarketingIntegrations } from "@/lib/marketing-integrations";
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

type ProductViewGroup = CountGroup & {
  productId: string | null;
};

type ProductViewSessionGroup = {
  productId: string | null;
  sessionId: string;
};

type SearchTermGroup = CountGroup & {
  searchTermNormalized: string | null;
};

type CampaignGroup = CountGroup & {
  utmCampaign: string | null;
  utmMedium: string | null;
  utmSource: string | null;
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold">
        {formatNumber(value)}
      </strong>
    </article>
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
    homeVisitGroups,
    productViewSessionGroups,
    searches,
    searchesWithoutResults,
    addToCart,
    removeFromCart,
    whatsappClicks,
    ordersSent,
    sessionGroups,
    searchGroups,
    searchNoResultGroups,
    campaignGroups
  ] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.PAGE_VIEW),
        OR: [{ pagePath: "/" }, { pagePath: { startsWith: "/?" } }]
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["productId", "sessionId"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.PRODUCT_VIEW),
        productId: { not: null }
      }
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.SEARCH)
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.SEARCH_NO_RESULTS)
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.ADD_TO_CART)
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.REMOVE_FROM_CART)
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.WHATSAPP_CLICK)
    }),
    prisma.analyticsEvent.count({
      where: metricWhere(baseWhere, AnalyticsEventType.ORDER_SENT_TO_WHATSAPP)
    }),
    prisma.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: baseWhere
    }),
    
    prisma.analyticsEvent.groupBy({
      by: ["searchTermNormalized"],
      where: {
        ...metricWhere(baseWhere, AnalyticsEventType.SEARCH),
        searchTermNormalized: { not: null }
      },
      _count: { _all: true }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["searchTermNormalized"],
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
  ]);

  const homeVisits = homeVisitGroups.length;
  const productViews = productViewSessionGroups.length;
  const productViewCounts = new Map<string, number>();

  for (const group of productViewSessionGroups as ProductViewSessionGroup[]) {
    if (group.productId) {
      productViewCounts.set(
        group.productId,
        (productViewCounts.get(group.productId) ?? 0) + 1
      );
    }
  }

  const topProductGroups = sortByCount(
    Array.from(productViewCounts, ([productId, count]) => ({
      _count: { _all: count },
      productId
    })) as ProductViewGroup[]
  ).slice(0, 10);
  const productIds = topProductGroups
    .map((group) => group.productId)
    .filter((productId): productId is string => Boolean(productId));
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { description: true, id: true, slug: true }
      })
    : [];
  const productsById = new Map(products.map((product) => [product.id, product]));
  const topSearches = sortByCount(searchGroups as SearchTermGroup[]).slice(0, 10);
  const topSearchesWithoutResults = sortByCount(
    searchNoResultGroups as SearchTermGroup[]
  ).slice(0, 10);
  const topCampaigns = sortByCount(campaignGroups as CampaignGroup[]).slice(0, 10);
  const marketingIntegrations = await getMarketingIntegrations();
  const funnel = [
    {
      label: "Sessoes",
      rate: "100%",
      value: sessionGroups.length
    },
    {
      label: "Produtos vistos",
      rate: getStepRate(productViews, sessionGroups.length),
      value: productViews
    },
    {
      label: "Add to cart",
      rate: getStepRate(addToCart, productViews),
      value: addToCart
    },
    {
      label: "WhatsApp click",
      rate: getStepRate(whatsappClicks, addToCart),
      value: whatsappClicks
    },
    {
      label: "Pedido enviado",
      rate: getStepRate(ordersSent, whatsappClicks),
      value: ordersSent
    }
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Marketing</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Acompanhe sessoes, buscas, produtos visualizados, carrinho,
            WhatsApp e origem por UTM.
          </p>
          <AdminDashboardLink />
        </div>
        <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] lg:min-w-[460px]">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Inicio</span>
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
          Integracoes atualizadas.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Visitas Home" value={homeVisits} />
        <MetricCard label="Produtos vistos" value={productViews} />
        <MetricCard label="Buscas" value={searches} />
        <MetricCard label="Buscas sem resultado" value={searchesWithoutResults} />
        <MetricCard label="Add to cart" value={addToCart} />
        <MetricCard label="Pedidos no WhatsApp" value={ordersSent} />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Funil</h2>
        <div className="grid gap-4 md:grid-cols-5">
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
                {step.rate} do passo anterior
              </p>
            </article>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Remocoes do carrinho no periodo: {formatNumber(removeFromCart)}.
        </p>
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
                    <th className="px-4 py-3 font-medium">Views</th>
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
            <EmptyState>Nenhuma visualizacao de produto no periodo.</EmptyState>
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
            <EmptyState>Nenhuma busca registrada no periodo.</EmptyState>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Pesquisas sem resultado</h2>
          {topSearchesWithoutResults.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Termo</th>
                    <th className="px-4 py-3 font-medium">Ocorrencias</th>
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
            <EmptyState>Nenhuma busca sem resultado no periodo.</EmptyState>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Campanhas UTM</h2>
          {topCampaigns.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Medium</th>
                    <th className="px-4 py-3 font-medium">Campaign</th>
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
            <EmptyState>Nenhum evento com UTM no periodo.</EmptyState>
          )}
        </section>
      </div>
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Integracoes</h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Configure marcadores externos de marketing. Os eventos continuam
            sendo registrados internamente e tambem sao encaminhados aos
            providers ativos.
          </p>
        </div>
        <MarketingIntegrationsForm integrations={marketingIntegrations} />
      </section>    </section>
  );
}
