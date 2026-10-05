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
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="w-[32%] px-3 py-3 font-medium md:w-auto md:px-4">Nome</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Slug</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Opções</th>
              <th className="w-[18%] px-2 py-3 text-center text-xs font-medium md:w-auto md:px-4 md:text-left md:text-sm"><span className="md:hidden">Cat.</span><span className="hidden md:inline">Categorias</span></th>
              <th className="w-[22%] px-2 py-3 text-xs font-medium md:w-auto md:px-4 md:text-sm">Status</th>
              <th className="w-[28%] px-2 py-3 font-medium md:w-auto md:px-4">Ações</th>
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
                  <td className="w-[32%] break-words px-3 py-3 font-medium md:w-auto md:px-4">
                    {characteristic.name}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {characteristic.slug}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{characteristic._count.options}</td>
                  <td className="w-[18%] px-2 py-3 text-center md:w-auto md:px-4 md:text-left">
                    {characteristic._count.categories}
                  </td>
                  <td className="w-[22%] px-2 py-3 text-xs md:w-auto md:px-4 md:text-sm">
                    <div className="space-y-1">
                      <p>{characteristic.active ? "Ativa" : "Inativa"}</p>
                      {disabledReason ? (
                        <p className="hidden text-xs text-muted-foreground md:block">
                          Exclusão bloqueada: {disabledReason}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="w-[28%] px-2 py-3 md:w-auto md:px-4">
                    <div className="grid gap-2 md:flex md:flex-wrap">
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
