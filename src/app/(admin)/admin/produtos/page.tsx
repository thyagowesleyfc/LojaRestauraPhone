/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { deleteProductAction } from "@/actions/catalog";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { Button } from "@/components/ui/button";
import { formatMoneyFromCents } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { erro } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        take: 1
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Produtos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie itens, precos, imagens e status publico.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/produtos/novo">Novo produto</Link>
          </Button>
        </div>
      </div>
      {erro ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="grid gap-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[120px_1fr_auto]"
          >
            {product.images[0] ? (
              <img
                alt={product.images[0].altText ?? product.description}
                className="aspect-square w-full rounded-md object-cover md:w-[120px]"
                src={product.images[0].url}
              />
            ) : (
              <div className="aspect-square rounded-md bg-muted md:w-[120px]" />
            )}
            <div className="space-y-1">
              <h2 className="font-semibold">{product.description}</h2>
              <p className="text-sm text-muted-foreground">
                {product.category.name} Â·{" "}
                {formatMoneyFromCents(product.priceInCents)}
              </p>
              <p className="text-sm">
                {product.active ? "Ativo" : "Inativo"}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/produtos/${product.id}/editar`}>
                  Editar
                </Link>
              </Button>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
                <Button type="submit" size="sm" variant="destructive">
                  Excluir
                </Button>
              </form>
            </div>
          </article>
        ))}
        {products.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhum produto cadastrado.
          </p>
        ) : null}
      </div>
    </section>
  );
}
