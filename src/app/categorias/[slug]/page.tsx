import { PromotionType } from "@prisma/client";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { getPromotionalPriceInCents } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: {
      slug,
      active: true
    },
    include: {
      promotions: {
        where: {
          type: PromotionType.CATEGORY_PERCENTAGE,
          active: true
        }
      },
      products: {
        where: {
          active: true
        },
        orderBy: [{ createdAt: "desc" }],
        include: {
          images: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            take: 1
          }
        }
      }
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Categoria
        </p>
        <h1 className="text-4xl font-semibold">{category.name}</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              ...getPromotionalPriceInCents(
                product.priceInCents,
                category.promotions
              )
            }}
          />
        ))}
      </div>
      {category.products.length === 0 ? (
        <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          Nenhum produto ativo nesta categoria.
        </p>
      ) : null}
    </main>
  );
}