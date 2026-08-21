import Link from "next/link";

import { deleteCategoryAction } from "@/actions/catalog";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type CategoriesPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function CategoriesPage({
  searchParams
}: CategoriesPageProps) {
  const { erro } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          products: true
        }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Categorias</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ordene e controle a exibicao publica das categorias.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/categorias/nova">Nova categoria</Link>
          </Button>
        </div>
      </div>
      {erro ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Ordem</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Produtos</th>
              <th className="px-4 py-3 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3">{category.displayOrder}</td>
                <td className="px-4 py-3">
                  {category.active ? "Ativa" : "Inativa"}
                </td>
                <td className="px-4 py-3">{category._count.products}</td>
                <td className="flex flex-wrap gap-2 px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/categorias/${category.id}/editar`}>
                      Editar
                    </Link>
                  </Button>
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button type="submit" size="sm" variant="destructive">
                      Excluir
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
