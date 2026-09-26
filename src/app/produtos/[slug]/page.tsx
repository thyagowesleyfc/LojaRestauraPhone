import { PromotionType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsEventTracker } from "@/components/analytics/analytics-event-tracker";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductImageGallery } from "@/components/catalog/product-image-gallery";
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
    <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <AnalyticsEventTracker productId={product.id} type="PRODUCT_VIEW" />
      <ProductImageGallery
        images={product.images}
        productDescription={product.description}
      />
      <section className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <Link
            className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline sm:text-sm sm:normal-case sm:tracking-normal"
            href={`/categorias/${product.category.slug}`}
          >
            {product.category.name}
          </Link>
          <h1 className="text-2xl font-semibold leading-tight sm:text-4xl">
            {product.description}
          </h1>
          <div className="flex flex-wrap items-end justify-between gap-2 rounded-lg border border-border bg-card p-3 sm:block sm:border-0 sm:bg-transparent sm:p-0">
            <div className="space-y-1">
              {hasDiscount ? (
                <p className="text-xs text-muted-foreground line-through sm:text-sm">
                  {formatMoneyFromCents(pricing.originalPriceInCents)}
                </p>
              ) : null}
              <p className="text-2xl font-semibold leading-none text-primary">
                {formatMoneyFromCents(pricing.currentPriceInCents)}
              </p>
            </div>
            {pricing.appliedPromotion?.percentage ? (
              <p className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground sm:mt-1 sm:w-fit sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm sm:font-normal sm:text-muted-foreground">
                {pricing.appliedPromotion.description} - {" "}
                {pricing.appliedPromotion.percentage}% OFF
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3 sm:border-0 sm:p-0">
          <h2 className="font-semibold">Informações do produto</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground sm:leading-7">
            {product.specification}
          </p>
        </div>
        {product.variants.length > 0 ? (
          <ProductVariantSelector
            productDescription={product.description}
            productId={product.id}
            variants={product.variants}
          />
        ) : (
          <AddToCartButton
            className="w-full sm:w-auto"
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
