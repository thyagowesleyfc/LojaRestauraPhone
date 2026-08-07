import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      active: true
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: {
          active: true
        },
        orderBy: [{ createdAt: "desc" }],
        take: 4,
        include: {
          images: {
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            take: 1
          }
        }
      }
    }
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Catalogo
        </p>
        <h1 className="text-4xl font-semibold">Categorias</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Encontre acessorios, carregadores, cabos e itens selecionados para o
          seu aparelho.
        </p>
      </header>
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={`/categorias/${category.slug}`}>Ver categoria</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {category.products.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                Nenhum produto ativo nesta categoria.
              </p>
            ) : null}
          </section>
        ))}
        {categories.length === 0 ? (
          <p className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Nenhuma categoria ativa no momento.
          </p>
        ) : null}
      </div>
    </main>
  );
}
