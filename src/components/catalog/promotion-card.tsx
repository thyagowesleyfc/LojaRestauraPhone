/* eslint-disable @next/next/no-img-element */
import { PromotionType } from "@prisma/client";
import Link from "next/link";

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
      };
    }>;
  };
};

export function PromotionCard({ promotion }: PromotionCardProps) {
  const mainImage = promotion.images[0];

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {mainImage ? (
        <img
          alt={mainImage.altText ?? promotion.description}
          className="aspect-video w-full object-cover"
          src={mainImage.url}
        />
      ) : (
        <div className="aspect-video bg-muted" />
      )}
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE
              ? "Percentual"
              : "Combo"}
          </p>
          <h2 className="text-xl font-semibold">{promotion.description}</h2>
          <p className="text-sm text-muted-foreground">
            {promotion.type === PromotionType.CATEGORY_PERCENTAGE
              ? `${promotion.percentage}% em ${promotion.category?.name ?? "categoria"}`
              : formatMoneyFromCents(promotion.comboPriceInCents ?? 0)}
          </p>
          {promotion.type === PromotionType.PRODUCT_COMBO ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {promotion.products
                .map((promotionProduct) => promotionProduct.product.description)
                .join(", ")}
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href={`/promocoes/${promotion.slug}`}>Ver promocao</Link>
        </Button>
      </div>
    </article>
  );
}
