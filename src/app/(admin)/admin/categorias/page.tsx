import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { CategoryDeleteDialog } from "@/components/admin/category-delete-dialog";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type CategoriesPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

function getCategoryBlockers(category: {
  _count: {
    characteristics: number;
    products: number;
    promotions: number;
  };
}) {
  return [
    category._count.products > 0
      ? `${category._count.products} produto${category._count.products > 1 ? "s" : ""}`
      : null,
    category._count.promotions > 0
      ? `${category._count.promotions} ${category._count.promotions > 1 ? "promoções" : "promoção"}`
      : null,
    category._count.characteristics > 0
      ? `${category._count.characteristics} característica${category._count.characteristics > 1 ? "s" : ""}`
      : null
  ].filter(Boolean);
}

export default async function CategoriesPage({
  searchParams
}: CategoriesPageProps) {
  const { erro } = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          characteristics: true,
          products: true,
          promotions: true
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
            Ordene e controle a exibição pública das categorias.
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
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="w-[42%] px-3 py-3 font-medium md:w-auto md:px-4">Nome</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Ordem
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell md:w-[11rem]">Status</th>
              <th className="w-[22%] px-2 py-3 text-center text-xs font-medium md:w-auto md:px-4 md:text-left md:text-sm">Produtos</th>
              <th className="w-[36%] px-2 py-3 font-medium md:w-auto md:px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const blockers = getCategoryBlockers(category);
              const disabledReason = blockers.length
                ? `Vinculada a ${blockers.join(" e ")}.`
                : undefined;

              return (
                <tr key={category.id} className="border-t border-border">
                  <td className="w-[42%] break-words px-3 py-3 font-medium md:w-auto md:px-4">{category.name}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {category.displayOrder}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell md:w-[11rem]">
                    <div className="space-y-1">
                      <p>{category.active ? "Ativa" : "Inativa"}</p>
                      {disabledReason ? (
                        <p className="text-xs text-muted-foreground">
                          Exclusão bloqueada: {disabledReason}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="w-[22%] px-2 py-3 text-center md:w-auto md:px-4 md:text-left">{category._count.products}</td>
                  <td className="w-[36%] px-2 py-3 md:w-auto md:px-4">
                    <div className="grid gap-2 md:flex md:flex-wrap">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/categorias/${category.id}/editar`}>
                          Editar
                        </Link>
                      </Button>
                      <CategoryDeleteDialog
                        canDelete={blockers.length === 0}
                        categoryId={category.id}
                        categoryName={category.name}
                        disabledReason={disabledReason}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
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
