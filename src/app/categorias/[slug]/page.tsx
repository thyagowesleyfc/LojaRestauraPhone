import { PromotionType, type Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

import {
  CategoryProductSortSelect,
  type CategoryProductSort
} from "@/components/catalog/category-product-sort-select";
import { ProductCard } from "@/components/catalog/product-card";
import { getPromotionalPriceInCents } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    ordenar?: string | string[];
  }>;
};

function getCategoryProductSort(value: string | string[] | undefined) {
  const sortValue = Array.isArray(value) ? value[0] : value;

  if (sortValue === "maior-preco" || sortValue === "menor-preco") {
    return sortValue;
  }

  return "alfabetica";
}

function getProductOrderBy(
  sort: CategoryProductSort
): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "maior-preco") {
    return [{ priceInCents: "desc" }, { description: "asc" }];
  }

  if (sort === "menor-preco") {
    return [{ priceInCents: "asc" }, { description: "asc" }];
  }

  return [{ description: "asc" }, { createdAt: "desc" }];
}

export default async function CategoryPage({
  params,
  searchParams
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const productSort = getCategoryProductSort(resolvedSearchParams.ordenar);
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
        orderBy: getProductOrderBy(productSort),
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="text-4xl font-semibold">{category.name}</h1>
          <CategoryProductSortSelect value={productSort} />
        </div>
      </header>
      <div className="grid gap-3 md:hidden">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            variant="list"
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
      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
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
