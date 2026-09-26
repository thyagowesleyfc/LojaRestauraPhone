import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams?: Promise<{
    busca?: string | string[];
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

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = normalizeOrderCodeSearch(resolvedSearchParams.busca);
  const orderDirection = normalizeOrderDirection(resolvedSearchParams.ordem);
  const orders = await prisma.customerOrder.findMany({
    where: search
      ? {
          code: {
            contains: search
          }
        }
      : undefined,
    orderBy: [{ createdAt: orderDirection }],
    include: {
      _count: {
        select: { items: true }
      }
    },
    take: 100
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pedidos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Acompanhe os pedidos enviados pelo WhatsApp e consulte os itens de
            cada código.
          </p>
        </div>
        <AdminDashboardLink />
      </div>

      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
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
          {search
            ? "Nenhum pedido encontrado para este código."
            : "Nenhum pedido enviado ainda."}
        </p>
      )}
    </section>
  );
}