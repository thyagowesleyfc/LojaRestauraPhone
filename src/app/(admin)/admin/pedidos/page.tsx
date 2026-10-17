import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";
import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { OrdersComparisonChart } from "@/components/admin/orders-comparison-chart";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams?: Promise<{
    busca?: string | string[];
    fim?: string | string[];
    inicio?: string | string[];
    ordem?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeOrderCodeSearch(value: string | string[] | undefined) {
  return (getSingleParam(value) ?? "").trim().toUpperCase();
}

function normalizeOrderDirection(value: string | string[] | undefined) {
  return getSingleParam(value) === "antigos" ? "asc" : "desc";
}

function parseDateParam(
  value: string | string[] | undefined,
  endOfDay = false
) {
  const rawDate = getSingleParam(value);

  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return null;
  }

  const date = new Date(`${rawDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

type OrderChartRow = {
  converted: number;
  month: Date;
  orders: number;
};

function formatChartMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: "UTC",
    year: "2-digit"
  })
    .format(date)
    .replace(" de ", "/");
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = normalizeOrderCodeSearch(resolvedSearchParams.busca);
  const endDate = parseDateParam(resolvedSearchParams.fim, true);
  const startDate = parseDateParam(resolvedSearchParams.inicio);
  const orderDirection = normalizeOrderDirection(resolvedSearchParams.ordem);
  const hasDateFilter = Boolean(startDate || endDate);
  const where: PrismaTypes.CustomerOrderWhereInput = {
    ...(search ? { code: { contains: search } } : {}),
    ...(hasDateFilter
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {})
          }
        }
      : {})
  };
  const hasFilters = Boolean(search || hasDateFilter);
  const chartDateFilters = [
    ...(startDate ? [Prisma.sql`"createdAt" >= ${startDate}`] : []),
    ...(endDate ? [Prisma.sql`"createdAt" <= ${endDate}`] : [])
  ];
  const chartWhere = chartDateFilters.length
    ? Prisma.sql`WHERE ${Prisma.join(chartDateFilters, " AND ")}`
    : Prisma.empty;
  const [orders, chartRows] = await Promise.all([
    prisma.customerOrder.findMany({
      where,
      orderBy: [{ createdAt: orderDirection }],
      include: {
        _count: {
          select: { items: true }
        }
      },
      take: 100
    }),
    prisma.$queryRaw<OrderChartRow[]>(Prisma.sql`
      SELECT
        date_trunc('month', "createdAt") AS month,
        COUNT(*)::integer AS orders,
        COUNT(*) FILTER (WHERE converted = true)::integer AS converted
      FROM "CustomerOrder"
      ${chartWhere}
      GROUP BY 1
      ORDER BY 1 ASC
    `)
  ]);
  const chartData = chartRows.map((row) => ({
    converted: Number(row.converted),
    label: formatChartMonth(row.month),
    orders: Number(row.orders)
  }));

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-semibold sm:text-3xl">
          Pedidos
        </h1>
        <AdminDashboardLink />
      </div>

      <OrdersComparisonChart data={chartData} />

      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_170px_220px_auto] lg:items-end">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Buscar por código</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={search}
            maxLength={10}
            name="busca"
            placeholder="XYZABC0000"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Data inicial</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={formatDateInput(startDate)}
            name="inicio"
            type="date"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Data final</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={formatDateInput(endDate)}
            name="fim"
            type="date"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Ordenar por data</span>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={orderDirection === "asc" ? "antigos" : "recentes"}
            name="ordem"
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
          </select>
        </label>
        <Button type="submit">Aplicar</Button>
      </form>

      {orders.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="hidden grid-cols-[1.2fr_1fr_0.7fr_0.8fr_auto] gap-4 bg-muted px-4 py-3 text-sm font-medium text-muted-foreground md:grid">
            <span>Código</span>
            <span>Data</span>
            <span>Itens</span>
            <span>Total</span>
            <span className="text-right">Ação</span>
          </div>
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <article
                className="grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_0.7fr_0.8fr_auto] md:items-center md:gap-4"
                key={order.id}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Código
                  </p>
                  <p className="font-semibold">{order.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Data
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Itens
                  </p>
                  <p className="text-sm">{order._count.items}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Total
                  </p>
                  <p className="font-semibold text-primary">
                    {formatMoneyFromCents(order.totalInCents)}
                  </p>
                </div>
                <div className="md:text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/pedidos/${order.code}`}>Visualizar</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {hasFilters
            ? "Nenhum pedido encontrado para os filtros informados."
            : "Nenhum pedido enviado ainda."}
        </p>
      )}
    </section>
  );
}
