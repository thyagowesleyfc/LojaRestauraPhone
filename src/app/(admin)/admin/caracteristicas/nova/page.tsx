import Link from "next/link";

import { createCharacteristicAction } from "@/actions/characteristics";
import { CharacteristicForm } from "@/components/admin/characteristic-form";
import { FormError } from "@/components/admin/form-error";
import { Button } from "@/components/ui/button";

type NewCharacteristicPageProps = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

export default async function NewCharacteristicPage({
  searchParams
}: NewCharacteristicPageProps) {
  const { erro } = await searchParams;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Nova caracteristica</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre uma caracteristica e seus valores possiveis.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/caracteristicas">Voltar</Link>
        </Button>
      </div>
      <FormError message={erro} />
      <CharacteristicForm action={createCharacteristicAction} submitLabel="Salvar" />
    </section>
  );
}