/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderConversionDialog } from "@/components/admin/order-conversion-dialog";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{
    codigo: string;
  }>;
  searchParams?: Promise<{
    erro?: string | string[];
    sucesso?: string | string[];
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function formatItemType(type: string) {
  const labels: Record<string, string> = {
    COMBO: "Combo",
    PRODUCT: "Produto",
    VARIANT: "SKU"
  };

  return labels[type] ?? type;
}

export default async function OrderDetailPage({
  params,
  searchParams
}: OrderDetailPageProps) {
  const { codigo } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = codigo.trim().toUpperCase();
  const order = await prisma.customerOrder.findUnique({
    where: { code },
    include: {
      items: {
        orderBy: [{ createdAt: "asc" }]
      }
    }
  });

  if (!order) {
    notFound();
  }

  const errorMessage = getSingleParam(resolvedSearchParams.erro);
  const successMessage =
    getSingleParam(resolvedSearchParams.sucesso) === "conversao"
      ? "Conversão marcada para este pedido."
      : undefined;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pedido {order.code}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Pedido enviado pelo WhatsApp em {formatOrderDate(order.createdAt)}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/pedidos">Voltar para pedidos</Link>
          </Button>
          <OrderConversionDialog
            converted={order.converted}
            orderCode={order.code}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          {successMessage}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Código</p>
          <strong className="mt-2 block text-xl">{order.code}</strong>
        </article>
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Itens</p>
          <strong className="mt-2 block text-xl">{order.items.length}</strong>
        </article>
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <strong className="mt-2 block text-xl text-primary">
            {formatMoneyFromCents(order.totalInCents)}
          </strong>
        </article>
        <article className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Conversão</p>
          <strong className="mt-2 block text-xl">
            {order.converted ? "Marcada" : "Pendente"}
          </strong>
        </article>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Itens do pedido</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <article
                className="grid gap-4 p-4 md:grid-cols-[72px_1fr_110px_130px_130px] md:items-center"
                key={item.id}
              >
                {item.imageUrl ? (
                  <img
                    alt={item.description}
                    className="size-18 rounded-md object-cover"
                    src={item.imageUrl}
                  />
                ) : (
                  <div className="size-18 rounded-md bg-muted" />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {formatItemType(item.type)}
                  </p>
                  <h3 className="font-semibold leading-snug">
                    {item.description}
                  </h3>
                  {item.detail ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.detail}
                    </p>
                  ) : null}
                  {item.sku ? (
                    <p className="text-xs text-muted-foreground">
                      SKU interno: {item.sku}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Quantidade
                  </p>
                  <p className="text-sm">{item.quantity}x</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Unitário
                  </p>
                  <p className="text-sm">
                    {formatMoneyFromCents(item.unitPriceInCents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground md:hidden">
                    Subtotal
                  </p>
                  <p className="font-semibold text-primary">
                    {formatMoneyFromCents(item.subtotalInCents)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}