import Link from "next/link";

import { AdminDashboardLink } from "@/components/admin/admin-dashboard-link";
import { CharacteristicDeleteDialog } from "@/components/admin/characteristic-delete-dialog";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type CharacteristicsPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

function getCharacteristicBlockers(characteristic: {
  _count: {
    categories: number;
    options: number;
    values: number;
  };
}) {
  return [
    characteristic._count.options > 0
      ? `${characteristic._count.options} ${characteristic._count.options > 1 ? "opções" : "opção"}`
      : null,
    characteristic._count.categories > 0
      ? `${characteristic._count.categories} categoria${characteristic._count.categories > 1 ? "s" : ""}`
      : null,
    characteristic._count.values > 0
      ? `${characteristic._count.values} SKU${characteristic._count.values > 1 ? "s" : ""}`
      : null
  ].filter(Boolean);
}

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
          <h1 className="text-3xl font-semibold">Características</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie atributos reutilizáveis para formar SKUs por produto.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminDashboardLink />
          <Button asChild>
            <Link href="/admin/caracteristicas/nova">Nova característica</Link>
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
              <th className="px-4 py-3 font-medium">Opções</th>
              <th className="px-4 py-3 font-medium">Categorias</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {characteristics.map((characteristic) => {
              const blockers = getCharacteristicBlockers(characteristic);
              const disabledReason = blockers.length
                ? `Vinculada a ${blockers.join(" e ")}.`
                : undefined;

              return (
                <tr key={characteristic.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    {characteristic.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {characteristic.slug}
                  </td>
                  <td className="px-4 py-3">{characteristic._count.options}</td>
                  <td className="px-4 py-3">
                    {characteristic._count.categories}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p>{characteristic.active ? "Ativa" : "Inativa"}</p>
                      {disabledReason ? (
                        <p className="text-xs text-muted-foreground">
                          Exclusão bloqueada: {disabledReason}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/admin/caracteristicas/${characteristic.id}/editar`}
                        >
                          Editar
                        </Link>
                      </Button>
                      <CharacteristicDeleteDialog
                        canDelete={blockers.length === 0}
                        characteristicId={characteristic.id}
                        characteristicName={characteristic.name}
                        disabledReason={disabledReason}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {characteristics.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  Nenhuma característica cadastrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
