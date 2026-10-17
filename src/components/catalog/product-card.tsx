import Link from "next/link";

import { MagneticGlowCard } from "@/components/catalog/magnetic-glow-card";
import { formatMoneyFromCents } from "@/lib/formatters";

type ProductCardProps = {
  product: {
    description: string;
    slug: string;
    priceInCents: number;
    currentPriceInCents?: number;
    appliedPromotion?: {
      percentage: number | null;
    } | null;
    images: Array<{
      url: string;
      altText: string | null;
    }>;
  };
  variant?: "default" | "compact" | "list";
};

type ProductCardPriceSummaryProps = {
  currentPriceInCents: number;
  originalPriceInCents: number;
  compact: boolean;
};

function ProductCardPriceSummary({
  currentPriceInCents,
  originalPriceInCents,
  compact
}: ProductCardPriceSummaryProps) {
  const hasDiscount = currentPriceInCents < originalPriceInCents;

  return (
    <div
      className={`mt-auto ${
        compact ? "space-y-1.5" : "space-y-2.5"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p
          className={`font-bold leading-none text-primary ${
            compact ? "text-lg" : "text-2xl"
          }`}
        >
          {formatMoneyFromCents(currentPriceInCents)}
        </p>
        {hasDiscount ? (
          <p className="text-xs leading-none text-muted-foreground line-through">
            {formatMoneyFromCents(originalPriceInCents)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const mainImage = product.images[0];
  const currentPriceInCents =
    product.currentPriceInCents ?? product.priceInCents;
  const discountPercentage = product.appliedPromotion?.percentage;
  const showDiscountBadge =
    currentPriceInCents < product.priceInCents &&
    typeof discountPercentage === "number" &&
    discountPercentage > 0;
  const imageAlt = mainImage?.altText ?? product.description;

  if (variant === "list") {
    return (
      <Link
        className="group flex min-h-32 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={`/produtos/${product.slug}`}
      >
        <div className="relative w-28 shrink-0 overflow-hidden bg-muted">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              src={mainImage.url}
            />
          ) : null}
        </div>
        <MagneticGlowCard className="magnetic-glow-card--body flex-1">
          <div className="min-w-0 flex flex-1 flex-col justify-between gap-2.5 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {product.description}
            </h3>
            <ProductCardPriceSummary
              compact
              currentPriceInCents={currentPriceInCents}
              originalPriceInCents={product.priceInCents}
            />
            {showDiscountBadge ? (
              <span className="w-fit rounded-md bg-primary px-2 py-1 text-xs font-semibold leading-none text-primary-foreground">
                -{discountPercentage}%
              </span>
            ) : null}
          </div>
        </MagneticGlowCard>
      </Link>
    );
  }

  const compact = variant === "compact";

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      href={`/produtos/${product.slug}`}
    >
      <div
        className={`${
          compact ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
        } relative shrink-0 overflow-hidden bg-muted`}
      >
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            src={mainImage.url}
          />
        ) : null}
        {showDiscountBadge ? (
          <span className="card-badge">-{discountPercentage}%</span>
        ) : null}
      </div>
      <MagneticGlowCard className="magnetic-glow-card--body flex-1">
        <div
          className={`flex h-full flex-1 flex-col justify-between ${
            compact ? "gap-3 p-4" : "gap-4 p-5"
          }`}
        >
          <h3
            className={`line-clamp-2 font-semibold leading-snug ${
              compact ? "text-sm sm:text-base" : "text-lg"
            }`}
          >
            {product.description}
          </h3>
          <ProductCardPriceSummary
            compact={compact}
            currentPriceInCents={currentPriceInCents}
            originalPriceInCents={product.priceInCents}
          />
        </div>
      </MagneticGlowCard>
    </Link>
  );
}
