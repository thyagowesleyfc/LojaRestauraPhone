import Link from "next/link";

import { formatMoneyFromCents } from "@/lib/formatters";

type ProductCardProps = {
  product: {
    description: string;
    slug: string;
    priceInCents: number;
    images: Array<{
      url: string;
      altText: string | null;
    }>;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];

  return (
    <Link
      className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
      href={`/produtos/${product.slug}`}
    >
      {mainImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={mainImage.altText ?? product.description}
          className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.02]"
          src={mainImage.url}
        />
      ) : (
        <div className="aspect-square bg-muted" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 font-semibold">{product.description}</h3>
        <p className="text-sm font-medium text-primary">
          {formatMoneyFromCents(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
}
