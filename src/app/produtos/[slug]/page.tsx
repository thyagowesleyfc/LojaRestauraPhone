/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductVariantSelector } from "@/components/catalog/product-variant-selector";
import { formatMoneyFromCents } from "@/lib/formatters";
import { getPromotionalPriceInCents } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      slug,
      active: true,
      category: {
        active: true
      }
    },
    include: {
      category: {
        include: {
          promotions: {
            where: {
              type: PromotionType.CATEGORY_PERCENTAGE,
              active: true
            }
          }
        }
      },
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      },
      variants: {
        where: { active: true },
        orderBy: [{ sku: "asc" }],
        include: {
          values: {
            include: {
              characteristic: true,
              characteristicOption: true
            },
            orderBy: [{ characteristic: { displayOrder: "asc" } }]
          }
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const pricing = getPromotionalPriceInCents(
    product.priceInCents,
    product.category.promotions
  );
  const hasDiscount = pricing.currentPriceInCents < pricing.originalPriceInCents;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid gap-4 sm:grid-cols-2">
        {product.images.map((image) => (
          <img
            key={image.id}
            alt={image.altText ?? product.description}
            className="aspect-square w-full rounded-lg border border-border object-cover"
            src={image.url}
          />
        ))}
      </section>
      <section className="space-y-6">
        <div className="space-y-3">
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={`/categorias/${product.category.slug}`}
          >
            {product.category.name}
          </Link>
          <h1 className="text-4xl font-semibold">{product.description}</h1>
          <div>
            {hasDiscount ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatMoneyFromCents(pricing.originalPriceInCents)}
              </p>
            ) : null}
            <p className="text-2xl font-semibold text-primary">
              {formatMoneyFromCents(pricing.currentPriceInCents)}
            </p>
            {pricing.appliedPromotion?.percentage ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {pricing.appliedPromotion.description} ·{" "}
                {pricing.appliedPromotion.percentage}% OFF
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Especificacao</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {product.specification}
          </p>
        </div>

        {product.variants.length > 0 ? (
          <ProductVariantSelector
            productDescription={product.description}
            variants={product.variants}
          />
        ) : (
          <AddToCartButton
            item={{
              type: "product",
              id: product.id,
              description: product.description
            }}
          />
        )}
      </section>
    </main>
  );
}
