/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import Link from "next/link";

import { deletePromotionAction } from "@/actions/promotions";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type PromotionsPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

function promotionTypeLabel(type: PromotionType) {
  return type === PromotionType.CATEGORY_PERCENTAGE
    ? "Percentual por categoria"
    : "Combo";
}

export default async function PromotionsPage({
  searchParams
}: PromotionsPageProps) {
  const { erro } = await searchParams;
  const promotions = await prisma.promotion.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 1
      },
      products: {
        include: {
          product: true
        },
        orderBy: [{ displayOrder: "asc" }]
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Promocoes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie descontos por categoria e combos de produtos.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promocoes/nova">Nova promocao</Link>
        </Button>
      </div>
      {erro ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <article
            key={promotion.id}
            className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[120px_1fr_auto]"
          >
            {promotion.images[0] ? (
              <img
                alt={promotion.images[0].altText ?? promotion.description}
                className="aspect-square w-full rounded-md object-cover md:w-[120px]"
                src={promotion.images[0].url}
              />
            ) : (
              <div className="aspect-square rounded-md bg-muted md:w-[120px]" />
            )}
            <div className="space-y-1">
              <h2 className="font-semibold">{promotion.description}</h2>
              <p className="text-sm text-muted-foreground">
                {promotionTypeLabel(promotion.type)}
                {promotion.type === PromotionType.CATEGORY_PERCENTAGE
                  ? ` · ${promotion.percentage}% em ${promotion.category?.name ?? "categoria"}`
                  : ` · ${formatMoneyFromCents(promotion.comboPriceInCents ?? 0)}`}
              </p>
              <p className="text-sm">
                {promotion.active ? "Ativa" : "Inativa"}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/promocoes/${promotion.id}/editar`}>
                  Editar
                </Link>
              </Button>
              <form action={deletePromotionAction}>
                <input type="hidden" name="id" value={promotion.id} />
                <Button type="submit" size="sm" variant="destructive">
                  Excluir
                </Button>
              </form>
            </div>
          </article>
        ))}
        {promotions.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhuma promocao cadastrada.
          </p>
        ) : null}
      </div>
    </section>
  );
}
