import { PromotionCard } from "@/components/catalog/promotion-card";
import { isPromotionCurrentlyActive } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    where: {
      active: true
    },
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
  const activePromotions = promotions.filter((promotion) =>
    isPromotionCurrentlyActive(promotion)
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Ofertas
        </p>
        <h1 className="text-4xl font-semibold">Promocoes</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Descontos por categoria e combos selecionados pela loja.
        </p>
      </header>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {activePromotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
      {activePromotions.length === 0 ? (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          Nenhuma promocao ativa no momento.
        </p>
      ) : null}
    </main>
  );
}
