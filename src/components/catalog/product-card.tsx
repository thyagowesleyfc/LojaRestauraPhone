import Link from "next/link";

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
  percentage?: number | null;
  compact: boolean;
};

function ProductCardPriceSummary({
  currentPriceInCents,
  originalPriceInCents,
  percentage,
  compact
}: ProductCardPriceSummaryProps) {
  const hasDiscount = currentPriceInCents < originalPriceInCents;

  return (
    <div
      className={`mt-auto border-t border-border/70 pt-2 ${
        compact ? "space-y-1.5" : "space-y-2"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p
          className={`font-semibold leading-none text-primary ${
            compact ? "text-base" : "text-lg"
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
      {hasDiscount && percentage ? (
        <p className="w-fit rounded-md bg-accent px-2 py-1 text-xs font-semibold leading-none text-accent-foreground">
          {percentage}% OFF
        </p>
      ) : null}
    </div>
  );
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const mainImage = product.images[0];
  const currentPriceInCents =
    product.currentPriceInCents ?? product.priceInCents;
  const hasDiscount = currentPriceInCents < product.priceInCents;
  const imageAlt = mainImage?.altText ?? product.description;

  if (variant === "list") {
    return (
      <Link
        className="group flex min-h-28 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        href={`/produtos/${product.slug}`}
      >
        <div className="w-28 shrink-0 bg-muted">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              src={mainImage.url}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex flex-1 flex-col justify-center gap-2 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {product.description}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {hasDiscount ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatMoneyFromCents(product.priceInCents)}
              </p>
            ) : null}
            <p className="text-sm font-medium text-primary">
              {formatMoneyFromCents(currentPriceInCents)}
            </p>
            {hasDiscount && product.appliedPromotion?.percentage ? (
              <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                {product.appliedPromotion.percentage}% OFF
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  const compact = variant === "compact";

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      href={`/produtos/${product.slug}`}
    >
      {mainImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={imageAlt}
          className={`${
            compact ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
          } w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]`}
          src={mainImage.url}
        />
      ) : (
        <div
          className={`${
            compact ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
          } bg-muted`}
        />
      )}
      <div
        className={`flex flex-1 flex-col justify-between ${
          compact ? "gap-2.5 p-3 sm:p-3.5" : "gap-3 p-4"
        }`}
      >
        <h3
          className={`line-clamp-2 font-semibold leading-snug ${
            compact ? "text-sm sm:text-base" : ""
          }`}
        >
          {product.description}
        </h3>
        <ProductCardPriceSummary
          compact={compact}
          currentPriceInCents={currentPriceInCents}
          originalPriceInCents={product.priceInCents}
          percentage={product.appliedPromotion?.percentage}
        />
      </div>
    </Link>
  );
}
