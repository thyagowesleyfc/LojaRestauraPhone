/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import Link from "next/link";

import { MagneticGlowCard } from "@/components/catalog/magnetic-glow-card";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";

type PromotionCardProps = {
  promotion: {
    description: string;
    slug: string;
    type: PromotionType;
    percentage: number | null;
    comboPriceInCents: number | null;
    category: {
      name: string;
    } | null;
    images: Array<{
      url: string;
      altText: string | null;
    }>;
    products: Array<{
      product: {
        description: string;
        priceInCents: number;
      };
    }>;
  };
};

export function PromotionCard({ promotion }: PromotionCardProps) {
  const mainImage = promotion.images[0];
  const comboOriginalPriceInCents = promotion.products.reduce(
    (total, promotionProduct) =>
      total + promotionProduct.product.priceInCents,
    0
  );
  const comboPriceInCents = promotion.comboPriceInCents ?? 0;
  const comboDiscountPercentage =
    comboOriginalPriceInCents > comboPriceInCents
      ? Math.round(
          ((comboOriginalPriceInCents - comboPriceInCents) /
            comboOriginalPriceInCents) *
            100
        )
      : 0;
  const showDiscountBadge =
    promotion.type === PromotionType.CATEGORY_PERCENTAGE
      ? typeof promotion.percentage === "number" && promotion.percentage > 0
      : comboDiscountPercentage > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary">
      <div className="relative aspect-video shrink-0 overflow-hidden bg-muted">
        {mainImage ? (
          <img
            alt={mainImage.altText ?? promotion.description}
            className="h-full w-full object-cover"
            src={mainImage.url}
          />
        ) : null}
        {showDiscountBadge ? (
          <span className="card-badge">
            -
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE
              ? promotion.percentage
              : comboDiscountPercentage}%
          </span>
        ) : null}
      </div>
      <MagneticGlowCard className="magnetic-glow-card--body flex-1">
        <div className="flex h-full flex-1 flex-col justify-between gap-5 p-5">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {promotion.type === PromotionType.CATEGORY_PERCENTAGE
                ? "Percentual"
                : "Combo"}
            </p>
            <h2 className="line-clamp-2 text-xl font-semibold leading-snug">
              {promotion.description}
            </h2>
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE ? (
              <p className="text-sm text-muted-foreground">
                {`${promotion.percentage}% em ${promotion.category?.name ?? "categoria"}`}
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  De{" "}
                  <span className="line-through">
                    {formatMoneyFromCents(comboOriginalPriceInCents)}
                  </span>
                </p>
                <p className="text-2xl font-bold leading-none text-primary">
                  Por {formatMoneyFromCents(comboPriceInCents)}
                </p>
              </div>
            )}
            {promotion.type === PromotionType.PRODUCT_COMBO ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {promotion.products
                  .map((promotionProduct) => promotionProduct.product.description)
                  .join(", ")}
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline">
            <Link href={`/promocoes/${promotion.slug}`}>Ver promoção</Link>
          </Button>
        </div>
      </MagneticGlowCard>
    </article>
  );
}
