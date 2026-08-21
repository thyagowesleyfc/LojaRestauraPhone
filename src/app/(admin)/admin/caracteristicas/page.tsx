import Link from "next/link";

import { deleteCharacteristicAction } from "@/actions/characteristics";
import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type CharacteristicsPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function CharacteristicsPage({
  searchParams
}: CharacteristicsPageProps) {
  const { erro } = await searchParams;
  const characteristics = await prisma.characteristic.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          options: true,
          categories: true,
          values: true
        }
      }
    }
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Caracteristicas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie atributos reutilizaveis para formar SKUs por produto.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/caracteristicas/nova">Nova caracteristica</Link>
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
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Opcoes</th>
              <th className="px-4 py-3 font-medium">Categorias</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {characteristics.map((characteristic) => (
              <tr key={characteristic.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{characteristic.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{characteristic.slug}</td>
                <td className="px-4 py-3">{characteristic._count.options}</td>
                <td className="px-4 py-3">{characteristic._count.categories}</td>
                <td className="px-4 py-3">
                  {characteristic.active ? "Ativa" : "Inativa"}
                </td>
                <td className="flex flex-wrap gap-2 px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/caracteristicas/${characteristic.id}/editar`}>
                      Editar
                    </Link>
                  </Button>
                  <form action={deleteCharacteristicAction}>
                    <input type="hidden" name="id" value={characteristic.id} />
                    <Button type="submit" size="sm" variant="destructive">
                      Excluir
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {characteristics.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  Nenhuma caracteristica cadastrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
