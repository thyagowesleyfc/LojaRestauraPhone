/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/catalog/product-card";
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
            <AddToCartButton
              item={{
                type: "combo",
                id: promotion.id,
                description: promotion.description
              }}
            >
              Adicionar combo ao carrinho
            </AddToCartButton>
          )}
        </section>
      </header>
      {promotion.type === PromotionType.CATEGORY_PERCENTAGE &&
      promotion.category ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Produtos com desconto</h2>
          <div className="-mx-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <div className="flex min-w-0 snap-x gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:items-stretch">
              {promotion.category.products.map((product) => (
                <div
                  className="w-40 shrink-0 snap-start sm:w-56 md:w-64 lg:w-auto lg:shrink"
                  key={product.id}
                >
                  <ProductCard
                    variant="compact"
                    product={{
                      ...product,
                      ...getPromotionalPriceInCents(product.priceInCents, [
                        promotion
                      ])
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {promotion.type === PromotionType.PRODUCT_COMBO ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Produtos do combo</h2>
          <div className="-mx-6 overflow-x-auto px-6 pb-2 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <div className="flex min-w-0 snap-x gap-3 sm:gap-4 lg:grid lg:grid-cols-4 lg:items-stretch">
              {promotion.products.map((promotionProduct) => (
                <div
                  className="w-40 shrink-0 snap-start sm:w-56 md:w-64 lg:w-auto lg:shrink"
                  key={promotionProduct.productId}
                >
                  <ProductCard
                    variant="compact"
                    product={promotionProduct.product}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
