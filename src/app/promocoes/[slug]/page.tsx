/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import {
  getPromotionalPriceInCents,
  isPromotionCurrentlyActive
} from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

type PromotionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PromotionPage({ params }: PromotionPageProps) {
  const { slug } = await params;
  const promotion = await prisma.promotion.findFirst({
    where: {
      slug,
      active: true
    },
    include: {
      category: {
        include: {
          products: {
            where: { active: true },
            orderBy: [{ createdAt: "desc" }],
            include: {
              images: {
                orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
                take: 1
              }
            }
          }
        }
      },
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      },
      products: {
        include: {
          product: {
            include: {
              images: {
                orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
                take: 1
              }
            }
          }
        },
        orderBy: [{ displayOrder: "asc" }]
      }
    }
  });

  if (!promotion || !isPromotionCurrentlyActive(promotion)) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-4 sm:grid-cols-2">
          {promotion.images.map((image) => (
            <img
              key={image.id}
              alt={image.altText ?? promotion.description}
              className="aspect-video w-full rounded-lg border border-border object-cover"
              src={image.url}
            />
          ))}
        </section>
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE
              ? "Percentual por categoria"
              : "Combo"}
          </p>
          <h1 className="text-4xl font-semibold">{promotion.description}</h1>
          <p className="text-xl font-semibold text-primary">
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE
              ? `${promotion.percentage}% OFF`
              : formatMoneyFromCents(promotion.comboPriceInCents ?? 0)}
          </p>
          {promotion.type === PromotionType.CATEGORY_PERCENTAGE ? (
            <p className="text-sm text-muted-foreground">
              Categoria: {promotion.category?.name}
            </p>
          ) : (
            <Button disabled>Adicionar combo ao carrinho</Button>
          )}
        </section>
      </header>
      {promotion.type === PromotionType.CATEGORY_PERCENTAGE &&
      promotion.category ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Produtos com desconto</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promotion.category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  ...getPromotionalPriceInCents(product.priceInCents, [
                    promotion
                  ])
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
      {promotion.type === PromotionType.PRODUCT_COMBO ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Produtos do combo</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promotion.products.map((promotionProduct) => (
              <ProductCard
                key={promotionProduct.productId}
                product={promotionProduct.product}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
