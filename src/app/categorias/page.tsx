import { PromotionType } from "@prisma/client";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { getPromotionalPriceInCents } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      products: {
        some: {
          active: true
        }
      }
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
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
        take: 4,
        include: {
          images: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            take: 1
          }
        }
      }
    }
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Catalogo
        </p>
        <h1 className="text-4xl font-semibold">Categorias</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Encontre acessorios, carregadores, cabos e itens selecionados para o
          seu aparelho.
        </p>
      </header>
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.id} className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[1.8rem] font-semibold leading-tight sm:text-[2rem]">
                {category.name}
              </h2>
              <Link
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                href={`/categorias/${category.slug}`}
              >
                Ver mais
              </Link>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
              <div className="flex min-w-0 snap-x gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:items-stretch">
                {category.products.map((product) => (
                  <div
                    className="w-40 shrink-0 snap-start sm:w-56 md:w-64 lg:w-auto lg:shrink"
                    key={product.id}
                  >
                    <ProductCard
                      variant="compact"
                      product={{
                        ...product,
                        ...getPromotionalPriceInCents(
                          product.priceInCents,
                          category.promotions
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
        {categories.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhuma categoria com produtos ativos no momento.
          </p>
        ) : null}
      </div>
    </main>
  );
}