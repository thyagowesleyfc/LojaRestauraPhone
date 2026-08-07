import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
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
      category: true,
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid gap-4 sm:grid-cols-2">
        {product.images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
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
          <p className="text-2xl font-semibold text-primary">
            {formatMoneyFromCents(product.priceInCents)}
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold">Especificacao</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {product.specification}
          </p>
        </div>
        <Button disabled>Adicionar ao carrinho</Button>
      </section>
    </main>
  );
}
