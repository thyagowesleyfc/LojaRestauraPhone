import { PromotionType, type Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { getPromotionalPriceInCents } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

const emptyProductSearchFilter: Prisma.ProductWhereInput = {
  id: "__empty_search__"
};

type SearchPageProps = {
  params: Promise<{
    termo: string;
  }>;
};

function decodeSearchTerm(term: string) {
  try {
    return decodeURIComponent(term).trim();
  } catch {
    return term.trim();
  }
}

function getProductSearchFilter(searchTerm: string): Prisma.ProductWhereInput {
  if (!searchTerm) {
    return emptyProductSearchFilter;
  }

  return {
    active: true,
    OR: [
      {
        description: {
          contains: searchTerm,
          mode: "insensitive"
        }
      },
      {
        specification: {
          contains: searchTerm,
          mode: "insensitive"
        }
      }
    ]
  };
}

export async function generateMetadata({
  params
}: SearchPageProps): Promise<Metadata> {
  const { termo } = await params;
  const searchTerm = decodeSearchTerm(termo);

  return {
    title: searchTerm ? `Pesquisa: ${searchTerm}` : "Pesquisa",
    description: searchTerm
      ? `Produtos encontrados para ${searchTerm}.`
      : "Pesquisa de produtos."
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { termo } = await params;
  const searchTerm = decodeSearchTerm(termo);
  const productSearchFilter = getProductSearchFilter(searchTerm);
  const categories = searchTerm
    ? await prisma.category.findMany({
        where: {
          active: true,
          products: {
            some: productSearchFilter
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
            where: productSearchFilter,
            orderBy: [{ createdAt: "desc" }],
            include: {
              images: {
                orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
                take: 1
              }
            }
          }
        }
      })
    : [];
  const resultCount = categories.reduce(
    (total, category) => total + category.products.length,
    0
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Pesquisa
        </p>
        <h1 className="text-4xl font-semibold">Resultados para {searchTerm}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {resultCount === 1
            ? "1 produto encontrado por descricao ou especificacao."
            : `${resultCount} produtos encontrados por descricao ou especificacao.`}
        </p>
      </header>

      <div className="space-y-10">
        {categories.map((category) => (
          <section className="space-y-4" key={category.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <Button asChild size="sm" variant="outline">
                <Link href={`/categorias/${category.slug}`}>Ver categoria</Link>
              </Button>
            </div>
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
          </section>
        ))}
        {categories.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhum produto ativo encontrado para esta pesquisa.
          </p>
        ) : null}
      </div>
    </main>
  );
}