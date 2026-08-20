import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCharacteristicAction } from "@/actions/characteristics";
import { CharacteristicForm } from "@/components/admin/characteristic-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type EditCharacteristicPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function EditCharacteristicPage({
  params,
  searchParams
}: EditCharacteristicPageProps) {
  const [{ id }, { erro }] = await Promise.all([params, searchParams]);
  const characteristic = await prisma.characteristic.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
      }
    }
  });

  if (!characteristic) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Editar caracteristica</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize nome, slug, status e opcoes disponiveis.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/caracteristicas">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <CharacteristicForm
        action={updateCharacteristicAction}
        characteristic={characteristic}
        submitLabel="Atualizar"
      />
    </section>
  );
}